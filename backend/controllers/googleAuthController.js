const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { completeLogin } = require("./authController");
let keys = [], expiresAt = 0;
const configured = () => Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
const config = (req, res) => res.json({ success: true, configured: configured(), clientId: process.env.GOOGLE_CLIENT_ID?.trim() || "", message: configured() ? "" : "Google sign-in is unavailable. Ask your administrator to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the backend." });
async function verifyGoogleToken(token) {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || decoded.header.alg !== "RS256" || !decoded.header.kid) throw new Error("Invalid identity token");
  if (Date.now() >= expiresAt || !keys.some(key => key.kid === decoded.header.kid)) {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Unable to verify identity");
    const body = await response.json(); keys = Array.isArray(body.keys) ? body.keys : [];
    const maxAge = Number(response.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1] || 300);
    expiresAt = Date.now() + Math.min(maxAge, 3600) * 1000;
  }
  const key = keys.find(key => key.kid === decoded.header.kid && key.kty === "RSA");
  if (!key) throw new Error("Invalid identity key");
  const payload = jwt.verify(token, crypto.createPublicKey({ key, format: "jwk" }), { algorithms: ["RS256"], audience: process.env.GOOGLE_CLIENT_ID.trim(), issuer: ["accounts.google.com", "https://accounts.google.com"] });
  if (!Number.isFinite(payload.exp) || !payload.sub || payload.email_verified !== true || !/^\S+@\S+\.\S+$/.test(payload.email || "")) throw new Error("Unverified Google email");
  return payload;
}
async function login(req, res) {
  if (!configured()) return res.status(503).json({ success: false, message: "Google sign-in is not configured. Contact HR Administrator." });
  const origin = req.get("origin");
  const allowed = (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173").split(",").map(value => value.trim().replace(/\/$/, ""));
  if (!allowed.includes(origin) || req.get("x-requested-with")?.toLowerCase() !== "xmlhttprequest") return res.status(403).json({ success: false, message: "Invalid Google sign-in request. Please sign in from HRMS." });
  if (typeof req.body.code !== "string" || !req.body.code.trim() || req.body.code.length > 4096) return res.status(400).json({ success: false, message: "Google did not return an authorization code. Please try again." });
  let identity;
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: req.body.code, client_id: process.env.GOOGLE_CLIENT_ID.trim(), client_secret: process.env.GOOGLE_CLIENT_SECRET.trim(), redirect_uri: origin, grant_type: "authorization_code" }), signal: AbortSignal.timeout(10000) });
    const tokens = await response.json();
    if (!response.ok || !tokens.id_token) return res.status(401).json({ success: false, message: "Google sign-in could not be completed. Please try again or contact HR Administrator." });
    identity = await verifyGoogleToken(tokens.id_token);
  } catch (error) {
    return res.status(error.name === "TimeoutError" ? 504 : 401).json({ success: false, message: error.name === "TimeoutError" ? "Google sign-in timed out. Please try again." : "Google could not verify your account. Please try again." });
  }
  try {
    const user = await User.findOne({ email: identity.email.trim().toLowerCase() }).select("+refreshTokenVersion");
    if (!user) return res.status(404).json({ success: false, message: "No account found. Contact HR Administrator." });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact HR." });
    if (user.isLocked?.()) return res.status(423).json({ success: false, message: "Account locked. Please try again later or contact HR." });
    return await completeLogin(user, res);
  } catch { return res.status(500).json({ success: false, message: "Unable to complete sign-in. Please try again." }); }
}
module.exports = { config, login, verifyGoogleToken };
