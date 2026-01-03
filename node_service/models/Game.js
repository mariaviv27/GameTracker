const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    platform: { type: [String], default: [] },
    genre: { type: [String], default: [] },
    description: { type: String, default: "" },
    cover: { type: String, default: "" }, // URL de portada
    releaseDate: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);
