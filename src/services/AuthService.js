const jwt = require('jsonwebtoken');
const Cashier = require('../models/Cashier');
const nodemailer = require('nodemailer');

class AuthService {
  async register({ username, password, role, restaurantName, email }) {
    const existing = await Cashier.findOne({ username: username.toLowerCase() });
    if (existing) {
      throw new Error('Username already exists.');
    }

    const cashier = new Cashier({
      username,
      password,
      role,
      restaurantName,
      email
    });

    await cashier.save();
    const token = jwt.sign(
      { id: cashier._id, username: cashier.username, role: cashier.role, restaurantName: cashier.restaurantName || '', email: cashier.email || '' },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '2h' }
    );
    return {
      token,
      cashier: {
        username: cashier.username,
        role: cashier.role,
        restaurantName: cashier.restaurantName || '',
        email: cashier.email || ''
      }
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
      { id: cashier._id, username: cashier.username, role: cashier.role, restaurantName: cashier.restaurantName || '', email: cashier.email || '' },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '2h' }
    );

    return {
      token,
      cashier: {
        username: cashier.username,
        role: cashier.role,
        restaurantName: cashier.restaurantName || '',
        email: cashier.email || ''
      }
    };
  }

  async forgotPassword({ email }) {
    if (!email) {
      throw new Error('Email is required.');
    }

    const cashier = await Cashier.findOne({ email: email.toLowerCase() });
    if (!cashier) {
      throw new Error('No account registered with this email address.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    cashier.resetOtp = otp;
    cashier.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await cashier.save();

    console.log('\n=============================================');
    console.log(`[AUTH SERVICE] OTP generated for ${email}: ${otp}`);
    console.log('=============================================\n');

    try {
      // Fallback Ethereal SMTP transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
          pass: process.env.SMTP_PASS || 'ethereal_password'
        }
      });

      await transporter.sendMail({
        from: '"Fas Food Reset" <no-reply@fasfood.co.za>',
        to: email,
        subject: 'Fas Food Password Reset OTP',
        text: `Your password reset OTP code is: ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your password reset OTP code is: <strong>${otp}</strong>.</p><p>It is valid for 10 minutes.</p>`
      });
    } catch (err) {
      console.warn(`WARNING: Failed to send SMTP mail: ${err.message}. OTP logged to console instead.`);
    }

    return { message: 'OTP sent successfully to registered email.' };
  }

  async resetPassword({ email, otp, newPassword }) {
    if (!email || !otp || !newPassword) {
      throw new Error('Email, OTP and new password are required.');
    }

    const cashier = await Cashier.findOne({ email: email.toLowerCase() });
    if (!cashier) {
      throw new Error('No account registered with this email address.');
    }

    if (!cashier.resetOtp || cashier.resetOtp !== otp) {
      throw new Error('Invalid OTP code.');
    }

    if (!cashier.resetOtpExpires || cashier.resetOtpExpires < Date.now()) {
      throw new Error('OTP code has expired.');
    }

    // Set new password (will be hashed automatically by pre-save hook)
    cashier.password = newPassword;
    cashier.resetOtp = undefined;
    cashier.resetOtpExpires = undefined;
    await cashier.save();

    return { message: 'Password has been reset successfully.' };
  }
}

module.exports = new AuthService();
