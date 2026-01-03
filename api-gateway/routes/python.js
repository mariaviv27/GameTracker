const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = express.Router();

const PYTHON_URL = "http://localhost:8000";

router.use("/", createProxyMiddleware({
    target: PYTHON_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/python": "" },
}));

module.exports = router;
