const { pool } = require('../config/db');

const FRENCH_STOPWORDS = new Set([
  'avec', 'pour', 'dans', 'sans', 'tout', 'tous', 'toute', 'toutes',
  'une', 'des', 'les', 'aux', 'par', 'sur', 'sous', 'entre', 'chez',
  'etre', 'avoir', 'faire', 'plus', 'tres', 'bien', 'peau', 'soin',
  'soins', 'biyodo', 'produit', 'produits', 'qui', 'que', 'quoi',
  'dont', 'vous', 'votre', 'notre', 'nos', 'vos', 'leur', 'leurs',
  'cette', 'cet', 'ces', 'son', 'ses', 'mon', 'ton', 'mais', 'donc',
]);

function parsePositiveIntList(input) {
  if (!input) return [];
  const rawList = Array.isArray(input)
    ? input
    : String(input).split(',');
  const seen = new Set();
  const ids = [];
  for (const raw of rawList) {
    const parsed = parseInt(String(raw).trim(), 10);
    if (Number.isInteger(parsed) && parsed > 0 && !seen.has(parsed)) {
      seen.add(parsed);
      ids.push(parsed);
    }
  }
  return ids;
}

function tokenizeText(text) {
  if (!text) return new Set();
  const normalized = String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
  const tokens = new Set();
  for (const word of normalized.split(/\s+/)) {
    if (word.length >= 3 && !FRENCH_STOPWORDS.has(word)) {
      tokens.add(word);
    }
  }
  return tokens;
}

function getEffectivePrice(product) {
  const discount = product.discount_price !== null ? parseFloat(product.discount_price) : null;
  if (discount !== null && discount > 0) {
    return discount;
  }
  return parseFloat(product.price || 0);
}

function computeTokenSimilarity(anchorTokens, candidate) {
  if (anchorTokens.size === 0) return 0;
  const candidateTokens = tokenizeText(
    `${candidate.name || ''} ${candidate.short_description || ''} ${candidate.description || ''}`
  );
  if (candidateTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of candidateTokens) {
    if (anchorTokens.has(token)) overlap += 1;
  }
  if (overlap === 0) return 0;

  const union = anchorTokens.size + candidateTokens.size - overlap;
  return union > 0 ? overlap / union : 0;
}

function buildReasonMetadata({ coOrderCount, coCustomerCount, sameCategory }) {
  if (coOrderCount > 0) {
    return {
      suggestion_reason_type: 'co_purchase',
      suggestion_reason:
        coOrderCount > 1
          ? `Souvent acheté ensemble (${coOrderCount} commandes)`
          : 'Souvent acheté ensemble',
    };
  }
  if (coCustomerCount > 0) {
    return {
      suggestion_reason_type: 'customer_affinity',
      suggestion_reason: 'Acheté par les mêmes clientes',
    };
  }
  if (sameCategory) {
    return {
      suggestion_reason_type: 'category_match',
      suggestion_reason: 'Dans le même univers beauté',
    };
  }
  return {
    suggestion_reason_type: 'routine_match',
    suggestion_reason: 'Complète votre rituel',
  };
}

/**
 * Hybrid Purchase-Based Product Suggestion Algorithm:
 * 1. Same-order co-purchase collaborative filtering (orders + order_items)
 * 2. Same-customer cross-order purchase affinity
 * 3. Global purchase popularity across non-cancelled orders
 * 4. Content similarity (shared category, botanical/text tokens, price tier proximity)
 *
 * Only suggests active, in-stock products and excludes anchor/excluded IDs.
 */
