// Custom lightweight payload validation middleware
function validateLogin(req, res, next) {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }
  next();
}

function validateOrder(req, res, next) {
  const { category, items } = req.body;
  const validCategories = ['Sprite', 'Coke', 'Burger', 'Pizza', 'IceCream', 'Chips'];

  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Category must be one of: ${validCategories.join(', ')}`
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Items must be a non-empty array.'
    });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} is missing a valid description.`
      });
    }

    const qty = Number(item.quantity);
    if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a positive integer quantity.`
      });
    }

    const price = Number(item.unitPrice);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a valid non-negative unitPrice.`
      });
    }
  }

  next();
}

module.exports = {
  validateLogin,
  validateOrder
};
