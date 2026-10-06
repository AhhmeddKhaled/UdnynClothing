const mongoose = require("mongoose");

const CatalogProduct = require("../models/CatalogProduct");

// ======================================================
// Get All Catalog Products
// ======================================================

async function getCatalogProducts(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const products = await CatalogProduct.find({
      isActive: true,
    }).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get catalog products error:", error);
    next(error);
  }
}

// ======================================================
// Get One Catalog Product
// ======================================================

async function getCatalogProduct(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "قاعدة البيانات غير متصلة حاليًا",
      });
    }

    const product = await CatalogProduct.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get catalog product error:", error);
    next(error);
  }
}

// ======================================================
// Create Catalog Product
// ======================================================

async function createCatalogProduct(req, res, next) {
  try {
    const {
      name,
      description,
      price,
      category,
      manufacturer,
      imagePath,
      isFeatured,
      sortOrder,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "الاسم والسعر والتصنيف مطلوبين",
      });
    }

    const product = await CatalogProduct.create({
      name,
      description,
      price,
      category,
      manufacturer,
      imagePath,
      isFeatured,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("Create catalog product error:", error);
    next(error);
  }
}

// ======================================================
// Update Catalog Product
// ======================================================

async function updateCatalogProduct(req, res, next) {
  try {
    const product = await CatalogProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    res.json({
      success: true,
      message: "تم تحديث المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("Update catalog product error:", error);
    next(error);
  }
}

// ======================================================
// Delete Catalog Product
// ======================================================

async function deleteCatalogProduct(req, res, next) {
  try {
    const product = await CatalogProduct.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    res.json({
      success: true,
      message: "تم حذف المنتج من الكتالوج",
    });
  } catch (error) {
    console.error("Delete catalog product error:", error);
    next(error);
  }
}

module.exports = {
  getCatalogProducts,
  getCatalogProduct,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
};