const axios = require("axios");

const RAWG_API_KEY = "56faed3c5bd542ff839e76476025af26";
const RAWG_BASE_URL = "https://api.rawg.io/api";

// Obtener juegos
async function fetchGames(page = 1, pageSize = 20) {
  const res = await axios.get(`${RAWG_BASE_URL}/games`, {
    params: {
      key: RAWG_API_KEY,
      page,
      page_size: pageSize
    }
  });

  return res.data.results;
}

// Obtener detalle de un juego
async function fetchGameDetail(rawgId) {
  const res = await axios.get(`${RAWG_BASE_URL}/games/${rawgId}`, {
    params: { key: RAWG_API_KEY }
  });

  return res.data;
}

module.exports = {
  fetchGames,
  fetchGameDetail
};
