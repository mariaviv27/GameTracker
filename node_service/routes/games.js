const express = require("express");
const router = express.Router();
const { getAllGames, getGameById, addGame, updateGame, deleteGame } = require("../controllers/gameController");
const verifyAdmin = require("../middleware/verifyAdmin");

// Rutas
router.get("/", getAllGames);
router.get("/:id", getGameById);
router.post("/", addGame);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);


module.exports = router;
