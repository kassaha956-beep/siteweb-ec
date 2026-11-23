const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function requireAdminAuth(req, res, next) {
  try {
    let token = null;

    // Check cookies first
    if (req.cookies && req.cookies[process.env.COOKIE_NAME || 'biyodo_admin_token']) {
      token = req.cookies[process.env.COOKIE_NAME || 'biyodo_admin_token'];
    }

    // Check Authorization header fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé. Veuillez vous connecter en tant qu'administrateur.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'biyodo_super_secret_jwt_key_2026_xyz!#secure');

    const [admins] = await pool.query(
      'SELECT id, username, email, full_name, role, is_active FROM admins WHERE id = ?',
      [decoded.id]
    );

    if (admins.length === 0 || !admins[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Compte administrateur inactif ou introuvable.',
      });
    }

    req.admin = admins[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expirée ou invalide. Veuillez vous reconnecter.',
    });
  }
}

module.exports = {
  requireAdminAuth,
};
