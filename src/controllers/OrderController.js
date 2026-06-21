const OrderService = require('../services/OrderService');

class OrderController {
  async placeOrder(req, res, next) {
    try {
      const { category, items, offlineCreatedAt } = req.body;
      const cashier = req.cashier.username; // Taken from decrypted JWT token session context

      const order = await OrderService.placeOrder({
        category,
        items,
        cashier,
        offlineCreatedAt
      });

      res.status(201).json({
        success: true,
        message: 'Order has been made successfully.',
        data: order
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const orders = await OrderService.getAllOrders();
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      await OrderService.deleteOrder(id);
      res.status(200).json({
        success: true,
        message: 'The Menu record has been cleared.'
      });
    } catch (err) {
      next(err);
    }
  }

  async syncOfflineOrders(req, res, next) {
    try {
      const { orders } = req.body;
      if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid offline orders payload.'
        });
      }

      const synced = await OrderService.syncOfflineOrders(orders);
      res.status(200).json({
        success: true,
        message: 'Offline orders synchronized successfully.',
        synchronizedCount: synced.length,
        data: synced
      });
    } catch (err) {
      next(err);
    }
  }

  async getSalesSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const summary = await OrderService.getSalesSummary(startDate, endDate);
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderController();
