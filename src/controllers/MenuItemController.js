const MenuItemService = require('../services/MenuItemService');

class MenuItemController {
  async createMenuItem(req, res, next) {
    try {
      const item = await MenuItemService.createMenuItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully.',
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllMenuItems(req, res, next) {
    try {
      const items = await MenuItemService.getAllMenuItems();
      res.status(200).json({
        success: true,
        data: items
      });
    } catch (err) {
      next(err);
    }
  }

  async getMenuItemById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await MenuItemService.getMenuItemById(id);
      res.status(200).json({
        success: true,
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  async updateMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const item = await MenuItemService.updateMenuItem(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully.',
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      await MenuItemService.deleteMenuItem(id);
      res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MenuItemController();
