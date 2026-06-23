const Order = require('../models/Order');

class OrderService {
  async placeOrder({ category, items, cashier, offlineCreatedAt, customerName, deliveryAddress, status, assignedDriver }) {
    const order = new Order({
      category,
      items,
      cashier,
      offlineCreatedAt,
      customerName,
      deliveryAddress,
      status: status || 'pending',
      assignedDriver
    });

    await order.save();
    return order;
  }

  async getAllOrders() {
    return Order.find().sort({ createdAt: -1 });
  }

  async getOrdersByCategory(category) {
    return Order.find({ category }).sort({ createdAt: -1 });
  }

  async deleteOrder(id) {
    const result = await Order.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Order not found');
    }
    return result;
  }

  async syncOfflineOrders(orders) {
    const savedOrders = [];
    for (const orderData of orders) {
      const order = new Order({
        category: orderData.category,
        items: orderData.items || [
          {
            description: orderData.pizzaDescription || orderData.drinkName || orderData.typeofBurger || 'Chips Order',
            quantity: orderData.unit || orderData.quantity || 1,
            unitPrice: orderData.unitPrice || orderData.priceTag || orderData.price || 0,
            servedWith: orderData.servedWith,
            colour: orderData.colour,
            flavour: orderData.flavour,
            type: orderData.type
          }
        ],
        cashier: orderData.cashierName || 'anonymous',
        offlineCreatedAt: orderData.offlineCreatedAt,
        status: orderData.status || 'pending',
        customerName: orderData.customerName,
        deliveryAddress: orderData.deliveryAddress,
        assignedDriver: orderData.assignedDriver
      });
      await order.save();
      savedOrders.push(order);
    }
    return savedOrders;
  }

  async getSalesSummary(startDate, endDate) {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    const salesByCategory = {
      Sprite: 0,
      Coke: 0,
      Burger: 0,
      Pizza: 0,
      IceCream: 0,
      Chips: 0
    };

    orders.forEach(order => {
      if (salesByCategory[order.category] !== undefined) {
        salesByCategory[order.category] += order.totalAmount;
      }
    });

    return {
      totalRevenue,
      totalOrders,
      salesByCategory
    };
  }
  async updateOrder(id, data) {
    const order = await Order.findByIdAndUpdate(id, data, { new: true });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }
}

module.exports = new OrderService();
