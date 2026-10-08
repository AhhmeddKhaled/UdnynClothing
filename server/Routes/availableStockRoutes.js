const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const AvailableStock = require("../models/AvailableStock");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Upload Directories
|--------------------------------------------------------------------------
*/

/*
 * Excel uploads
 */
const excelUploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "excel"
);

if (!fs.existsSync(excelUploadDir)) {
  fs.mkdirSync(excelUploadDir, {
    recursive: true,
  });
}

/*
 * Available Stock images
 */
const imageUploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "available-stock"
);

if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, {
    recursive: true,
  });
}

/*
|--------------------------------------------------------------------------
| Excel Multer Configuration
|--------------------------------------------------------------------------
*/

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelUploadDir);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const filename =
      `stock-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

const excelUpload = multer({
  storage: excelStorage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    const allowedExtensions = [
      ".xlsx",
      ".xls",
    ];

    if (
      !allowedExtensions.includes(
        extension
      )
    ) {
      return cb(
        new Error(
          "Only XLSX and XLS files are allowed"
        )
      );
    }

    cb(null, true);
  },
});

/*
|--------------------------------------------------------------------------
| Image Multer Configuration
|--------------------------------------------------------------------------
*/

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadDir);
  },

  filename: (req, file, cb) => {
    const itemId =
      String(req.params.itemId || "product")
        .replace(/[^a-zA-Z0-9_-]/g, "");

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    const filename =
      `${itemId}-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

const imageUpload = multer({
  storage: imageStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed"
        )
      );
    }

    cb(null, true);
  },
});

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/*
 * تنظيف أسماء أعمدة Excel
 *
 * مهم لأن Excel العربي ممكن يحتوي على:
 * - مسافات مخفية
 * - BOM
 * - تشكيل
 * - اختلاف أشكال الألف
 */

function normalizeHeader(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  let text = String(value);

  // إزالة BOM والحروف غير المرئية
  text = text.replace(/\uFEFF/g, "");

  // إزالة التشكيل العربي
  text = text.replace(
    /[\u064B-\u065F\u0670]/g,
    ""
  );

  // إزالة التطويل
  text = text.replace(/ـ/g, "");

  // توحيد أشكال الألف
  text = text.replace(
    /[إأآ]/g,
    "ا"
  );

  // توحيد الياء
  text = text.replace(
    /ى/g,
    "ي"
  );

  // توحيد المسافات
  text = text.replace(
    /\s+/g,
    " "
  );

  return text.trim().toLowerCase();
}

/*
 * تحويل القيم إلى نص
 */

function normalizeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

/*
 * تحويل القيم إلى أرقام
 */

function normalizeNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  /*
   * تحويل الأرقام العربية
   * ١٢٣٤٥٦٧٨٩٠
   * إلى
   * 1234567890
   */

  const arabicDigits = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  let text = String(value);

  text = text.replace(
    /[٠-٩]/g,
    (digit) =>
      arabicDigits[digit]
  );

  /*
   * إزالة الفواصل والمسافات
   */

  text = text
    .replace(/,/g, "")
    .replace(/\s/g, "");

  const number = Number(text);

  return Number.isFinite(number)
    ? number
    : 0;
}

/*
|--------------------------------------------------------------------------
| GET Available Stock
|--------------------------------------------------------------------------
|
| IMPORTANT:
| هذا الـ endpoint خاص بالـ Admin فقط.
|
| Authentication:
|   authenticate
|
| Permission:
|   availableStock.read
|
| الـ Customer / Client ممنوع من الوصول إليه.
|
*/

