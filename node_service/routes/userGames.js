const express = require("express");
const router = express.Router();
const { getUserGames, addUserGame, updateUserGame, deleteUserGame } = require("../controllers/userGameController");
const verifyToken = require("../middleware/verifyToken"); // middleware JWT

// Todas las rutas protegidas con JWT
router.use(verifyToken);

router.get("/", getUserGames);
router.post("/", addUserGame);
router.put("/:id", updateUserGame);
router.delete("/:id", deleteUserGame);


module.exports = router;
