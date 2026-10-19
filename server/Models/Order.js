const mongoose = require("mongoose");
const { EGYPTIAN_GOVERNORATES, VALID_STATUSES } = require("../Data/OrdersData");

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
      type: String,
      required: true,
      min: 0,
    },


    offerPrice: {
      type: Number,
      min: 0,
    },

    wholesalePrice: {
      type: Number,
      min: 0,
    },

    retailPrice: {
      type: Number,
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

    realImagePath: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

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
        validator: (items) => Array.isArray(items) && items.length > 0,
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

    // Total = subtotal + shippingCost.
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: VALID_STATUSES,
      default: "pending",
      index: true,
    },

    // Customer-selected Egyptian governorate.
    governorate: {
      type: String,
      required: [true, "Governorate is required"],
      trim: true,
      enum: {
        values: EGYPTIAN_GOVERNORATES,
        message: "Please select a valid Egyptian governorate",
      },
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
  { timestamps: true },
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
