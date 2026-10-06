const mongoose = require("mongoose");
const XLSX = require("xlsx");

const AvailableStock = require("../models/AvailableStock");
const parseSheet = require("../utils/excelParser");

// ======================================================
// Import Available Stock From Excel
// ======================================================

async function importProducts(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "من فضلك اختر ملف Excel",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    if (!workbook.SheetNames.length) {
      return res.status(400).json({
        success: false,
        message: "ملف Excel لا يحتوي على Sheets",
      });
    }

    const worksheet =
      workbook.Sheets[workbook.SheetNames[0]];

    const items = parseSheet(worksheet);

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "لم يتم العثور على أصناف في ملف Excel",
      });
    }

    // --------------------------------------------------
    // تعطيل القائمة القديمة
    // --------------------------------------------------

    await AvailableStock.updateMany(
      {},
      {
        $set: {
          active: false,
        },
      }
    );

    // --------------------------------------------------
    // تحديث البضاعة الحالية
    // --------------------------------------------------

    const operations = items.map((item) => ({
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
            manufacturer: item.manufacturer,
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
      await AvailableStock.bulkWrite(
        operations
      );

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const totalCount =
      await AvailableStock.countDocuments();

    const activeCount =
      await AvailableStock.countDocuments({
        active: true,
      });

    const inactiveCount =
      await AvailableStock.countDocuments({
        active: false,
      });

    console.log("Excel import completed:", {
      totalCount,
      activeCount,
      inactiveCount,
      importedFromExcel: items.length,
      inserted: result.upsertedCount || 0,
      modified: result.modifiedCount || 0,
    });

    return res.json({
      success: true,
      message:
        "تم استيراد الملف واستبدال قائمة الشغل الحالية",
      total: items.length,
      inserted: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
      active: activeCount,
      inactive: inactiveCount,
      databaseTotal: totalCount,
    });
  } catch (error) {
    console.error(
      "Excel import error:",
      error
    );

    next(error);
  }
}

// ======================================================
// Get All Active Available Stock
// ======================================================

async function getProducts(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const totalCount =
      await AvailableStock.countDocuments();

    const activeCount =
      await AvailableStock.countDocuments({
        active: true,
      });

    const inactiveCount =
      await AvailableStock.countDocuments({
        active: false,
      });

    console.log("Available Stock:", {
      totalCount,
      activeCount,
      inactiveCount,
    });

    const products =
      await AvailableStock.find({
        active: true,
      }).sort({
        itemId: 1,
      });

    return res.json({
      success: true,
      products,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    });
  } catch (error) {
    console.error(
      "Get available stock error:",
      error
    );

    next(error);
  }
}

// ======================================================
// Get One Available Stock Item
// ======================================================

async function getProduct(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const itemId = Number(
      req.params.itemId
    );

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product itemId",
      });
    }

    const product =
      await AvailableStock.findOne({
        itemId,
        active: true,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get available stock item error:",
      error
    );

    next(error);
  }
}

// ======================================================
// Upload / Update Available Stock Image
// ======================================================

async function uploadProductImage(
  req,
  res,
  next
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "من فضلك اختر صورة",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const itemId = Number(
      req.params.itemId
    );

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product itemId",
      });
    }

    const imagePath =
      `/uploads/${req.file.filename}`;

    const product =
      await AvailableStock.findOneAndUpdate(
        {
          itemId,
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
        success: false,
        message:
          "الصنف مش موجود في ملف العمل الحالي",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Image upload error:",
      error
    );

    next(error);
  }
}

// ======================================================
// Exports
// ======================================================

module.exports = {
  importProducts,
  getProducts,
  getProduct,
  uploadProductImage,
};