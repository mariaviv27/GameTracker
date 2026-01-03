const NODE_API = "http://localhost:5000/api/node";

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el gameId de la URL
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("id");
    if (!gameId) return;

    fetch(`${NODE_API}/games/${gameId}`)
        .then(res => res.json())
        .then(game => {
            const platforms = Array.isArray(game.platform) ? game.platform.join(", ") : game.platform || "-";
            const genres = Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || "-";

            document.getElementById("game-detail").innerHTML = `
                <h2>${game.title}</h2>
                <img src="${game.cover || ''}" class="img-fluid mb-3">
                <p><strong>Descripción:</strong> ${game.description || "-"}</p>
                <p><strong>Plataformas:</strong> ${platforms}</p>
                <p><strong>Géneros:</strong> ${genres}</p>
            `;
        })
        .catch(err => {
            console.error("Error cargando el juego:", err);
            document.getElementById("game-detail").innerHTML = "<p>No se pudo cargar el juego.</p>";
        });
});
