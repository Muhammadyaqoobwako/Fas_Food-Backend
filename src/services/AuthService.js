const jwt = require('jsonwebtoken');
const Cashier = require('../models/Cashier');

class AuthService {
  async register({ username, password, role, restaurantName }) {
    const existing = await Cashier.findOne({ username: username.toLowerCase() });
    if (existing) {
      throw new Error('Username already exists.');
    }

    const cashier = new Cashier({
      username,
      password,
      role,
      restaurantName
    });

    await cashier.save();
    return {
      username: cashier.username,
      role: cashier.role,
      restaurantName: cashier.restaurantName || ''
    };
  }

  async login({ username, password }) {
    const cashier = await Cashier.findOne({ username: username.toLowerCase() });
    if (!cashier) {
      throw new Error('INVALID PASSWORD OR USERNAME, PLEASE TRY AGAIN!!!');
    }

    const isMatch = await cashier.comparePassword(password);
    if (!isMatch) {
      throw new Error('INVALID PASSWORD OR USERNAME, PLEASE TRY AGAIN!!!');
    }

    const token = jwt.sign(
      { id: cashier._id, username: cashier.username, role: cashier.role, restaurantName: cashier.restaurantName || '' },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '2h' }
    );

    return {
      token,
      cashier: {
        username: cashier.username,
        role: cashier.role,
        restaurantName: cashier.restaurantName || ''
      }
    };
  }
}

module.exports = new AuthService();
