require("dotenv").config();
const mongoose = require("mongoose");
const Game = require("../models/Game");
const { fetchGames, fetchGameDetail } = require("../services/rawg.service");

const MONGO_URI = "mongodb://localhost:27017/gametracker";

async function importGames() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado a MongoDB");

  const games = await fetchGames(1, 40); // primera página

  for (const g of games) {
    const exists = await Game.findOne({ title: g.name });
    if (exists) {
      console.log(`⏩ Ya existe: ${g.name}`);
      continue;
    }

    const detail = await fetchGameDetail(g.id);

    const newGame = new Game({
      title: detail.name,
      platform: detail.platforms?.map(p => p.platform.name) || [],
      genre: detail.genres?.map(g => g.name) || [],
      description: detail.description_raw || "",
      cover: detail.background_image || "",
      releaseDate: detail.released || ""
    });

    await newGame.save();
    console.log(`🎮 Guardado: ${detail.name}`);
  }

  console.log("🚀 Importación finalizada");
  process.exit();
}

importGames().catch(err => {
  console.error(err);
  process.exit(1);
});
