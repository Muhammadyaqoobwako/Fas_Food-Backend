const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validateMiddleware');

// Enforce authentication on all order management routes
router.use(authMiddleware);

router.post('/', validateOrder, OrderController.placeOrder);
router.get('/', OrderController.getAllOrders);
router.put('/:id', OrderController.updateOrder);
router.delete('/:id', OrderController.deleteOrder);
router.post('/sync', OrderController.syncOfflineOrders);
router.get('/reports/sales', OrderController.getSalesSummary);

module.exports = router;
