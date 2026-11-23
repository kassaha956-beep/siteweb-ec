const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Customer public routes
router.post('/', orderController.createOrder);
router.get('/track', orderController.trackOrder);

// Admin protected routes
router.get('/admin/all', requireAdminAuth, orderController.getAdminOrders);
router.get('/admin/:id', requireAdminAuth, orderController.getAdminOrder);
router.put('/admin/:id/status', requireAdminAuth, orderController.updateOrderStatus);

module.exports = router;
