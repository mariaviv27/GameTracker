const mongoose = require("mongoose");

const userGameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  rating: { type: Number, min: 0, max: 10 },
  hoursPlayed: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("UserGame", userGameSchema);
