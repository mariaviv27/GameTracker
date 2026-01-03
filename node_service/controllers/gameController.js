const Game = require("../models/Game");
const UserGame = require("../models/UserGame");

// Listar todos los juegos
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Añadir un juego global
exports.addGame = async (req, res) => {
    const { title, platform, genre, description, cover, releaseDate } = req.body;
    try {
        // Evitar duplicados
        let existing = await Game.findOne({ title });
        if (existing) return res.status(400).json({ message: "El juego ya existe" });

        const game = new Game({ title, platform, genre, description, cover, releaseDate });
        await game.save();
        res.status(201).json(game);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Obtener un juego por ID
exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: "Juego no encontrado" });
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Editar un juego global
exports.updateGame = async (req, res) => {
  const { id } = req.params;
  const { title, platform, genre, description, cover, releaseDate } = req.body;

  try {
    const game = await Game.findByIdAndUpdate(
      id,
      { title, platform, genre, description, cover, releaseDate },
      { new: true }
    );
    if (!game) return res.status(404).json({ message: "Juego no encontrado" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Borrar juego global con cascada
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Juego no encontrado" });

    // Eliminar todas las entradas de user-games que tengan este gameId
    await UserGame.deleteMany({ gameId: game._id });

    // Eliminar el juego global
    await Game.deleteOne({ _id: game._id }); // mejor que game.remove()

    res.json({ message: "Juego global y todas las entradas de usuarios eliminadas" });
  } catch (error) {
    console.error(error); // 🔑 imprimir el error real para depurar
    res.status(500).json({ message: "Error al eliminar el juego" });
  }
}

