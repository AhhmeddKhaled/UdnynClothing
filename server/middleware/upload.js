const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// Upload Directory
// ======================================================

const uploadDir = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// ======================================================
// Disk Storage
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(
      file.originalname
    );

    const filename =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;

    cb(null, filename);
  },
});

// ======================================================
// Image Upload
// ======================================================

const imageUpload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed"
        )
      );
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ======================================================
// Excel Upload
// ======================================================

const excelUpload = multer({
  storage: multer.memoryStorage(),

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream",
    ];

    if (
      allowedTypes.includes(file.mimetype) ||
      file.originalname
        .toLowerCase()
        .endsWith(".xlsx") ||
      file.originalname
        .toLowerCase()
        .endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only Excel files are allowed"
        )
      );
    }
  },

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ======================================================
// Exports
// ======================================================

module.exports = {
  imageUpload,
  excelUpload,
};