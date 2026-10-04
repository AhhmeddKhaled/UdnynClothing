const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads"
);

// ======================================================
// Create uploads directory
// ======================================================

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ======================================================
// Product Image Upload
// ======================================================

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(
      file.originalname
    );

    cb(
      null,
      `${req.params.itemId}${ext}`
    );
  },
});

const imageUpload = multer({
  storage: imageStorage,

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
// Excel Upload
// ======================================================

const excelUpload = multer({
  storage: multer.memoryStorage(),
});

module.exports = {
  imageUpload,
  excelUpload,
  uploadDir,
};