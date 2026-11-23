const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/overview', requireAdminAuth, statisticsController.getOverview);
router.get('/sales', requireAdminAuth, statisticsController.getSalesReports);
router.get('/products', requireAdminAuth, statisticsController.getProductReports);

module.exports = router;
