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

const tuteStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join("uploads", "tutes");
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadTute = multer({ storage: tuteStorage });

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

// Paper API
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

router.put("/papers/:id", requireMathsAuth, upload.single("file"), (req, res) => {
  const { title, class_type, year, month, week } = req.body;

  let file_location = req.body.file_location;

  if (req.file) {
    file_location = req.file.path;
  }

  db.query(
    "UPDATE past_papers SET title=?, class_type=?, year=?, month=?, week=?, file_location=? WHERE id=?",
    [title, class_type, year, month, week, file_location, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Paper updated" });
    }
  );
});


router.delete("/papers/:id", requireMathsAuth, (req, res) => {
  const id = req.params.id;

  // 1. get file path
  db.query("SELECT file_location FROM past_papers WHERE id=?", [id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const filePath = results[0].file_location;

    // 2. delete db record
    db.query("DELETE FROM past_papers WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      // 3. delete file from uploads folder
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.json({ message: "Paper deleted successfully" });
    });
  });
});

// Tute API
router.get("/tutes", (req, res) => {
  db.query("SELECT * FROM tutes ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

router.post("/tutes", uploadTute.single("file"), (req, res) => {
  const { title, category, description, year, month, week } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const file_location = req.file.path;

  db.query(
    "INSERT INTO tutes (title, category, description, year, month, week, file_location) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, category, description, year, month, week, file_location],
    (err) => {
      if (err) return res.status(500).json(err);
      return res.json({ message: "Tute uploaded" });
    }
  );
});

router.put("/tutes/:id", requireMathsAuth, uploadTute.single("file"), (req, res) => {
  const { title, category, description, year, month, week } = req.body;
  let file_location = req.body.file_location;

  if (req.file) {
    file_location = req.file.path;
  }

  db.query(
    "UPDATE tutes SET title=?, category=?, description=?, year=?, month=?, week=?, file_location=? WHERE id=?",
    [title, category, description, year, month, week, file_location, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Tute updated" });
    }
  );
});

router.delete("/tutes/:id", requireMathsAuth, (req, res) => {
  const id = req.params.id;

  db.query("SELECT file_location FROM tutes WHERE id=?", [id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "Tute not found" });
    }

    const filePath = results[0].file_location;

    db.query("DELETE FROM tutes WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.json({ message: "Tute deleted successfully" });
    });
  });
});

