const express = require('express');
const router = express.Router();
const wilayaController = require('../controllers/wilayaController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public route for customer checkout wilaya selection
router.get('/', wilayaController.getWilayas);
router.get('/:id', wilayaController.getWilayaDelivery);

// Admin route to manage wilaya delivery fees
router.put('/:id', requireAdminAuth, wilayaController.updateWilaya);

module.exports = router;
