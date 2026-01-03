const express = require("express");
const cors = require("cors");
require("dotenv").config();

const nodeRoutes = require("./routes/node");
const pythonRoutes = require("./routes/python");

const app = express();

app.use(cors());
app.use("/api/node", nodeRoutes);
app.use("/api/python", express.json(), pythonRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway escuchando en http://localhost:${PORT}`);
});
