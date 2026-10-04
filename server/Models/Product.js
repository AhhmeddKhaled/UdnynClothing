const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    itemId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    qty: {
      type: Number,
      default: 0,
    },

    category: {
      type: String,
      default: null,
    },

    manufacturer: {
      type: String,
      default: null,
    },

    barcode: {
      type: String,
      default: null,
    },

    // الصورة تفضل محفوظة حتى لو المنتج اختفى من Excel
    imagePath: {
      type: String,
      default: null,
    },

    // هل المنتج موجود في ملف Excel الحالي؟
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);