async function getSuggestedProducts({ productIds = [], excludeIds = [], limit = 4 } = {}) {
  const anchorIds = parsePositiveIntList(productIds);
  const extraExcluded = parsePositiveIntList(excludeIds);
  const excludedSet = new Set([...anchorIds, ...extraExcluded]);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 4, 1), 12);

  // Fetch all active, in-stock candidate products
  const [allActiveProducts] = await pool.query(
    `SELECT
      p.*,
      c.name AS category_name,
      c.slug AS category_slug,
      (
        SELECT image_url
        FROM product_images
        WHERE product_id = p.id
        ORDER BY is_primary DESC, display_order ASC, id ASC
        LIMIT 1
      ) AS primary_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 AND p.stock_quantity > 0`
  );

  const candidates = allActiveProducts.filter((p) => !excludedSet.has(p.id));
  if (candidates.length === 0) {
    return [];
  }

  // Global purchase popularity across non-cancelled orders
  const [globalSalesRows] = await pool.query(
    `SELECT
      oi.product_id,
      COUNT(DISTINCT oi.order_id) AS order_count,
      SUM(oi.quantity) AS units_sold
    FROM order_items oi
    INNER JOIN orders o ON o.id = oi.order_id
    WHERE o.status != 'cancelled'
    GROUP BY oi.product_id`
  );

  const globalSalesMap = new Map();
  for (const row of globalSalesRows) {
    globalSalesMap.set(row.product_id, {
      orderCount: Number(row.order_count || 0),
      unitsSold: Number(row.units_sold || 0),
    });
  }

  // Cold-start / no anchor product provided -> rank by purchase popularity & featured status
  if (anchorIds.length === 0) {
    return candidates
      .map((cand) => {
        const sales = globalSalesMap.get(cand.id) || { orderCount: 0, unitsSold: 0 };
        const score =
          sales.orderCount * 10 +
          sales.unitsSold * 2 +
          (cand.is_featured ? 5 : 0) +
          Math.min(Number(cand.views_count || 0) * 0.05, 5);
        return {
          ...cand,
          co_purchase_count: 0,
          suggestion_score: Number(score.toFixed(2)),
          suggestion_reason_type: sales.orderCount > 0 ? 'best_seller' : 'routine_match',
          suggestion_reason: sales.orderCount > 0 ? 'Soin plébiscité' : 'Sélection BIYODO',
        };
      })
      .sort((a, b) => b.suggestion_score - a.suggestion_score || b.id - a.id)
      .slice(0, safeLimit);
  }

  // Fetch anchor product details (even if an anchor is currently inactive/out-of-stock)
  const [anchorProducts] = await pool.query(
    `SELECT id, category_id, price, discount_price, name, short_description, description
     FROM products
     WHERE id IN (?)`,
    [anchorIds]
  );

  const anchorCategoryIds = new Set(anchorProducts.map((p) => p.category_id).filter(Boolean));
  const anchorTokens = new Set();
  let priceSum = 0;
  for (const ap of anchorProducts) {
    priceSum += getEffectivePrice(ap);
    for (const token of tokenizeText(`${ap.name || ''} ${ap.short_description || ''} ${ap.description || ''}`)) {
      anchorTokens.add(token);
    }
  }
  const avgAnchorPrice = anchorProducts.length > 0 ? priceSum / anchorProducts.length : 0;

  // 1. Same-order co-purchase counts
  const [anchorOrderCountRows] = await pool.query(
    `SELECT COUNT(DISTINCT oi.order_id) AS total_anchor_orders
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     WHERE oi.product_id IN (?) AND o.status != 'cancelled'`,
    [anchorIds]
  );
  const totalAnchorOrders = Number(anchorOrderCountRows[0]?.total_anchor_orders || 0);

  const [coOrderRows] = await pool.query(
    `SELECT
      oi_cand.product_id,
      COUNT(DISTINCT oi_cand.order_id) AS co_order_count,
      SUM(oi_cand.quantity) AS co_units
    FROM order_items oi_anchor
    INNER JOIN orders o ON o.id = oi_anchor.order_id
    INNER JOIN order_items oi_cand ON oi_cand.order_id = oi_anchor.order_id
    WHERE oi_anchor.product_id IN (?)
      AND oi_cand.product_id NOT IN (?)
      AND o.status != 'cancelled'
    GROUP BY oi_cand.product_id`,
    [anchorIds, Array.from(excludedSet)]
  );

  const coOrderMap = new Map();
  for (const row of coOrderRows) {
    coOrderMap.set(row.product_id, {
      coOrderCount: Number(row.co_order_count || 0),
      coUnits: Number(row.co_units || 0),
    });
  }

  // 2. Same-customer cross-order affinity (different orders by same customer)
  const [coCustomerRows] = await pool.query(
    `SELECT
      oi_cand.product_id,
      COUNT(DISTINCT o_cand.customer_id) AS co_customer_count
    FROM order_items oi_anchor
    INNER JOIN orders o_anchor ON o_anchor.id = oi_anchor.order_id
    INNER JOIN orders o_cand ON o_cand.customer_id = o_anchor.customer_id
    INNER JOIN order_items oi_cand ON oi_cand.order_id = o_cand.id
    WHERE oi_anchor.product_id IN (?)
      AND oi_cand.product_id NOT IN (?)
      AND o_cand.id != o_anchor.id
      AND o_anchor.customer_id IS NOT NULL
      AND o_anchor.status != 'cancelled'
      AND o_cand.status != 'cancelled'
    GROUP BY oi_cand.product_id`,
    [anchorIds, Array.from(excludedSet)]
  );

  const coCustomerMap = new Map();
  for (const row of coCustomerRows) {
    coCustomerMap.set(row.product_id, Number(row.co_customer_count || 0));
  }

  // Score and rank candidates
  const scored = candidates.map((cand) => {
    const coOrder = coOrderMap.get(cand.id) || { coOrderCount: 0, coUnits: 0 };
    const coCustomerCount = coCustomerMap.get(cand.id) || 0;
    const globalSales = globalSalesMap.get(cand.id) || { orderCount: 0, unitsSold: 0 };

    const confidence =
      totalAnchorOrders > 0 ? coOrder.coOrderCount / totalAnchorOrders : 0;

    // Collaborative filtering score (strongest signal)
    const coPurchaseScore =
      coOrder.coOrderCount * 40 +
      confidence * 30 +
      Math.min(coOrder.coUnits, 20) * 1.5 +
      coCustomerCount * 15;

    // Content & category similarity (essential for cold-start and tie-breaking)
    const sameCategory = anchorCategoryIds.has(cand.category_id);
    const categoryScore = sameCategory ? 14 : 0;
    const tokenScore = computeTokenSimilarity(anchorTokens, cand) * 12;

    const candPrice = getEffectivePrice(cand);
    const priceProximityScore =
      avgAnchorPrice > 0
        ? (1 - Math.min(1, Math.abs(candPrice - avgAnchorPrice) / avgAnchorPrice)) * 6
        : 0;

    // Global purchase popularity & engagement
    const popularityScore =
      Math.min(globalSales.orderCount * 2.5 + globalSales.unitsSold * 0.5, 15) +
      (cand.is_featured ? 3 : 0) +
      Math.min(Number(cand.views_count || 0) * 0.05, 3);

    const totalScore =
      coPurchaseScore + categoryScore + tokenScore + priceProximityScore + popularityScore;

    const reasonMeta = buildReasonMetadata({
      coOrderCount: coOrder.coOrderCount,
      coCustomerCount,
      sameCategory,
    });

    return {
      ...cand,
      co_purchase_count: coOrder.coOrderCount,
      suggestion_score: Number(totalScore.toFixed(2)),
      ...reasonMeta,
    };
  });

  scored.sort(
    (a, b) =>
      b.suggestion_score - a.suggestion_score ||
      b.co_purchase_count - a.co_purchase_count ||
      Number(b.is_featured || 0) - Number(a.is_featured || 0) ||
      Number(b.views_count || 0) - Number(a.views_count || 0) ||
      a.id - b.id
  );

  return scored.slice(0, safeLimit);
}

module.exports = {
  getSuggestedProducts,
  parsePositiveIntList,
};
