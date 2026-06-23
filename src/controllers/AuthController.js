const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, password, role, restaurantName } = req.body;
      const data = await AuthService.register({ username, password, role, restaurantName });
      res.status(201).json({
        success: true,
        message: 'Cashier registered successfully.',
        data
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login({ username, password });
      res.status(200).json({
        success: true,
        message: 'WELCOME TO Deboneirs Inn System',
        ...data
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }
}

module.exports = new AuthController();
