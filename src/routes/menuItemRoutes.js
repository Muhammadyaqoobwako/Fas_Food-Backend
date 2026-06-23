const express = require('express');
const router = express.Router();
const MenuItemController = require('../controllers/MenuItemController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', MenuItemController.getAllMenuItems);
router.get('/:id', MenuItemController.getMenuItemById);

// Enforce authentication on all menu item write/delete routes
router.post('/', authMiddleware, MenuItemController.createMenuItem);
router.put('/:id', authMiddleware, MenuItemController.updateMenuItem);
router.delete('/:id', authMiddleware, MenuItemController.deleteMenuItem);

module.exports = router;