// Video API
router.get("/videos", (req, res) => {
  db.query("SELECT * FROM videos ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

router.post("/videos", (req, res) => {
  const { title, category, year, month, week, duration, video_url } = req.body;

  if (!video_url) {
    return res.status(400).json({ message: "video_url is required" });
  }

  db.query(
    "INSERT INTO videos (title, category, year, month, week, duration, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, category, year, month, week, duration, video_url],
    (err) => {
      if (err) return res.status(500).json(err);
      return res.json({ message: "Video uploaded" });
    }
  );
});

router.put("/videos/:id", requireMathsAuth, (req, res) => {
  const { title, category, year, month, week, duration, video_url } = req.body;

  db.query(
    "UPDATE videos SET title=?, category=?, year=?, month=?, week=?, duration=?, video_url=? WHERE id=?",
    [title, category, year, month, week, duration, video_url, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Video updated" });
    }
  );
});

router.delete("/videos/:id", requireMathsAuth, (req, res) => {
  const id = req.params.id;

  db.query("SELECT id FROM videos WHERE id=?", [id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    db.query("DELETE FROM videos WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      return res.json({ message: "Video deleted successfully" });
    });
  });
});


// =========================
// VIDEO ACCESS MANAGEMENT
// =========================

// GET all access records (admin view) - optionally filter by week/year
router.get("/video-access", requireMathsAuth, (req, res) => {
  const { week, year, user_id } = req.query;

  let sql = `
    SELECT 
      va.id,
      va.user_id,
      va.video_id,
      va.is_active,
      va.created_at,
      u.name AS student_name,
      u.email AS student_email,
      v.title AS video_title,
      v.week,
      v.year,
      v.category
    FROM video_access va
    JOIN users u ON va.user_id = u.id
    JOIN videos v ON va.video_id = v.id
    WHERE 1=1
  `;
  const params = [];

  if (week) { sql += " AND v.week = ?"; params.push(week); }
  if (year) { sql += " AND v.year = ?"; params.push(year); }
  if (user_id) { sql += " AND va.user_id = ?"; params.push(user_id); }

  sql += " ORDER BY va.id DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

// GET videos accessible by a specific student (used on student side)
router.get("/video-access/student/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT 
      v.id,
      v.title,
      v.category,
      v.year,
      v.month,
      v.week,
      v.duration,
      v.video_url,
      va.is_active
    FROM video_access va
    JOIN videos v ON va.video_id = v.id
    WHERE va.user_id = ? AND va.is_active = 1
    ORDER BY v.id DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

// GET all students with their access status for a specific video
router.get("/video-access/video/:video_id", requireMathsAuth, (req, res) => {
  const { video_id } = req.params;

  const sql = `
    SELECT 
      u.id AS user_id,
      u.name,
      u.email,
      u.district,
      COALESCE(va.is_active, 0) AS has_access,
      va.id AS access_id
    FROM users u
    LEFT JOIN video_access va ON u.id = va.user_id AND va.video_id = ?
    ORDER BY u.name ASC
  `;

  db.query(sql, [video_id], (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

// POST - Grant access to a student for a video
router.post("/video-access", requireMathsAuth, (req, res) => {
  const { user_id, video_id } = req.body;

  if (!user_id || !video_id) {
    return res.status(400).json({ message: "user_id and video_id are required" });
  }

  // Use INSERT ... ON DUPLICATE KEY to avoid duplicates
  const sql = `
    INSERT INTO video_access (user_id, video_id, is_active)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE is_active = 1
  `;

  db.query(sql, [user_id, video_id], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: "Access granted successfully" });
  });
});

// POST - Bulk grant access (multiple students for one video)
router.post("/video-access/bulk", requireMathsAuth, (req, res) => {
  const { user_ids, video_id } = req.body;

  if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !video_id) {
    return res.status(400).json({ message: "user_ids (array) and video_id are required" });
  }

  const values = user_ids.map((uid) => [uid, video_id, 1]);

  const sql = `
    INSERT INTO video_access (user_id, video_id, is_active)
    VALUES ?
    ON DUPLICATE KEY UPDATE is_active = 1
  `;

  db.query(sql, [values], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: `Access granted to ${user_ids.length} student(s)` });
  });
});

// PATCH - Toggle access on/off for a student (admin can revoke without deleting)
router.patch("/video-access/:id/toggle", requireMathsAuth, (req, res) => {
  const { id } = req.params;

  db.query("SELECT is_active FROM video_access WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "Access record not found" });

    const newStatus = results[0].is_active === 1 ? 0 : 1;

    db.query("UPDATE video_access SET is_active = ? WHERE id = ?", [newStatus, id], (err2) => {
      if (err2) return res.status(500).json(err2);
      return res.json({ message: `Access ${newStatus === 1 ? "enabled" : "disabled"}`, is_active: newStatus });
    });
  });
});

// PATCH - Directly set access status (active/inactive)
router.patch("/video-access/:id/status", requireMathsAuth, (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ message: "is_active is required (0 or 1)" });
  }

  db.query("UPDATE video_access SET is_active = ? WHERE id = ?", [is_active, id], (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: "Access status updated" });
  });
});

// DELETE - Completely remove access record
router.delete("/video-access/:id", requireMathsAuth, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM video_access WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Access record not found" });
    return res.json({ message: "Access removed successfully" });
  });
});

// DELETE - Revoke access by user_id + video_id directly
router.delete("/video-access/revoke", requireMathsAuth, (req, res) => {
  const { user_id, video_id } = req.body;

  if (!user_id || !video_id) {
    return res.status(400).json({ message: "user_id and video_id are required" });
  }

  db.query("DELETE FROM video_access WHERE user_id = ? AND video_id = ?", [user_id, video_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "No access record found" });
    return res.json({ message: "Access revoked successfully" });
  });
});

module.exports = router;
