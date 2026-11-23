const { pool } = require('../config/db');
const { categorySchema } = require('../validators');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Public: Get all active categories with product counts
async function getCategories(req, res, next) {
  try {
    const isAdmin = req.query.admin === 'true';
    let query = `
      SELECT c.*, COUNT(p.id) as products_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
    `;
    if (!isAdmin) {
      query += ' WHERE c.is_active = 1 ';
    }
    query += ' GROUP BY c.id ORDER BY c.name ASC';

    const [rows] = await pool.query(query);
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// Public: Get single category by slug or id
async function getCategory(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const isNum = /^\d+$/.test(idOrSlug);

    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE ${isNum ? 'id' : 'slug'} = ?`,
      [idOrSlug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// Admin: Create category
async function createCategory(req, res, next) {
  try {
    const validated = categorySchema.parse(req.body);
    let baseSlug = slugify(validated.name);
    let slug = baseSlug;
    let counter = 1;

    // Check unique slug
    while (true) {
      const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image_url, is_active) VALUES (?, ?, ?, ?, ?)',
      [validated.name, slug, validated.description, validated.image_url, validated.is_active ? 1 : 0]
    );

    const [newCat] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès.',
      data: newCat[0],
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Update category
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const validated = categorySchema.parse(req.body);

    const [existing] = await pool.query('SELECT id, slug, name FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    }

    let slug = existing[0].slug;
    if (existing[0].name !== validated.name) {
      let baseSlug = slugify(validated.name);
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const [conflict] = await pool.query('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, id]);
        if (conflict.length === 0) break;
        slug = `${baseSlug}-${counter++}`;
      }
    }

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?',
      [validated.name, slug, validated.description, validated.image_url, validated.is_active ? 1 : 0, id]
    );

    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Catégorie modifiée avec succès.',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Delete category
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    // Check if category contains products
    const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer cette catégorie car elle contient ${products[0].count} produit(s). Veuillez d'abord réassigner ou supprimer ces produits.`,
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Catégorie supprimée avec succès.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
