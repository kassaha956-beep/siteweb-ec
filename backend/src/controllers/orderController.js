const crypto = require('crypto');
const { pool, withTransaction } = require('../config/db');
const { orderCreateSchema } = require('../validators');

function generateOrderReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BYD-${dateStr}-${randomStr}`;
}

// Customer: Place order without account
async function createOrder(req, res, next) {
  try {
    const validated = orderCreateSchema.parse(req.body);

    // 1. Fetch Wilaya to get authoritative delivery fee
    const [wilayaRows] = await pool.query(
      'SELECT id, name, delivery_fee, is_active FROM wilayas WHERE id = ?',
      [validated.wilaya_id]
    );

    if (wilayaRows.length === 0 || !wilayaRows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'Wilaya de livraison non disponible ou invalide.',
      });
    }

    const wilaya = wilayaRows[0];
    const deliveryFee = parseFloat(wilaya.delivery_fee);

    // 2. Fetch and validate all products & calculate subtotal on backend
    const productIds = validated.items.map(item => item.product_id);
    const [dbProducts] = await pool.query(
      `SELECT id, name, price, discount_price, cost_price, stock_quantity, is_active 
       FROM products 
       WHERE id IN (?)`,
      [productIds]
    );

    const productMap = new Map();
    for (const prod of dbProducts) {
      productMap.set(prod.id, prod);
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of validated.items) {
      const dbProd = productMap.get(item.product_id);
      if (!dbProd || !dbProd.is_active) {
        return res.status(400).json({
          success: false,
          message: `Le produit "${dbProd ? dbProd.name : '#' + item.product_id}" n'est plus disponible.`,
        });
      }

      if (dbProd.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${dbProd.name}". Quantité disponible: ${dbProd.stock_quantity}.`,
        });
      }

      const effectivePrice = dbProd.discount_price !== null && parseFloat(dbProd.discount_price) > 0
        ? parseFloat(dbProd.discount_price)
        : parseFloat(dbProd.price);

      const costPrice = parseFloat(dbProd.cost_price || 0);
      const itemTotal = effectivePrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        product_id: dbProd.id,
        product_name: dbProd.name,
        unit_price: effectivePrice,
        cost_price: costPrice,
        quantity: item.quantity,
        total_price: itemTotal,
      });
    }

    // 3. Handle Coupon validation if supplied
    let discountAmount = 0;
    let couponId = null;

    if (validated.coupon_code && validated.coupon_code.trim() !== '') {
      const code = validated.coupon_code.trim().toUpperCase();
      const [couponRows] = await pool.query(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
        [code]
      );

      if (couponRows.length > 0) {
        const c = couponRows[0];
        const isNotExpired = !c.expires_at || new Date(c.expires_at) > new Date();
        const hasUsesLeft = c.max_uses === null || c.current_uses < c.max_uses;
        const meetsMinAmount = calculatedSubtotal >= parseFloat(c.min_order_amount);

        if (isNotExpired && hasUsesLeft && meetsMinAmount) {
          couponId = c.id;
          if (c.discount_type === 'percentage') {
            discountAmount = Math.round((calculatedSubtotal * parseFloat(c.discount_value)) / 100);
          } else {
            discountAmount = Math.min(parseFloat(c.discount_value), calculatedSubtotal);
          }
        }
      }
    }

    const finalTotal = Math.max(0, calculatedSubtotal - discountAmount + deliveryFee);
    const orderRef = generateOrderReference();

    // 4. Run order creation in database transaction
    const orderId = await withTransaction(async (conn) => {
      // Upsert customer record
      const [custRows] = await conn.query('SELECT id, total_orders FROM customers WHERE phone = ?', [validated.phone]);
      let customerId;
      if (custRows.length > 0) {
        customerId = custRows[0].id;
        await conn.query(
          'UPDATE customers SET full_name = ?, wilaya_id = ?, commune = ?, address = ?, total_orders = total_orders + 1 WHERE id = ?',
          [validated.full_name, validated.wilaya_id, validated.commune, validated.address, customerId]
        );
      } else {
        const [cRes] = await conn.query(
          'INSERT INTO customers (full_name, phone, wilaya_id, commune, address, total_orders) VALUES (?, ?, ?, ?, ?, 1)',
          [validated.full_name, validated.phone, validated.wilaya_id, validated.commune, validated.address]
        );
        customerId = cRes.insertId;
      }

      // Insert Order
      const [oRes] = await conn.query(
        `INSERT INTO orders 
         (order_reference, customer_id, wilaya_id, full_name, phone, commune, address, order_notes, status, subtotal, discount_amount, delivery_fee, total_amount, coupon_id, stock_deducted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 0)`,
        [
          orderRef,
          customerId,
          validated.wilaya_id,
          validated.full_name,
          validated.phone,
          validated.commune,
          validated.address,
          validated.order_notes || null,
          calculatedSubtotal,
          discountAmount,
          deliveryFee,
          finalTotal,
          couponId,
        ]
      );
      const newOrderId = oRes.insertId;

      // Insert Order Items
      for (const item of validatedItems) {
        await conn.query(
          `INSERT INTO order_items 
           (order_id, product_id, product_name, unit_price, cost_price, quantity, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newOrderId,
            item.product_id,
            item.product_name,
            item.unit_price,
            item.cost_price,
            item.quantity,
            item.total_price,
          ]
        );
      }

      // Insert Delivery record
      await conn.query(
        'INSERT INTO deliveries (order_id, wilaya_id, courier_name, status) VALUES (?, ?, ?, ?)',
        [newOrderId, validated.wilaya_id, 'Livraison à Domicile', 'preparing']
      );

      // Insert Payment record
      await conn.query(
        'INSERT INTO payments (order_id, payment_method, payment_status, amount) VALUES (?, ?, ?, ?)',
        [newOrderId, 'COD', 'pending', finalTotal]
      );

      // Update coupon usages if applied
      if (couponId) {
        await conn.query('UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?', [couponId]);
        await conn.query(
          'INSERT INTO coupon_usages (coupon_id, order_id, discount_applied) VALUES (?, ?, ?)',
          [couponId, newOrderId, discountAmount]
        );
      }

      return newOrderId;
    });

    return res.status(201).json({
      success: true,
      message: 'Votre commande a été enregistrée avec succès.',
      order: {
        id: orderId,
        order_reference: orderRef,
        full_name: validated.full_name,
        phone: validated.phone,
        wilaya: wilaya.name,
        commune: validated.commune,
        address: validated.address,
        subtotal: calculatedSubtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        items: validatedItems,
        status: 'pending',
      },
    });
  } catch (err) {
    next(err);
  }
}

// Customer: Track order by reference & phone (secure, no cross-customer exposure)
async function trackOrder(req, res, next) {
  try {
    const { reference, phone } = req.query;

    if (!reference || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez saisir votre référence de commande et votre numéro de téléphone.',
      });
    }

    const cleanRef = reference.trim().toUpperCase();
    const cleanPhone = phone.trim();

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.order_reference,
        o.status,
        o.full_name,
        o.phone,
        o.commune,
        o.address,
        o.subtotal,
        o.discount_amount,
        o.delivery_fee,
        o.total_amount,
        o.created_at,
        w.name as wilaya_name,
        d.status as delivery_status,
        d.tracking_number,
        d.courier_name,
        d.delivered_at
       FROM orders o
       LEFT JOIN wilayas w ON o.wilaya_id = w.id
       LEFT JOIN deliveries d ON o.id = d.order_id
       WHERE o.order_reference = ? AND o.phone = ?`,
      [cleanRef, cleanPhone]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune commande ne correspond à cette référence et ce numéro de téléphone.',
      });
    }

    const order = orders[0];

    // Fetch items
    const [items] = await pool.query(
      `SELECT oi.id, oi.product_id, oi.product_name, oi.unit_price, oi.quantity, oi.total_price,
              (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, id ASC LIMIT 1) as image_url
       FROM order_items oi
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

// Admin: List all orders with filters
async function getAdminOrders(req, res, next) {
  try {
    const {
      page = 1,
      limit = 15,
      search,
      status,
      wilaya_id,
      date_from,
      date_to,
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const countParams = [];
    let whereClauses = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      whereClauses.push('(o.order_reference LIKE ? OR o.full_name LIKE ? OR o.phone LIKE ?)');
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    if (status) {
      whereClauses.push('o.status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (wilaya_id) {
      whereClauses.push('o.wilaya_id = ?');
      params.push(parseInt(wilaya_id, 10));
      countParams.push(parseInt(wilaya_id, 10));
    }

    if (date_from) {
      whereClauses.push('o.created_at >= ?');
      params.push(date_from);
      countParams.push(date_from);
    }

    if (date_to) {
      whereClauses.push('o.created_at <= ?');
      params.push(`${date_to} 23:59:59`);
      countParams.push(`${date_to} 23:59:59`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(o.id) as total FROM orders o ${whereSql}`,
      countParams
    );
    const total = countRows[0].total;

    const query = `
      SELECT 
        o.*,
        w.name as wilaya_name,
        d.status as delivery_status,
        d.tracking_number,
        p.payment_status,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN wilayas w ON o.wilaya_id = w.id
      LEFT JOIN deliveries d ON o.id = d.order_id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereSql}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit, 10), parseInt(offset, 10));
    const [orders] = await pool.query(query, params);

    return res.json({
      success: true,
      data: orders,
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

// Admin: Get single order by id
async function getAdminOrder(req, res, next) {
  try {
    const { id } = req.params;

    const [orderRows] = await pool.query(
      `SELECT 
        o.*,
        w.name as wilaya_name,
        w.code as wilaya_code,
        c.code as coupon_code,
        c.discount_type as coupon_discount_type,
        c.discount_value as coupon_discount_value,
        d.status as delivery_status,
        d.tracking_number,
        d.courier_name,
        d.delivered_at,
        p.payment_status,
        p.payment_method
       FROM orders o
       LEFT JOIN wilayas w ON o.wilaya_id = w.id
       LEFT JOIN coupons c ON o.coupon_id = c.id
       LEFT JOIN deliveries d ON o.id = d.order_id
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    const order = orderRows[0];

    const [items] = await pool.query(
      `SELECT 
        oi.*,
        p.sku,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, id ASC LIMIT 1) as image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;

    return res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

// Admin: Update order status & manage inventory deductions/restorations
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, tracking_number, courier_name, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de commande invalide.',
      });
    }

    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    const currentOrder = orderRows[0];
    const previousStatus = currentOrder.status;
    const isCurrentlyStockDeducted = currentOrder.stock_deducted === 1;

    // Fetch order items to manage inventory
    const [items] = await pool.query(
      'SELECT product_id, product_name, quantity FROM order_items WHERE order_id = ?',
      [id]
    );

    await withTransaction(async (conn) => {
      // 1. Stock Deduction Logic:
      // If moving to confirmed/processing/shipped/delivered and stock has NOT been deducted yet
      const needsDeduction = ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) && !isCurrentlyStockDeducted;
      
      if (needsDeduction) {
        // Validate stock for all products first
        for (const item of items) {
          const [p] = await conn.query('SELECT stock_quantity, name FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
          if (p.length === 0 || p[0].stock_quantity < item.quantity) {
            throw new Error(`Stock insuffisant pour le produit "${item.product_name}". Stock actuel: ${p.length ? p[0].stock_quantity : 0}`);
          }
        }

        // Deduct stock exactly once and record movement
        for (const item of items) {
          const [p] = await conn.query('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
          const prevStock = p[0].stock_quantity;
          const newStock = prevStock - item.quantity;

          await conn.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product_id]);

          await conn.query(
            `INSERT INTO inventory_movements (product_id, admin_id, movement_type, quantity, previous_stock, new_stock, reason)
             VALUES (?, ?, 'order_deduction', ?, ?, ?, ?)`,
            [
              item.product_id,
              req.admin ? req.admin.id : null,
              item.quantity,
              prevStock,
              newStock,
              `Déduction stock pour confirmation de commande #${currentOrder.order_reference}`,
            ]
          );
        }

        await conn.query('UPDATE orders SET stock_deducted = 1 WHERE id = ?', [id]);
      }

      // 2. Stock Restoration Logic:
      // If moving to cancelled and stock WAS previously deducted
      const needsRestoration = status === 'cancelled' && isCurrentlyStockDeducted;

      if (needsRestoration) {
        for (const item of items) {
          const [p] = await conn.query('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
          const prevStock = p[0].stock_quantity;
          const newStock = prevStock + item.quantity;

          await conn.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product_id]);

          await conn.query(
            `INSERT INTO inventory_movements (product_id, admin_id, movement_type, quantity, previous_stock, new_stock, reason)
             VALUES (?, ?, 'order_restoration', ?, ?, ?, ?)`,
            [
              item.product_id,
              req.admin ? req.admin.id : null,
              item.quantity,
              prevStock,
              newStock,
              `Restitution de stock suite à l'annulation de la commande #${currentOrder.order_reference}`,
            ]
          );
        }

        await conn.query('UPDATE orders SET stock_deducted = 0 WHERE id = ?', [id]);
      }

      // 3. Update Order Status
      await conn.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      // 4. Update Delivery and Payment statuses
      let deliveryStatus = 'preparing';
      if (status === 'shipped') deliveryStatus = 'in_transit';
      if (status === 'delivered') deliveryStatus = 'delivered';
      if (status === 'cancelled') deliveryStatus = 'failed';

      await conn.query(
        `UPDATE deliveries SET 
          status = ?, 
          tracking_number = COALESCE(?, tracking_number),
          courier_name = COALESCE(?, courier_name),
          delivered_at = CASE WHEN ? = 'delivered' THEN NOW() ELSE delivered_at END,
          notes = COALESCE(?, notes)
         WHERE order_id = ?`,
        [deliveryStatus, tracking_number || null, courier_name || null, status, notes || null, id]
      );

      let paymentStatus = 'pending';
      if (status === 'delivered') paymentStatus = 'paid';
      if (status === 'cancelled') paymentStatus = 'cancelled';

      await conn.query(
        `UPDATE payments SET 
          payment_status = ?,
          paid_at = CASE WHEN ? = 'paid' THEN NOW() ELSE paid_at END
         WHERE order_id = ?`,
        [paymentStatus, paymentStatus, id]
      );
    });

    return res.json({
      success: true,
      message: `Statut de la commande mis à jour: ${status}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  trackOrder,
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
};
