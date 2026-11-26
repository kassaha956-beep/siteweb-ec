const { pool, withTransaction } = require('../config/db');
const { productSchema } = require('../validators');
const { getSuggestedProducts, parsePositiveIntList } = require('../services/recommendationService');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Public / Admin: Get products with filters & pagination
async function getProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      min_price,
      max_price,
      sort = 'newest',
      featured,
      in_stock,
      admin = 'false',
    } = req.query;

    const isAdmin = admin === 'true';
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const countParams = [];

    let whereClauses = [];

    if (!isAdmin) {
      whereClauses.push('p.is_active = 1');
    }

    if (category) {
      const isNum = /^\d+$/.test(category);
      if (isNum) {
        whereClauses.push('p.category_id = ?');
        params.push(parseInt(category, 10));
        countParams.push(parseInt(category, 10));
      } else {
        whereClauses.push('c.slug = ?');
        params.push(category);
        countParams.push(category);
      }
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push('(p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
      params.push(term, term, term, term);
      countParams.push(term, term, term, term);
    }

    if (min_price) {
      whereClauses.push('COALESCE(p.discount_price, p.price) >= ?');
      params.push(parseFloat(min_price));
      countParams.push(parseFloat(min_price));
    }

    if (max_price) {
      whereClauses.push('COALESCE(p.discount_price, p.price) <= ?');
      params.push(parseFloat(max_price));
      countParams.push(parseFloat(max_price));
    }

    if (featured === 'true' || featured === '1') {
      whereClauses.push('p.is_featured = 1');
    }

    if (in_stock === 'true') {
      whereClauses.push('p.stock_quantity > 0');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sorting
    let orderSql = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderSql = 'ORDER BY COALESCE(p.discount_price, p.price) ASC';
    } else if (sort === 'price_desc') {
      orderSql = 'ORDER BY COALESCE(p.discount_price, p.price) DESC';
    } else if (sort === 'popularity') {
      orderSql = 'ORDER BY p.views_count DESC, p.id DESC';
    } else if (sort === 'name_asc') {
      orderSql = 'ORDER BY p.name ASC';
    }

    // Count query
    const countQuery = `
      SELECT COUNT(p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
    `;
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    // Main query
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, display_order ASC, id ASC 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [products] = await pool.query(query, params);

    return res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Public: Get featured products
async function getFeaturedProducts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '8', 10);
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT image_url 
          FROM product_images 
          WHERE product_id = p.id 
          ORDER BY is_primary DESC, display_order ASC, id ASC 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.views_count DESC, p.created_at DESC
      LIMIT ?
    `;
    const [products] = await pool.query(query, [limit]);
    return res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

// Public: Get product by slug or id + increment views
async function getProduct(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const isNum = /^\d+$/.test(idOrSlug);

    const [products] = await pool.query(
      `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isNum ? 'p.id' : 'p.slug'} = ?
    `,
      [idOrSlug]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    const product = products[0];

    // Increment views silently
    pool.query('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [product.id]).catch(() => {});

    // Fetch images
    const [images] = await pool.query(
      'SELECT id, image_url, is_primary, display_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC, id ASC',
      [product.id]
    );
    product.images = images;

    // Fetch intelligent purchase-based & similarity suggestions
    product.related_products = await getSuggestedProducts({
      productIds: [product.id],
      limit: 4,
    });

    return res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// Public: Get product suggestions based on co-purchased & related products
async function getProductSuggestions(req, res, next) {
  try {
    const { productId, productIds, excludeIds, limit = 4 } = req.query;
    const anchorIds = parsePositiveIntList([
      ...parsePositiveIntList(productId),
      ...parsePositiveIntList(productIds),
    ]);
    const excluded = parsePositiveIntList(excludeIds);

    const suggestions = await getSuggestedProducts({
      productIds: anchorIds,
      excludeIds: excluded,
      limit: parseInt(limit, 10) || 4,
    });

    return res.json({
      success: true,
      data: suggestions,
      meta: {
        anchor_product_ids: anchorIds,
        count: suggestions.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Create product
async function createProduct(req, res, next) {
  try {
    const validated = productSchema.parse(req.body);

    let baseSlug = slugify(validated.name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const sku = validated.sku || `BYD-${Date.now().toString().slice(-6)}`;

    const result = await withTransaction(async (conn) => {
      // 1. Insert product
      const [pRes] = await conn.query(
        `INSERT INTO products 
         (category_id, name, slug, description, short_description, price, discount_price, cost_price, stock_quantity, sku, is_active, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validated.category_id,
          validated.name,
          slug,
          validated.description || '',
          validated.short_description || '',
          validated.price,
          validated.discount_price || null,
          validated.cost_price || 0,
          validated.stock_quantity || 0,
          sku,
          validated.is_active ? 1 : 0,
          validated.is_featured ? 1 : 0,
        ]
      );

      const productId = pRes.insertId;

      // 2. Insert images
      if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
        for (let i = 0; i < req.body.images.length; i++) {
          const imgUrl = req.body.images[i];
          if (imgUrl && typeof imgUrl === 'string') {
            await conn.query(
              'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
              [productId, imgUrl, i === 0 ? 1 : 0, i]
            );
          }
        }
      }

      // 3. Record initial stock in inventory_movements
      if (validated.stock_quantity > 0) {
        await conn.query(
          `INSERT INTO inventory_movements (product_id, admin_id, movement_type, quantity, previous_stock, new_stock, reason)
           VALUES (?, ?, 'in', ?, 0, ?, 'Stock initial lors de la création du produit')`,
          [productId, req.admin ? req.admin.id : null, validated.stock_quantity, validated.stock_quantity]
        );
      }

      return productId;
    });

    const [created] = await pool.query('SELECT * FROM products WHERE id = ?', [result]);
    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: created[0],
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Update product
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const validated = productSchema.parse(req.body);

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    const currentProduct = existing[0];

    let slug = currentProduct.slug;
    if (currentProduct.name !== validated.name) {
      let baseSlug = slugify(validated.name);
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const [conflict] = await pool.query('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, id]);
        if (conflict.length === 0) break;
        slug = `${baseSlug}-${counter++}`;
      }
    }

    await withTransaction(async (conn) => {
      // Check if stock changed directly
      const oldStock = currentProduct.stock_quantity;
      const newStock = validated.stock_quantity;
      if (oldStock !== newStock) {
        const diff = newStock - oldStock;
        await conn.query(
          `INSERT INTO inventory_movements (product_id, admin_id, movement_type, quantity, previous_stock, new_stock, reason)
           VALUES (?, ?, ?, ?, ?, ?, 'Mise à jour manuelle du stock')`,
          [
            id,
            req.admin ? req.admin.id : null,
            diff > 0 ? 'in' : 'out',
            Math.abs(diff),
            oldStock,
            newStock,
          ]
        );
      }

      // Update product table
      await conn.query(
        `UPDATE products SET 
          category_id = ?, 
          name = ?, 
          slug = ?, 
          description = ?, 
          short_description = ?, 
          price = ?, 
          discount_price = ?, 
          cost_price = ?, 
          stock_quantity = ?, 
          sku = ?, 
          is_active = ?, 
          is_featured = ?
        WHERE id = ?`,
        [
          validated.category_id,
          validated.name,
          slug,
          validated.description || '',
          validated.short_description || '',
          validated.price,
          validated.discount_price || null,
          validated.cost_price || 0,
          newStock,
          validated.sku || currentProduct.sku,
          validated.is_active ? 1 : 0,
          validated.is_featured ? 1 : 0,
          id,
        ]
      );

      // Replace images if provided
      if (req.body.images && Array.isArray(req.body.images)) {
        await conn.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        for (let i = 0; i < req.body.images.length; i++) {
          const imgUrl = req.body.images[i];
          if (imgUrl && typeof imgUrl === 'string') {
            await conn.query(
              'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)',
              [id, imgUrl, i === 0 ? 1 : 0, i]
            );
          }
        }
      }
    });

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Produit mis à jour avec succès.',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Delete product (soft-deactivate if product was already ordered)
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const [ordersCount] = await pool.query('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?', [id]);
    if (ordersCount[0].count > 0) {
      // Historical orders exist! Deactivate instead of hard delete to protect history
      await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Ce produit figure dans des commandes passées. Il a été désactivé pour préserver l\'intégrité des rapports financiers.',
      });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Produit supprimé définitivement avec succès.' });
  } catch (err) {
    next(err);
  }
}

// Image upload helper
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier image reçu.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      imageUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProduct,
  getProductSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
