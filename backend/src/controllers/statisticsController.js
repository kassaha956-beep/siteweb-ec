const { pool } = require('../config/db');

// Admin: High-level KPI overview
async function getOverview(req, res, next) {
  try {
    // 1. Order and revenue aggregates (excluding cancelled orders)
    const [orderStats] = await pool.query(`
      SELECT 
        COUNT(id) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total_amount ELSE NULL END), 0) as avg_order_value
      FROM orders
    `);

    // 2. Products and Stock stats
    const [productStats] = await pool.query(`
      SELECT 
        COUNT(id) as total_products,
        COALESCE(SUM(CASE WHEN stock_quantity <= 10 AND stock_quantity > 0 THEN 1 ELSE 0 END), 0) as low_stock_products,
        COALESCE(SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock_products,
        COALESCE(SUM(stock_quantity * cost_price), 0) as inventory_cost_valuation,
        COALESCE(SUM(stock_quantity * price), 0) as inventory_retail_valuation
      FROM products
    `);

    // 3. Total unique customers
    const [customerStats] = await pool.query('SELECT COUNT(id) as total_customers FROM customers');

    // 4. Gross Profit calculation from order_items for delivered/non-cancelled orders
    const [profitStats] = await pool.query(`
      SELECT 
        COALESCE(SUM(oi.total_price - (oi.cost_price * oi.quantity)), 0) as total_gross_profit
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
    `);

    // 5. Recent 5 orders
    const [recentOrders] = await pool.query(`
      SELECT 
        o.id,
        o.order_reference,
        o.full_name,
        o.phone,
        o.total_amount,
        o.status,
        o.created_at,
        w.name as wilaya_name
      FROM orders o
      LEFT JOIN wilayas w ON o.wilaya_id = w.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        ...orderStats[0],
        ...productStats[0],
        total_customers: customerStats[0].total_customers,
        total_gross_profit: profitStats[0].total_gross_profit,
      },
      recent_orders: recentOrders,
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Sales and revenue over time (daily / monthly chart data)
async function getSalesReports(req, res, next) {
  try {
    const { period = 'daily', limit = 30 } = req.query;

    let dateFormat = '%Y-%m-%d';
    if (period === 'monthly') {
      dateFormat = '%Y-%m';
    }

    const query = `
      SELECT 
        DATE_FORMAT(o.created_at, '${dateFormat}') as date_label,
        COUNT(o.id) as orders_count,
        COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN (
          SELECT COALESCE(SUM(oi.total_price - (oi.cost_price * oi.quantity)), 0)
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) ELSE 0 END), 0) as profit
      FROM orders o
      GROUP BY date_label
      ORDER BY date_label DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(query, [parseInt(limit, 10)]);

    return res.json({
      success: true,
      data: rows.reverse(), // chronologically ordered for charts
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Best selling products and category sales
async function getProductReports(req, res, next) {
  try {
    // Best selling products
    const [bestSellers] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        COALESCE(SUM(oi.total_price - (oi.cost_price * oi.quantity)), 0) as total_profit,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // Sales by category
    const [categorySales] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT o.id) as orders_count,
        COALESCE(SUM(oi.total_price), 0) as total_revenue
      FROM categories c
      INNER JOIN products p ON c.id = p.category_id
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `);

    return res.json({
      success: true,
      best_sellers: bestSellers,
      category_sales: categorySales,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getSalesReports,
  getProductReports,
};
