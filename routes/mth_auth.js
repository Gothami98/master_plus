const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../math_db");
const { createAuthToken } = require("./mth_auth_middleware");

const router = express.Router();

const formatAuthUser = (user) => ({
  id: String(user.id ?? ""),
  name: user.name || "",
  email: user.email || "",
  mobile: user.mobile || "",
  district: user.district || "",
  alYear: user.year ?? 0,
});

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendResetEmail = async (to, resetLink) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[MATHS reset link for ${to}] ${resetLink}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your password",
    text: `Use this link to reset your password: ${resetLink}`,
    html: `<p>Use this link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
};

// Register API
router.post("/register", async (req, res) => {
  const { name, email, mobile, district, password } = req.body;
  const rawYear = req.body.year ?? req.body.alYear;
  const parsedYear = Number.parseInt(rawYear, 10);
  const safeYear = Number.isInteger(parsedYear) && parsedYear >= 0 ? parsedYear : 0;

  try {
    db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name,email,mobile,district,password,year) VALUES (?,?,?,?,?,?)",
        [name, email, mobile, district, hashedPassword, safeYear],
        (insertErr, insertResult) => {
          if (insertErr) return res.status(500).json(insertErr);

          const user = formatAuthUser({
            id: insertResult.insertId,
            name,
            email,
            mobile,
            district,
            year: safeYear,
          });

          return res.json({
            ...user,
            token: createAuthToken(insertResult.insertId),
          });
        }
      );
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Login API
router.post("/login", (req, res) => {
  const { emailOrMobile, password } = req.body;

  const query = `
    SELECT * FROM users
    WHERE email = ? OR mobile = ?
  `;

  db.query(query, [emailOrMobile, emailOrMobile], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const formattedUser = formatAuthUser(user);

    return res.json({
      ...formattedUser,
      token: createAuthToken(user.id),
    });
  });
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendBase}/reset-password/${token}`;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.json({
        message: "If an account exists for this email, a reset link was sent.",
      });
    }

    db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [token, expiresAt, email],
      async (updateErr) => {
        if (updateErr) return res.status(500).json(updateErr);

        try {
          await sendResetEmail(email, resetLink);
          return res.json({
            message: "If an account exists for this email, a reset link was sent.",
          });
        } catch (mailErr) {
          return res.status(500).json({ message: "Failed to send reset email", error: mailErr.message });
        }
      }
    );
  });
});

// ================= RESET PASSWORD =================
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "New password is required" });
  }

  db.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
    [token],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
        [hashedPassword, results[0].id],
        (updateErr) => {
          if (updateErr) return res.status(500).json(updateErr);
          return res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});

module.exports = router;
