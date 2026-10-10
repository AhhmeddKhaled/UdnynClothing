
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Optional: used when the order belongs to a registered user.
    // Manual orders can leave this field null.
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Customer details for manually created orders.
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // Product subtotal before shipping.
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // subtotal + shippingCost
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    customerNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    statusUpdatedAt: {
      type: Date,
      default: null,
    },

    stockRestored: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
