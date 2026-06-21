const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Sprite', 'Coke', 'Burger', 'Pizza', 'IceCream', 'Chips']
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    sizeOrWeight: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      default: []
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index on category and name for rapid menu queries
MenuItemSchema.index({ category: 1, name: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
