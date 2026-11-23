const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/', requireAdminAuth, inventoryController.getInventory);
router.get('/movements', requireAdminAuth, inventoryController.getMovements);
router.post('/adjust', requireAdminAuth, inventoryController.adjustStock);

module.exports = router;
