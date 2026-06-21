const express = require('express');
const router = express.Router();
const MenuItemController = require('../controllers/MenuItemController');
const authMiddleware = require('../middleware/authMiddleware');

// Enforce authentication on all menu item management routes
router.use(authMiddleware);

router.get('/', MenuItemController.getAllMenuItems);
router.get('/:id', MenuItemController.getMenuItemById);
router.post('/', MenuItemController.createMenuItem);
router.put('/:id', MenuItemController.updateMenuItem);
router.delete('/:id', MenuItemController.deleteMenuItem);

module.exports = router;
