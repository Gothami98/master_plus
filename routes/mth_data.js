const express = require("express");
const db = require("../math_db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireMathsAuth } = require("./mth_auth_middleware");

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
// GET CLASS MATRIX
// =========================
router.get("/get_class_matrix", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM users) AS total_students,
      (SELECT COUNT(*) FROM past_papers) AS total_papers,
      (SELECT COUNT(*) FROM videos) AS total_videos

  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    return res.json({
      total_students: results[0]?.total_students || 0,
      total_papers: results[0]?.total_papers || 0,
      total_videos: results[0]?.total_videos || 0,
    });
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

router.put("/papers/:id", (req, res) => {
  const { title, class_type, year, month, week, file_location } = req.body;

  db.query(
    "UPDATE past_papers SET title=?, class_type=?, year=?, month=?, week=?, file_location=? WHERE id=?",
    [title, class_type, year, month, week, file_location, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      return res.json({ message: "Paper updated" });
    }
  );
});

router.delete("/papers/:id", (req, res) => {
  db.query("DELETE FROM past_papers WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: "Paper deleted" });
  });
});



module.exports = router;
