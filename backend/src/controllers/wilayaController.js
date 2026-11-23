const { pool } = require('../config/db');
const { wilayaUpdateSchema } = require('../validators');

// Public: List all active wilayas for customer checkout
async function getWilayas(req, res, next) {
  try {
    const isAdmin = req.query.admin === 'true';
    let query = 'SELECT * FROM wilayas';
    if (!isAdmin) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY CAST(code AS UNSIGNED) ASC';

    const [rows] = await pool.query(query);
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// Public: Get single wilaya delivery price
async function getWilayaDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM wilayas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Wilaya non trouvée.' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// Admin: Update delivery fee and status for a wilaya
async function updateWilaya(req, res, next) {
  try {
    const { id } = req.params;
    const validated = wilayaUpdateSchema.parse(req.body);

    const [existing] = await pool.query('SELECT id, name FROM wilayas WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Wilaya introuvable.' });
    }

    await pool.query(
      `UPDATE wilayas SET 
        delivery_fee = ?, 
        estimated_delivery_days = ?, 
        is_active = ? 
       WHERE id = ?`,
      [validated.delivery_fee, validated.estimated_delivery_days, validated.is_active ? 1 : 0, id]
    );

    const [updated] = await pool.query('SELECT * FROM wilayas WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: `Tarifs de livraison pour ${existing[0].name} mis à jour avec succès.`,
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWilayas,
  getWilayaDelivery,
  updateWilaya,
};
