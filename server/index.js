require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");

const Product = require("./models/Product");

const app = express();

// ======================================================
// إعدادات أساسية
// ======================================================

app.use(cors());
app.use(express.json());

// Back4App يحدد PORT تلقائيًا
const PORT = Number(process.env.PORT) || 8080;

// ======================================================
// مجلد الصور
// ======================================================

const uploadDir = path.join(__dirname, "uploads");

// إنشاء المجلد إذا لم يكن موجودًا
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// إتاحة الصور
app.use("/uploads", express.static(uploadDir));

// ======================================================
// الصفحة الرئيسية - Health Check
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "UdnynClothing Server is working!",
    mongoConfigured: !!process.env.MONGO_URI,
    mongoConnected:
      mongoose.connection.readyState === 1,
  });
});

// ======================================================
// Health Check إضافي
// ======================================================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    server: "online",
    mongoConfigured: !!process.env.MONGO_URI,
    mongoConnected:
      mongoose.connection.readyState === 1,
  });
});

// ======================================================
// إعداد Multer للصور
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `${req.params.itemId}${ext}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("لازم يكون ملف صورة")
      );
    }

    cb(null, true);
  },
});

// ======================================================
// قراءة Excel
// ======================================================

function parseSheet(ws) {
  const all =
    XLSX.utils.sheet_to_json(ws, {
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
    throw new Error(
      "مش لاقي عمود اسمه: اسم الصنف"
    );
  }

  const [head, ...body] =
    all.slice(headIdx);

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
        keys.map((k, i) => [
          k,
          r[i] ?? null,
        ])
      )
    )

    // استبعاد الصفوف الفاضية
    .filter(
      (r) => r["اسم الصنف"]
    )

    .map((r) => ({
      itemId: Number(
        r["رقم الصنف"]
      ),

      name: r["اسم الصنف"],

      qty: Number(
        r["إجمالى الكمية"] ?? 0
      ),

      category:
        r["التصنيف"] ?? null,

      manufacturer:
        r["المصنع"] ?? null,

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
  storage:
    multer.memoryStorage(),
});

// ======================================================
// استيراد Excel
// ======================================================

app.post(
  "/api/products/import",
  excelUpload.single("file"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            "من فضلك اختر ملف Excel",
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

      const items =
        parseSheet(ws);

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

      const ops = items.map(
        (item) => ({
          updateOne: {
            filter: {
              itemId: item.itemId,
            },

            update: {
              $set: {
                itemId:
                  item.itemId,

                name: item.name,

                qty: item.qty,

                category:
                  item.category,

                manufacturer:
                  item.manufacturer,

                barcode:
                  item.barcode,

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
        await Product.bulkWrite(
          ops
        );

      // ==================================================
      // الإحصائيات
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

        inactive:
          inactiveCount,
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
);

// ======================================================
// كل الأصناف الحالية
// ======================================================

app.get(
  "/api/products",
  async (req, res) => {
    try {
      if (
        mongoose.connection.readyState !==
        1
      ) {
        return res.status(503).json({
          error:
            "قاعدة البيانات غير متصلة حاليًا",
        });
      }

      const products =
        await Product.find({
          active: true,
        }).sort({
          itemId: 1,
        });

      res.json(products);
    } catch (err) {
      console.error(
        "Get products error:",
        err
      );

      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ======================================================
// صنف واحد برقمه
// ======================================================

app.get(
  "/api/products/:itemId",
  async (req, res) => {
    try {
      if (
        mongoose.connection.readyState !==
        1
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
);

// ======================================================
// رفع / تحديث صورة
// ======================================================

app.post(
  "/api/products/:itemId/image",
  upload.single("image"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            "من فضلك اختر صورة",
        });
      }

      if (
        mongoose.connection.readyState !==
        1
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
);

// ======================================================
// معالجة أخطاء Multer
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Server error:",
      err
    );

    res.status(400).json({
      success: false,
      error:
        err.message ||
        "حدث خطأ في السيرفر",
    });
  }
);

// ======================================================
// تشغيل السيرفر أولًا
// ======================================================

const server =
  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Server running on port ${PORT}`
      );

      console.log(
        `MongoDB configured: ${
          !!process.env.MONGO_URI
        }`
      );
    }
  );

// ======================================================
// الاتصال بـ MongoDB بعد تشغيل السيرفر
// ======================================================

async function connectMongoDB() {
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not configured"
    );

    return;
  }

  try {
    console.log(
      "Connecting to MongoDB..."
    );

    await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }
    );

    console.log(
      "MongoDB connected successfully"
    );
  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err.message
    );
  }
}

connectMongoDB();

// ======================================================
// MongoDB events
// ======================================================

mongoose.connection.on(
  "connected",
  () => {
    console.log(
      "Mongoose: connected"
    );
  }
);

mongoose.connection.on(
  "error",
  (err) => {
    console.error(
      "Mongoose error:",
      err.message
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    console.log(
      "Mongoose: disconnected"
    );
  }
);

// ======================================================
// إغلاق آمن
// ======================================================

process.on(
  "SIGTERM",
  async () => {
    console.log(
      "SIGTERM received"
    );

    server.close(
      async () => {
        await mongoose.connection.close();

        process.exit(0);
      }
    );
  }
);

process.on(
  "SIGINT",
  async () => {
    console.log(
      "SIGINT received"
    );

    server.close(
      async () => {
        await mongoose.connection.close();

        process.exit(0);
      }
    );
  }
);