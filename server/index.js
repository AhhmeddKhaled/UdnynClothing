require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");
const Product = require("./models/Product");

const app = express();

app.use(cors());
app.use(express.json());

// ======================================================
// الصور
// ======================================================

const uploadDir = path.join(__dirname, "uploads");

// جعل فولدر الصور متاح من خلال:
// /uploads/اسم_الصورة
app.use("/uploads", express.static(uploadDir));

// ======================================================
// إعداد Multer للصور
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    // الصورة يتم حفظها باسم رقم الصنف
    cb(null, `${req.params.itemId}${ext}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("لازم يكون ملف صورة"));
    }

    cb(null, true);
  },
});

// ======================================================
// قراءة Excel
// ======================================================

function parseSheet(ws) {
  const all = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
  });

  // البحث عن صف العناوين
  const headIdx = all.findIndex((r) =>
    r.some(
      (c) =>
        typeof c === "string" &&
        c.trim() === "اسم الصنف"
    )
  );

  if (headIdx === -1) {
    throw new Error("مش لاقي عمود اسمه: اسم الصنف");
  }

  const [head, ...body] = all.slice(headIdx);

  const keys = head.map((h, i) =>
    typeof h === "string"
      ? h.trim()
      : i === 0
      ? "م"
      : `col${i}`
  );

  return body
    .map((r) =>
      Object.fromEntries(
        keys.map((k, i) => [k, r[i] ?? null])
      )
    )

    // استبعاد الصفوف الفاضية
    .filter((r) => r["اسم الصنف"])

    .map((r) => ({
      itemId: Number(r["رقم الصنف"]),

      name: r["اسم الصنف"],

      qty: Number(r["إجمالى الكمية"] ?? 0),

      category: r["التصنيف"] ?? null,

      manufacturer: r["المصنع"] ?? null,

      barcode:
        r["باركود"] != null
          ? String(r["باركود"])
          : null,
    }));
}

// ======================================================
// رفع Excel في الذاكرة
// ======================================================

const excelUpload = multer({
  storage: multer.memoryStorage(),
});

// ======================================================
// استيراد Excel
// ======================================================

app.post(
  "/api/products/import",
  excelUpload.single("file"),
  async (req, res) => {
    try {
      // التأكد من وجود الملف
      if (!req.file) {
        return res.status(400).json({
          error: "من فضلك اختر ملف Excel",
        });
      }

      // قراءة Excel
      const wb = XLSX.read(req.file.buffer, {
        type: "buffer",
      });

      if (!wb.SheetNames.length) {
        return res.status(400).json({
          error: "ملف Excel لا يحتوي على Sheets",
        });
      }

      const ws = wb.Sheets[wb.SheetNames[0]];

      // استخراج المنتجات
      const items = parseSheet(ws);

      if (!items.length) {
        return res.status(400).json({
          error: "لم يتم العثور على أصناف في ملف Excel",
        });
      }

      // ==================================================
      // مهم جدًا:
      // كل Upload جديد = قائمة العمل الحالية الجديدة
      //
      // أولًا نعطل كل المنتجات القديمة
      // لكن لا نحذفها من MongoDB
      // وبالتالي الصور تظل محفوظة
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
      // تحديث المنتجات الموجودة في Excel
      //
      // $set لا يحتوي imagePath
      // لذلك الصورة القديمة لن تتأثر
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
              manufacturer: item.manufacturer,
              barcode: item.barcode,

              // المنتج موجود في Excel الحالي
              active: true,
            },

            // لو المنتج جديد فقط، يتم إنشاء imagePath
            // بدون التأثير على الصورة الموجودة
            $setOnInsert: {
              imagePath: null,
            },
          },

          upsert: true,
        },
      }));

      const result = await Product.bulkWrite(ops);

      // ==================================================
      // إحصائيات
      // ==================================================

      const activeCount = await Product.countDocuments({
        active: true,
      });

      const inactiveCount = await Product.countDocuments({
        active: false,
      });

      res.json({
        message: "تم استيراد الملف واستبدال قائمة الشغل الحالية",

        total: items.length,

        inserted: result.upsertedCount || 0,

        updated: result.modifiedCount || 0,

        active: activeCount,

        inactive: inactiveCount,
      });
    } catch (err) {
      console.error("Excel import error:", err);

      res.status(400).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// كل الأصناف الموجودة في Excel الحالي فقط
// ======================================================

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({
      active: true,
    }).sort({
      itemId: 1,
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ======================================================
// صنف واحد برقمه
// ======================================================

app.get(
  "/api/products/:itemId",
  async (req, res) => {
    try {
      const product = await Product.findOne({
        itemId: Number(req.params.itemId),

        // نجيب فقط المنتجات الموجودة حاليًا
        active: true,
      });

      if (!product) {
        return res.status(404).json({
          error: "الصنف مش موجود في ملف العمل الحالي",
        });
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// رفع / تحديث صورة لصنف
// ======================================================

app.post(
  "/api/products/:itemId/image",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "من فضلك اختر صورة",
        });
      }

      const imagePath = `/uploads/${req.file.filename}`;

      const product =
        await Product.findOneAndUpdate(
          {
            itemId: Number(req.params.itemId),
            active: true,
          },

          {
            $set: {
              imagePath: imagePath,
            },
          },

          {
            new: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          error: "الصنف مش موجود في ملف العمل الحالي",
        });
      }

      res.json(product);
    } catch (err) {
      console.error("Image upload error:", err);

      res.status(400).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// تشغيل السيرفر
// ======================================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  })

  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err.message
    );
  });