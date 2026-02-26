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

// =========================
// STUDENT TASK MANAGER
// =========================
router.get("/tasks", (req, res) => {
  const { user_id, status = "all" } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  let sql = `
    SELECT id, user_id, title, description, due_date, is_completed, created_at, updated_at
    FROM tasks
    WHERE user_id = ?
  `;
  const params = [user_id];

  if (status === "completed") {
    sql += " AND is_completed = 1";
  } else if (status === "pending") {
    sql += " AND is_completed = 0";
  }

  sql += " ORDER BY is_completed ASC, due_date IS NULL ASC, due_date ASC, id DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
});

router.post("/tasks", (req, res) => {
  const { user_id, title, description = null, due_date = null } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ message: "user_id and title are required" });
  }

  db.query(
    "INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
    [user_id, title, description, due_date],
    (err, result) => {
      if (err) return res.status(500).json(err);
      return res.json({ message: "Task created", id: result.insertId });
    }
  );
});

router.put("/tasks/:id", (req, res) => {
  const { user_id, title, description = null, due_date = null } = req.body;
  const { id } = req.params;

  if (!user_id || !title) {
    return res.status(400).json({ message: "user_id and title are required" });
  }

  db.query(
    "UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ? AND user_id = ?",
    [title, description, due_date, id, user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.json({ message: "Task updated" });
    }
  );
});

router.patch("/tasks/:id/completed", (req, res) => {
  const { user_id, is_completed = true } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  db.query(
    "UPDATE tasks SET is_completed = ? WHERE id = ? AND user_id = ?",
    [is_completed ? 1 : 0, id, user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.json({ message: "Task status updated" });
    }
  );
});

router.delete("/tasks/:id", (req, res) => {
  const { user_id } = req.query;
  const { id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.json({ message: "Task deleted" });
  });
});

module.exports = router;
