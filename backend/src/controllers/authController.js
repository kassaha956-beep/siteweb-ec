const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { adminLoginSchema } = require('../validators');

async function login(req, res, next) {
  try {
    const validated = adminLoginSchema.parse(req.body);

    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, full_name, role, is_active FROM admins WHERE email = ?',
      [validated.email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.',
      });
    }

    const admin = rows[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte administrateur est désactivé.',
      });
    }

    const isMatch = await bcrypt.compare(validated.password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.',
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'biyodo_super_secret_jwt_key_2026_xyz!#secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie(process.env.COOKIE_NAME || 'biyodo_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Connexion réussie.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || 'biyodo_admin_token');
  return res.json({
    success: true,
    message: 'Déconnexion effectuée.',
  });
}

async function getMe(req, res) {
  return res.json({
    success: true,
    admin: req.admin,
  });
}

module.exports = {
  login,
  logout,
  getMe,
};