router.get(
  "/",
  authenticate,
  authorize("availableStock.read"),
  async (req, res) => {
    try {
      const products =
        await AvailableStock.find({
          active: true,
        })
          .sort({
            itemId: 1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      console.error(
        "Available stock GET error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load available stock",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPLOAD PRODUCT IMAGE
|--------------------------------------------------------------------------
|
| Endpoint:
|   POST /api/availableStock/:itemId/image
|
| Authentication:
|   authenticate
|
| Permission:
|   availableStock.import
|
| FormData field:
|   image
|
*/

router.post(
  "/:itemId/image",
  authenticate,
  authorize("availableStock.import"),
  imageUpload.single("image"),
  async (req, res) => {
    try {
      console.log(
        "🔥 POST /api/availableStock/:itemId/image HIT"
      );

      const itemId =
        normalizeNumber(
          req.params.itemId
        );

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product itemId",
        });
      }

      /*
       * تأكد إن المنتج موجود
       */

      const product =
        await AvailableStock.findOne({
          itemId,
        });

      if (!product) {
        /*
         * لو Multer رفع الملف قبل ما نعرف
         * إن المنتج موجود، نحذف الملف.
         */

        if (req.file?.path) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch (deleteError) {
            console.error(
              "Failed to delete orphan image:",
              deleteError
            );
          }
        }

        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      /*
       * تأكد إن الصورة وصلت
       */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "No image was uploaded",
        });
      }

      console.log(
        "Image file:",
        req.file.originalname
      );

      console.log(
        "Saved as:",
        req.file.filename
      );

      /*
       * الصورة القديمة
       */

      const oldImagePath =
        product.imagePath;

      /*
       * المسار الذي سيتم حفظه في MongoDB
       */

      const imagePath =
        `/uploads/available-stock/${req.file.filename}`;

      /*
       * تحديث المنتج
       */

      product.imagePath =
        imagePath;

      await product.save();

      /*
       * حذف الصورة القديمة بعد نجاح
       * حفظ الصورة الجديدة.
       *
       * نحذف فقط الملفات المحلية
       * الخاصة بمجلد available-stock.
       */

      if (
        oldImagePath &&
        oldImagePath.startsWith(
          "/uploads/available-stock/"
        )
      ) {
        const oldFilename =
          path.basename(
            oldImagePath
          );

        const oldFilePath =
          path.join(
            imageUploadDir,
            oldFilename
          );

        /*
         * تأكد إن الملف القديم داخل
         * مجلد الصور قبل حذفه.
         */

        if (
          fs.existsSync(oldFilePath)
        ) {
          try {
            fs.unlinkSync(
              oldFilePath
            );

            console.log(
              "Old image deleted:",
              oldFilename
            );
          } catch (deleteError) {
            console.error(
              "Failed to delete old image:",
              deleteError
            );
          }
        }
      }

      return res.status(200).json({
        success: true,

        message:
          "Product image uploaded successfully",

        imagePath,

        product: {
          itemId:
            product.itemId,

          imagePath:
            product.imagePath,
        },
      });
    } catch (error) {
      console.error(
        "Product image upload error:",
        error
      );

      /*
       * لو حصل خطأ بعد رفع الملف،
       * نحذف الملف الجديد حتى لا يفضل
       * ملف غير مرتبط بأي Product.
       */

      if (req.file?.path) {
        try {
          if (
            fs.existsSync(
              req.file.path
            )
          ) {
            fs.unlinkSync(
              req.file.path
            );
          }
        } catch (deleteError) {
          console.error(
            "Failed to cleanup uploaded image:",
            deleteError
          );
        }
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to upload product image",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| IMPORT EXCEL
|--------------------------------------------------------------------------
|
| Authentication:
|   authenticate
|
| Permission:
|   availableStock.import
|
*/

router.post(
  "/import",
  authenticate,
  authorize("availableStock.import"),
  excelUpload.single("file"),
  async (req, res) => {
    try {
      console.log(
        "🔥 POST /api/availableStock/import HIT"
      );

      /*
       * تأكد إن الملف وصل
       */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error:
            "No Excel file was uploaded",
        });
      }

      console.log(
        "Excel file:",
        req.file.originalname
      );

      console.log(
        "Saved as:",
        req.file.filename
      );

      /*
       * =====================================================
       * قراءة ملف Excel
       * =====================================================
       */

      const workbook =
        XLSX.readFile(
          req.file.path,
          {
            cellDates: false,
          }
        );

      /*
       * أول Sheet
       */

      const sheetName =
        workbook.SheetNames[0];

      if (!sheetName) {
        return res.status(400).json({
          success: false,
          error:
            "Excel file does not contain any sheets",
        });
      }

      const worksheet =
        workbook.Sheets[sheetName];

      /*
       * =====================================================
       * قراءة الصفوف
       * =====================================================
       *
       * عندنا صفين فاضيين قبل الـ headers.
       *
       * لذلك:
       *
       * range: 2
       *
       * معناها ابدأ من الصف الثالث.
       */

      const rawRows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
            raw: true,

            // الـ headers موجودة في الصف الثالث
            range: 2,
          }
        );

      console.log(
        "Excel rows:",
        rawRows.length
      );

      /*
       * لو مفيش بيانات
       */

      if (rawRows.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            "Excel file does not contain any products",
        });
      }

      /*
       * =====================================================
       * Debug Headers
       * =====================================================
       */

      console.log(
        "Excel headers:",
        Object.keys(rawRows[0])
      );

      /*
       * =====================================================
       * Normalize Headers
       * =====================================================
       */

      const rows = rawRows.map(
        (row) => {
          const normalizedRow = {};

          for (const [
            key,
            value,
          ] of Object.entries(row)) {
            normalizedRow[
              normalizeHeader(key)
            ] = value;
          }

          return normalizedRow;
        }
      );

      console.log(
        "Normalized headers:",
        Object.keys(rows[0])
      );

      /*
       * =====================================================
       * أسماء الأعمدة المطلوبة
       * =====================================================
       */

      const HEADER = {
        itemId: normalizeHeader(
          "رقم الصنف"
        ),

        name: normalizeHeader(
          "اسم الصنف"
        ),

        qty: normalizeHeader(
          "اجمالي الكمية"
        ),

        purchasePrice:
          normalizeHeader(
            "سعر الشراء"
          ),

        wholesalePrice:
          normalizeHeader(
            "سعر الجملة"
          ),

        retailPrice:
          normalizeHeader(
            "سعر القطاعي"
          ),

        offerPrice:
          normalizeHeader(
            "سعر العرض"
          ),

        category:
          normalizeHeader(
            "التصنيف"
          ),

        manufacturer:
          normalizeHeader(
            "المصنع"
          ),
      };

      console.log(
        "Looking for headers:",
        HEADER
      );

      /*
       * =====================================================
       * تحويل الصفوف إلى Products
       * =====================================================
       */

      const productsMap =
        new Map();

      for (const row of rows) {
        const itemId =
          normalizeNumber(
            row[HEADER.itemId]
          );

        const name =
          normalizeText(
            row[HEADER.name]
          );

        /*
         * تجاهل الصفوف الفارغة
         */

        if (!itemId || !name) {
          continue;
        }

        const product = {
          itemId,

          name,

          qty: normalizeNumber(
            row[HEADER.qty]
          ),

          purchasePrice:
            normalizeNumber(
              row[
                HEADER.purchasePrice
              ]
            ),

          wholesalePrice:
            normalizeNumber(
              row[
                HEADER.wholesalePrice
              ]
            ),

          retailPrice:
            normalizeNumber(
              row[
                HEADER.retailPrice
              ]
            ),

          offerPrice:
            normalizeNumber(
              row[
                HEADER.offerPrice
              ]
            ),

          category:
            normalizeText(
              row[HEADER.category]
            ) || null,

          manufacturer:
            normalizeText(
              row[
                HEADER.manufacturer
              ]
            ) || null,

          active: true,
        };

        /*
         * لو رقم الصنف مكرر:
         * آخر صف هو المعتمد.
         */

        productsMap.set(
          itemId,
          product
        );
      }

      const products =
        Array.from(
          productsMap.values()
        );

      console.log(
        "Valid products:",
        products.length
      );

      /*
       * لو مفيش منتجات صحيحة
       */

      if (products.length === 0) {
        return res.status(400).json({
          success: false,

          error:
            "No valid products were found in the Excel file. Check the column names: رقم الصنف and اسم الصنف",

          headers:
            Object.keys(rows[0]),
        });
      }

      /*
       * =====================================================
       * تعطيل المنتجات القديمة
       * =====================================================
       *
       * أي منتج موجود في MongoDB
       * لكنه غير موجود في الملف الجديد
       * يصبح active = false.
       *
       * imagePath لا يتأثر.
       */

      await AvailableStock.updateMany(
        {},
        {
          $set: {
            active: false,
          },
        }
      );

      /*
       * =====================================================
       * Upsert Products
       * =====================================================
       *
       * موجود:
       * Update
       *
       * جديد:
       * Insert
       *
       * imagePath لا يتم تغييره.
       */

      const operations =
        products.map(
          (product) => ({
            updateOne: {
              filter: {
                itemId:
                  product.itemId,
              },

              update: {
                $set: {
                  name:
                    product.name,

                  qty:
                    product.qty,

                  purchasePrice:
                    product.purchasePrice,

                  wholesalePrice:
                    product.wholesalePrice,

                  retailPrice:
                    product.retailPrice,

                  offerPrice:
                    product.offerPrice,

                  category:
                    product.category,

                  manufacturer:
                    product.manufacturer,

                  active: true,
                },

                $setOnInsert: {
                  imagePath: null,
                },
              },

              upsert: true,
            },
          })
        );

      const result =
        await AvailableStock.bulkWrite(
          operations,
          {
            ordered: false,
          }
        );

      /*
       * =====================================================
       * Import Result
       * =====================================================
       */

      const inserted =
        result.upsertedCount || 0;

      const modified =
        result.modifiedCount || 0;

      console.log(
        "Import completed:",
        {
          total:
            products.length,

          inserted,

          modified,
        }
      );

      /*
       * =====================================================
       * Success Response
       * =====================================================
       */

      return res.status(200).json({
        success: true,

        message:
          "Products imported successfully",

        total:
          products.length,

        inserted,

        updated:
          modified,

        file: {
          originalName:
            req.file.originalname,

          filename:
            req.file.filename,
        },
      });
    } catch (error) {
      console.error(
        "Excel import error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          error.message ||
          "Failed to import Excel file",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Multer / Upload Errors
|--------------------------------------------------------------------------
*/

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      console.error(
        "Multer error:",
        error
      );

      return res.status(400).json({
        success: false,

        error:
          error.message ||
          "File upload error",
      });
    }

    if (error) {
      console.error(
        "Upload error:",
        error
      );

      return res.status(400).json({
        success: false,

        error:
          error.message ||
          "Invalid file upload",
      });
    }

    next();
  }
);

module.exports = router;