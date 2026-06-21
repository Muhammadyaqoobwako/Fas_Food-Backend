const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  servedWith: { type: String }, // Mapped from Burgers/Chips accompaniments
  colour: { type: String },     // Mapped from Ice Cream colour
  flavour: { type: String },    // Mapped from Ice Cream flavour
  type: { type: String }       // e.g. Cold, Hot, Diet, Regular
});

const OrderSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Sprite', 'Coke', 'Burger', 'Pizza', 'IceCream', 'Chips']
    },
    items: {
      type: [OrderItemSchema],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    cashier: {
      type: String,
      required: true,
      index: true
    },
    offlineCreatedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Pre-validate hook to calculate and validate total amount (correcting legacy Chips addition bug)
OrderSchema.pre('validate', function (next) {
  if (this.items && this.items.length > 0) {
    const total = this.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }, 0);
    this.totalAmount = total;
  } else {
    this.totalAmount = 0;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
