const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const passport = require("passport");

dotenv.config();
connectDB();

const app = express();

// Configurar Passport
require("./config/passport");
app.use(passport.initialize());

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/games", require("./routes/games"));
app.use("/api/user-games", require("./routes/userGames"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
