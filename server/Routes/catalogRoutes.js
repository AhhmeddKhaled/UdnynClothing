const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const CatalogProduct = require("../Models/CatalogProduct");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`,
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("الصورة لازم تكون JPG أو PNG أو WEBP"));
    }

    callback(null, true);
  },
});

// GET /api/catalog
router.get("/", async (_req, res) => {
  try {
    const products = await CatalogProduct.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Catalog GET error:", error);

    return res.status(500).json({
      success: false,
      message: "فشل تحميل المنتجات",
    });
  }
});

// POST /api/catalog
router.post("/", upload.single("image"), async (req, res) => {
  let savedImagePath = null;

  try {
    const {
      name,
      description = "",
      price,
      category,
      manufacturer = "",
      isFeatured = false,
      sortOrder = 0,
    } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "اسم المنتج مطلوب",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "التصنيف مطلوب",
      });
    }

    if (price === undefined || price === "") {
      return res.status(400).json({
        success: false,
        message: "السعر مطلوب",
      });
    }

    const numericPrice = Number(price);
    const numericSortOrder = Number(sortOrder);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "السعر غير صحيح",
      });
    }

    if (!Number.isFinite(numericSortOrder)) {
      return res.status(400).json({
        success: false,
        message: "ترتيب المنتج غير صحيح",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "صورة المنتج مطلوبة",
      });
    }

    savedImagePath = `/uploads/${req.file.filename}`;

    const product = await CatalogProduct.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      manufacturer: manufacturer.trim(),
      imagePath: savedImagePath,
      isActive: true,
      isFeatured: isFeatured === "true",
      sortOrder: numericSortOrder,
    });

    return res.status(201).json({
      success: true,
      message: "تم إضافة المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("Catalog POST error:", error);

    // Remove the uploaded image if saving the product failed.
    if (savedImagePath) {
      const filename = path.basename(savedImagePath);
      const filePath = path.join(uploadDir, filename);

      fs.unlink(filePath, () => {});
    }

    return res.status(500).json({
      success: false,
      message: "فشل إضافة المنتج",
    });
  }
});

// DELETE /api/catalog/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await CatalogProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // Soft delete: hide the product without destroying its record.
    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });

  } catch (error) {
    console.error("Catalog POST error:", error);

    if (savedImagePath) {
      const filename = path.basename(savedImagePath);
      const filePath = path.join(uploadDir, filename);
      fs.unlink(filePath, () => {});
    }

    return res.status(500).json({
      success: false,
      message: "فشل إضافة المنتج",
      debug:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
});

module.exports = router;
