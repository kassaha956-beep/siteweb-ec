const { pool } = require('../config/db');
const { couponSchema } = require('../validators');

// Public: Validate coupon in cart/checkout
async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Code promo requis.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const currentSubtotal = parseFloat(subtotal || 0);

    const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ?', [cleanCode]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ce code promo n\'existe pas.' });
    }

    const coupon = rows[0];

    if (!coupon.is_active) {
      return res.status(400).json({ success: false, message: 'Ce code promo est inactif.' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Ce code promo a expiré.' });
    }

    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ success: false, message: 'Ce code promo a atteint sa limite maximale d\'utilisations.' });
    }

    if (currentSubtotal < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Montant minimum de panier requis pour ce code: ${parseFloat(coupon.min_order_amount).toLocaleString()} DA`,
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((currentSubtotal * parseFloat(coupon.discount_value)) / 100);
    } else {
      discountAmount = Math.min(parseFloat(coupon.discount_value), currentSubtotal);
    }

    return res.json({
      success: true,
      message: 'Code promo appliqué avec succès!',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: parseFloat(coupon.discount_value),
        discount_amount: discountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Admin: List all coupons
async function getCoupons(req, res, next) {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
}

// Admin: Create coupon
async function createCoupon(req, res, next) {
  try {
    const validated = couponSchema.parse(req.body);

    const [existing] = await pool.query('SELECT id FROM coupons WHERE code = ?', [validated.code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Un coupon avec ce code existe déjà.' });
    }

    const [result] = await pool.query(
      `INSERT INTO coupons 
       (code, discount_type, discount_value, min_order_amount, max_uses, is_active, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        validated.code,
        validated.discount_type,
        validated.discount_value,
        validated.min_order_amount,
        validated.max_uses || null,
        validated.is_active ? 1 : 0,
        validated.expires_at || null,
      ]
    );

    const [created] = await pool.query('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Coupon créé avec succès.',
      data: created[0],
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Update coupon
async function updateCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const validated = couponSchema.parse(req.body);

    const [existing] = await pool.query('SELECT id FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon introuvable.' });
    }

    const [conflict] = await pool.query('SELECT id FROM coupons WHERE code = ? AND id != ?', [validated.code, id]);
    if (conflict.length > 0) {
      return res.status(400).json({ success: false, message: 'Un coupon avec ce code existe déjà.' });
    }

    await pool.query(
      `UPDATE coupons SET 
        code = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        max_uses = ?,
        is_active = ?,
        expires_at = ?
       WHERE id = ?`,
      [
        validated.code,
        validated.discount_type,
        validated.discount_value,
        validated.min_order_amount,
        validated.max_uses || null,
        validated.is_active ? 1 : 0,
        validated.expires_at || null,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Coupon mis à jour avec succès.',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Delete coupon
async function deleteCoupon(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Coupon supprimé avec succès.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
