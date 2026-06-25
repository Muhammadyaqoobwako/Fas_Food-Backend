const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CashierSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['cashier', 'waiter', 'admin', 'customer', 'owner', 'driver', 'manager'],
      default: 'customer'
    },
    restaurantName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    resetOtp: {
      type: String
    },
    resetOtpExpires: {
      type: Date
    }
  },
  { timestamps: true }
);

// Hash password before saving
CashierSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
CashierSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Cashier', CashierSchema);
