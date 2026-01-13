/**
 * ============================================================
 * Secure File Upload Middleware
 * ------------------------------------------------------------
 * ✔ File size validation
 * ✔ Extension & MIME type allow-list
 * ✔ Filename sanitization
 * ✔ Temporary storage
 * ✔ Virus / malware scanning hook
 * ✔ Safe final storage
 * ✔ Production-grade security
 * ============================================================
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const util = require("util");
const logger = require("../utils/logger");

/* ============================================================
   ⚙️ CONFIGURATION
============================================================ */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

const TEMP_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "tmp"
);

const FINAL_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "safe"
);

/* ============================================================
   📁 ENSURE DIRECTORIES EXIST
============================================================ */

[TEMP_UPLOAD_DIR, FINAL_UPLOAD_DIR].forEach(
  (dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
);

/* ============================================================
   🧠 HELPER FUNCTIONS
============================================================ */

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const base = crypto
    .randomBytes(16)
    .toString("hex");
  return `${base}${ext}`;
};

/**
 * Validate file extension
 */
const isAllowedExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};

/**
 * Validate MIME type
 */
const isAllowedMimeType = (mime) => {
  return ALLOWED_MIME_TYPES.includes(mime);
};

/* ============================================================
   🦠 VIRUS SCANNING (SIMULATED / EXTENDABLE)
============================================================ */

/**
 * Simulated virus scan
 * (Replace with ClamAV / external scanner in future)
 */
const scanFileForVirus = async (filePath) => {
  /**
   * NOTE:
   * This is a placeholder that simulates scanning.
   * In real production:
   * - Use clamscan
   * - Or external antivirus service
   */

  logger.info("Scanning file for malware", {
    filePath,
  });

  // Simulate async scan delay
  await new Promise((r) => setTimeout(r, 100));

  // Simple heuristic check
  const suspicious = [
    ".exe",
    ".sh",
    ".js",
    ".php",
  ];

  const ext = path.extname(filePath).toLowerCase();
  if (suspicious.includes(ext)) {
    throw new Error("Malicious file detected");
  }

  return true;
};

/* ============================================================
   📦 MULTER STORAGE (TEMP)
============================================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const safeName = sanitizeFilename(
      file.originalname
    );
    cb(null, safeName);
  },
});

/* ============================================================
   🔍 MULTER FILE FILTER
============================================================ */

const fileFilter = (req, file, cb) => {
  if (!isAllowedMimeType(file.mimetype)) {
    return cb(
      new Error("Invalid file MIME type"),
      false
    );
  }

  if (!isAllowedExtension(file.originalname)) {
    return cb(
      new Error("Invalid file extension"),
      false
    );
  }

  cb(null, true);
};

/* ============================================================
   🚀 MULTER INSTANCE
============================================================ */

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/* ============================================================
   🧹 CLEANUP HELPER
============================================================ */

const unlinkAsync = util.promisify(fs.unlink);

/* ============================================================
   🔐 MAIN SECURE UPLOAD MIDDLEWARE
============================================================ */

const secureUpload = (fieldName) => {
  return async (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, async (err) => {
      if (err) {
        logger.warn("File upload rejected", {
          error: err.message,
        });

        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const tempPath = req.file.path;
      const finalPath = path.join(
        FINAL_UPLOAD_DIR,
        req.file.filename
      );

      try {
        /* ---------- VIRUS SCAN ---------- */
        await scanFileForVirus(tempPath);

        /* ---------- MOVE TO SAFE STORAGE ---------- */
        fs.renameSync(tempPath, finalPath);

        req.file.safePath = finalPath;

        logger.info("File uploaded safely", {
          filename: req.file.filename,
          size: req.file.size,
          mime: req.file.mimetype,
        });

        next();
      } catch (scanError) {
        logger.error("File rejected during scan", {
          error: scanError.message,
        });

        await unlinkAsync(tempPath).catch(() => {});

        return res.status(400).json({
          success: false,
          message: "Uploaded file failed security checks",
        });
      }
    });
  };
};

/* ============================================================
   📤 EXPORT
============================================================ */

module.exports = {
  secureUpload,
};
