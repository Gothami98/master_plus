const crypto = require("crypto");

const AUTH_SECRET = process.env.MATHS_AUTH_SECRET || process.env.JWT_SECRET || "change-me-maths-auth-secret";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const toBase64Url = (value) => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value) => Buffer.from(value, "base64url").toString("utf8");

const sign = (value) => crypto.createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");

const createAuthToken = (userId) => {
  const payload = {
    sub: String(userId),
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

const verifyAuthToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(encodedPayload));
  } catch (err) {
    return null;
  }

  const parsedUserId = Number.parseInt(payload?.sub, 10);
  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  if (!payload?.exp || Number(payload.exp) < Date.now()) {
    return null;
  }

  return { userId: parsedUserId };
};

const requireMathsAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim();
  const verified = verifyAuthToken(token);

  if (!verified) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.authUserId = verified.userId;
  return next();
};

module.exports = {
  createAuthToken,
  requireMathsAuth,
};
