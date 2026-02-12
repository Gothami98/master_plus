const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../it_db");

const router = express.Router();
// Regsiter API nn
router.post("/register", async (req, res) => {
  const { name, email, mobile, district, password } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
          return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (name,email,mobile,district,password) VALUES (?,?,?,?,?)",
          [name, email, mobile, district, hashedPassword],
          (err, data) => {
            if (err) return res.status(500).json(err);

            res.json({ message: "Registration successful" });
          },
        );
      },
    );
  } catch (err) {
    res.status(500).json(err);
  }
});
// Login API

router.post("/login", (req, res) => {
  const { emailOrMobile, password } = req.body;

  console.log("BODY:", req.body);   // 🔴 add
  console.log("VALUE:", emailOrMobile);

  const query = `
    SELECT * FROM users 
    WHERE email = ? OR mobile = ?
  `;

  db.query(query, [emailOrMobile, emailOrMobile], async (err, results) => {

    console.log("DB results:", results); // 🔴 add
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});


module.exports = router;
