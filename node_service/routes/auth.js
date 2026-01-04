const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { register, login } = require("../controllers/authController");

// ─── AUTH LOCAL ─────────────────────────

// Registro con email/contraseña
router.post("/register", register);

// Login con email/contraseña
router.post("/login", login);

// ─── AUTH GITHUB ─────────────────────────

// Paso 1: redirigir a GitHub
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"]
  })
);

// Paso 2: callback de GitHub
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "http://localhost:5500/login.html"
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Redirigir al frontend con el token
      res.redirect(
        `http://localhost:5500/login-success.html?token=${token}`
      );
    } catch (err) {
      console.error("Error generando JWT:", err);
      res.redirect("http://localhost:5500/login.html");
    }
  }
);

module.exports = router;
