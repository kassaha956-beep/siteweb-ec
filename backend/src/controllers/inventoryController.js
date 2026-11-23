const { pool, withTransaction } = require('../config/db');
const { inventoryAdjustSchema } = require('../validators');

// Admin: Get inventory status & alerts
async function getInventory(req, res, next) {
  try {
    const { filter = 'all', page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const countParams = [];

    let whereClauses = [];

    if (filter === 'low') {
      whereClauses.push('p.stock_quantity > 0 AND p.stock_quantity <= 10');
    } else if (filter === 'out') {
      whereClauses.push('p.stock_quantity <= 0');
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(term, term);
      countParams.push(term, term);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(p.id) as total FROM products p ${whereSql}`,
      countParams
    );
    const total = countRows[0].total;

    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.price,
        p.cost_price,
        p.is_active,
        c.name as category_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSql}
      ORDER BY p.stock_quantity ASC, p.name ASC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [products] = await pool.query(query, params);

    // Global summary numbers
    const [summary] = await pool.query(`
      SELECT 
        COUNT(id) as total_products,
        SUM(CASE WHEN stock_quantity <= 10 AND stock_quantity > 0 THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(stock_quantity) as total_units_in_stock,
        SUM(stock_quantity * cost_price) as total_stock_cost_value,
        SUM(stock_quantity * price) as total_stock_retail_value
      FROM products
    `);

    return res.json({
      success: true,
      summary: summary[0],
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

// Admin: Get inventory movements history
async function getMovements(req, res, next) {
  try {
    const { page = 1, limit = 20, product_id, type } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const countParams = [];
    let whereClauses = [];

    if (product_id) {
      whereClauses.push('im.product_id = ?');
      params.push(parseInt(product_id, 10));
      countParams.push(parseInt(product_id, 10));
    }

    if (type) {
      whereClauses.push('im.movement_type = ?');
      params.push(type);
      countParams.push(type);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(im.id) as total FROM inventory_movements im ${whereSql}`,
      countParams
    );
    const total = countRows[0].total;

    const query = `
      SELECT 
        im.*,
        p.name as product_name,
        p.sku as product_sku,
        a.full_name as admin_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN admins a ON im.admin_id = a.id
      ${whereSql}
      ORDER BY im.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [movements] = await pool.query(query, params);

    return res.json({
      success: true,
      data: movements,
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

// Admin: Manual stock adjustment
async function adjustStock(req, res, next) {
  try {
    const validated = inventoryAdjustSchema.parse(req.body);

    const result = await withTransaction(async (conn) => {
      const [pRows] = await conn.query('SELECT stock_quantity, name FROM products WHERE id = ? FOR UPDATE', [validated.product_id]);
      if (pRows.length === 0) {
        throw new Error('Produit introuvable.');
      }

      const prevStock = pRows[0].stock_quantity;
      let newStock = prevStock;

      if (validated.movement_type === 'in') {
        newStock = prevStock + validated.quantity;
      } else if (validated.movement_type === 'out') {
        if (prevStock < validated.quantity) {
          throw new Error(`Stock insuffisant pour retirer ${validated.quantity} unité(s). Stock actuel: ${prevStock}`);
        }
        newStock = prevStock - validated.quantity;
      } else if (validated.movement_type === 'adjustment') {
        newStock = validated.quantity;
      }

      await conn.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, validated.product_id]);

      await conn.query(
        `INSERT INTO inventory_movements (product_id, admin_id, movement_type, quantity, previous_stock, new_stock, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          validated.product_id,
          req.admin.id,
          validated.movement_type,
          validated.quantity,
          prevStock,
          newStock,
          validated.reason,
        ]
      );

      return { prevStock, newStock };
    });

    return res.json({
      success: true,
      message: 'Ajustement de stock enregistré avec succès.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInventory,
  getMovements,
  adjustStock,
};
