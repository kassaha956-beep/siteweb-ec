const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Customer validation
router.post('/validate', couponController.validateCoupon);

// Admin routes
router.get('/', requireAdminAuth, couponController.getCoupons);
router.post('/', requireAdminAuth, couponController.createCoupon);
router.put('/:id', requireAdminAuth, couponController.updateCoupon);
router.delete('/:id', requireAdminAuth, couponController.deleteCoupon);

module.exports = router;
