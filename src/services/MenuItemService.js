const MenuItem = require('../models/MenuItem');

class MenuItemService {
  async createMenuItem(data) {
    const item = new MenuItem(data);
    await item.save();
    return item;
  }

  async getAllMenuItems() {
    return MenuItem.find().sort({ category: 1, name: 1 });
  }

  async getMenuItemById(id) {
    const item = await MenuItem.findById(id);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  }

  async updateMenuItem(id, data) {
    const item = await MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  }

  async deleteMenuItem(id) {
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  }
}

module.exports = new MenuItemService();
