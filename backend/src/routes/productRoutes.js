const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdminAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/suggestions', productController.getProductSuggestions);
router.get('/:idOrSlug', productController.getProduct);

// Admin routes
router.post('/', requireAdminAuth, productController.createProduct);
router.put('/:id', requireAdminAuth, productController.updateProduct);
router.delete('/:id', requireAdminAuth, productController.deleteProduct);
router.post('/upload', requireAdminAuth, upload.single('image'), productController.uploadImage);

module.exports = router;
