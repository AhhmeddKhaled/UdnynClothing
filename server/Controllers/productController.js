const mongoose = require("mongoose");
const XLSX = require("xlsx");

const Product = require("../models/Product");
const parseSheet = require("../utils/excelParser");

// ======================================================
// Import Products From Excel
// ======================================================

async function importProducts(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "من فضلك اختر ملف Excel",
      });
    }

    // التأكد من اتصال MongoDB
    if (
      mongoose.connection.readyState !== 1
    ) {
      return res.status(503).json({
        error:
          "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const wb = XLSX.read(
      req.file.buffer,
      {
        type: "buffer",
      }
    );

    if (!wb.SheetNames.length) {
      return res.status(400).json({
        error:
          "ملف Excel لا يحتوي على Sheets",
      });
    }

    const ws =
      wb.Sheets[
        wb.SheetNames[0]
      ];

    const items = parseSheet(ws);

    if (!items.length) {
      return res.status(400).json({
        error:
          "لم يتم العثور على أصناف في ملف Excel",
      });
    }

    // ==================================================
    // تعطيل القائمة القديمة
    // ==================================================

    await Product.updateMany(
      {},
      {
        $set: {
          active: false,
        },
      }
    );

    // ==================================================
    // تحديث المنتجات
    // ==================================================

    const ops = items.map((item) => ({
      updateOne: {
        filter: {
          itemId: item.itemId,
        },

        update: {
          $set: {
            itemId: item.itemId,
            name: item.name,
            qty: item.qty,
            category: item.category,
            manufacturer:
              item.manufacturer,
            barcode: item.barcode,
            active: true,
          },

          $setOnInsert: {
            imagePath: null,
          },
        },

        upsert: true,
      },
    }));

    const result =
      await Product.bulkWrite(ops);

    // ==================================================
    // Statistics
    // ==================================================

    const activeCount =
      await Product.countDocuments({
        active: true,
      });

    const inactiveCount =
      await Product.countDocuments({
        active: false,
      });

    res.json({
      success: true,

      message:
        "تم استيراد الملف واستبدال قائمة الشغل الحالية",

      total: items.length,

      inserted:
        result.upsertedCount || 0,

      updated:
        result.modifiedCount || 0,

      active: activeCount,

      inactive: inactiveCount,
    });
  } catch (err) {
    console.error(
      "Excel import error:",
      err
    );

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

// ======================================================
// Get All Active Products
// ======================================================

async function getProducts(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);

    console.log("Requested itemId:", req.params.itemId);
    console.log("Parsed itemId:", itemId);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product itemId",
      });
    }

    const product = await Product.findOne({
      itemId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
}


// ======================================================
// Get One Product
// ======================================================

async function getProduct(req, res) {
  try {
    if (
      mongoose.connection.readyState !== 1
    ) {
      return res.status(503).json({
        error:
          "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const itemId = Number(
      req.params.itemId
    );

    const product =
      await Product.findOne({
        itemId,
        active: true,
      });

    if (!product) {
      return res.status(404).json({
        error:
          "الصنف مش موجود في ملف العمل الحالي",
      });
    }

    res.json(product);
  } catch (err) {
    console.error(
      "Get product error:",
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
}

// ======================================================
// Upload / Update Product Image
// ======================================================

async function uploadProductImage(
  req,
  res
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error:
          "من فضلك اختر صورة",
      });
    }

    if (
      mongoose.connection.readyState !== 1
    ) {
      return res.status(503).json({
        error:
          "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const imagePath =
      `/uploads/${req.file.filename}`;

    const product =
      await Product.findOneAndUpdate(
        {
          itemId: Number(
            req.params.itemId
          ),

          active: true,
        },

        {
          $set: {
            imagePath,
          },
        },

        {
          new: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        error:
          "الصنف مش موجود في ملف العمل الحالي",
      });
    }

    res.json(product);
  } catch (err) {
    console.error(
      "Image upload error:",
      err
    );

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

module.exports = {
  importProducts,
  getProducts,
  getProduct,
  uploadProductImage,
};