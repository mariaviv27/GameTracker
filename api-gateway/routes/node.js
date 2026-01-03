const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = express.Router();
const NODE_URL = "http://localhost:3000";

router.use(
  createProxyMiddleware({
    target: NODE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/": "/api/"   // 🔑 CLAVE
    }
  })
);

module.exports = router;
