const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:idOrSlug', categoryController.getCategory);

// Admin routes
router.post('/', requireAdminAuth, categoryController.createCategory);
router.put('/:id', requireAdminAuth, categoryController.updateCategory);
router.delete('/:id', requireAdminAuth, categoryController.deleteCategory);

module.exports = router;
