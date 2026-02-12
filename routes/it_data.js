const express = require('express');
const db = require('../it_db');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    if (req.originalUrl.includes('papers'))
      cb(null, 'uploads/papers');
    else if (req.originalUrl.includes('tutes'))
      cb(null, 'uploads/tutes');
    else
      cb(null, 'uploads/videos');
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });



// =========================
// GET ALL
// =========================

router.get('/papers', (req, res) => {
  db.query('SELECT * FROM past_papers ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


router.get('/tutes', (req, res) => {
  db.query('SELECT * FROM tutes ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.get('/videos', (req, res) => {
  db.query('SELECT * FROM videos ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// =========================
// ADD (ADMIN)
// =========================

router.post('/papers', upload.single('file'), (req, res) => {
  const { title, year, subject } = req.body;

  const file_url = req.file.path;

  db.query(
  'INSERT INTO past_papers (title, year, subject, file_url) VALUES (?, ?, ?, ?)',
  [title, year, subject, file_url],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Paper uploaded' });
    }
  );
});


router.post('/tutes', upload.single('file'), (req, res) => {
  const { title, category, description } = req.body;

  const file_url = req.file.path;

  db.query(
    'INSERT INTO tutes (title, category, description, file_url) VALUES (?, ?, ?, ?)',
    [title, category, description, file_url],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Tute uploaded' });
    }
  );
});

router.post('/videos', upload.single('file'), (req, res) => {
  const { title, duration, category } = req.body;

  const video_url = req.file.path;

  db.query(
    'INSERT INTO videos (title, duration, category, video_url) VALUES (?, ?, ?, ?)',
    [title, duration, category, video_url],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Video uploaded' });
    }
  );
});



// =========================
// UPDATE (EDIT)
// =========================

router.put('/papers/:id', (req, res) => {
  const { title, type, subject, file_url } = req.body;

  db.query(
    'UPDATE past_papers SET title=?, type=?, subject=?, file_url=? WHERE id=?',
    [title, type, subject, file_url, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Paper updated' });
    }
  );
});


router.put('/tutes/:id', (req, res) => {
  const { title, category, description, file_url } = req.body;

  db.query(
    'UPDATE tutes SET title=?, category=?, description=?, file_url=? WHERE id=?',
    [title, category, description, file_url, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Tute updated' });
    }
  );
});

router.put('/videos/:id', (req, res) => {
  const { title, duration, category, video_url } = req.body;

  db.query(
    'UPDATE videos SET title=?, duration=?, category=?, video_url=? WHERE id=?',
    [title, duration, category, video_url, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Video updated' });
    }
  );
});


// =========================
// DELETE
// =========================

router.delete('/papers/:id', (req, res) => {
  db.query('DELETE FROM past_papers WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Paper deleted' });
  });
});


router.delete('/tutes/:id', (req, res) => {
  db.query('DELETE FROM tutes WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Tute deleted' });
  });
});

router.delete('/videos/:id', (req, res) => {
  db.query('DELETE FROM videos WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Video deleted' });
  });
});


// =========================
// VIDEO ACCESS CONTROL
// =========================

router.get('/video-access/:userId', (req, res) => {
  db.query(
    'SELECT video_id FROM student_video_access WHERE user_id=?',
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results.map(r => r.video_id));
    }
  );
});

router.post('/video-access', (req, res) => {
  const { userId, videoId } = req.body;

  db.query(
    'INSERT INTO student_video_access (user_id, video_id) VALUES (?, ?)',
    [userId, videoId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Access granted' });
    }
  );
});

router.delete('/video-access', (req, res) => {
  const { userId, videoId } = req.body;

  db.query(
    'DELETE FROM student_video_access WHERE user_id=? AND video_id=?',
    [userId, videoId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Access removed' });
    }
  );
});

module.exports = router;
