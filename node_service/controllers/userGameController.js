const UserGame = require("../models/UserGame");
const Game = require("../models/Game");

// Listar juegos de un usuario
exports.getUserGames = async (req, res) => {
  const userId = req.user.id; // req.user viene del middleware de auth
  try {
    const userGames = await UserGame.find({ userId }).populate("gameId");
    res.json(userGames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Añadir juego a lista de usuario
exports.addUserGame = async (req, res) => {
  const userId = req.user.id;
  const { gameId, rating, hoursPlayed } = req.body;

  try {
    // Verificar que el juego global exista
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ message: "Juego global no encontrado" });

    // Evitar duplicados
    let existing = await UserGame.findOne({ userId, gameId });
    if (existing) return res.status(400).json({ message: "Juego ya en tu lista" });

    const userGame = new UserGame({ userId, gameId, rating, hoursPlayed });
    await userGame.save();
    res.status(201).json(userGame);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar rating y horas jugadas de un juego de usuario
exports.updateUserGame = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { rating, hoursPlayed } = req.body;

  try {
    const userGame = await UserGame.findOneAndUpdate(
      { _id: id, userId },
      { rating, hoursPlayed },
      { new: true }
    );
    if (!userGame) return res.status(404).json({ message: "Juego de usuario no encontrado" });
    res.json(userGame);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Borrar juego de la lista de usuario
exports.deleteUserGame = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const userGame = await UserGame.findOneAndDelete({ _id: id, userId });
    if (!userGame) return res.status(404).json({ message: "Juego de usuario no encontrado" });
    res.json({ message: "Juego eliminado de tu lista correctamente" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
