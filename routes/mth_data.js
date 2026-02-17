const express = require("express");
const db = require("../math_db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join("uploads", "papers");
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =========================
// GET ALL STUDENTS
// =========================
router.get("/students", (req, res) => {
  const { name, email } = req.query;

  let sql = "SELECT id, name, email, mobile, district FROM users";
  const params = [];
  const where = [];

  if (name) {
    where.push("name LIKE ?");
    params.push(`%${name}%`);
  }

  if (email) {
    where.push("email LIKE ?");
    params.push(`%${email}%`);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(" AND ")}`;
  }

  sql += " ORDER BY id DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

// =========================
// TOTAL STUDENT COUNT
// =========================
router.get("/students/count", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json({ total: results[0]?.total || 0 });
  });
});

// =========================
// PAST PAPERS (ADMIN)
// =========================
router.get("/papers/count", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM past_papers", (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json({ total: results[0]?.total || 0 });
  });
});

router.get("/papers", (req, res) => {
  db.query("SELECT * FROM past_papers ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

router.post("/papers", upload.single("file"), (req, res) => {
  const { title, class_type, year, month, week } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const file_location = req.file.path;

  db.query(
    "INSERT INTO past_papers (title, class_type, year, month, week, file_location) VALUES (?, ?, ?, ?, ?, ?)",
    [title, class_type, year, month, week, file_location],
    (err) => {
      if (err) return res.status(500).json(err);
      return res.json({ message: "Paper uploaded" });
    }
  );
});

// =========================
// VIDEOS (COUNT)
// =========================
router.get("/videos/count", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM videos", (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json({ total: results[0]?.total || 0 });
  });
});

module.exports = router;
