const NODE_API = "http://localhost:5000/api/node";
const PYTHON_API = "http://localhost:5000/api/python";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) window.location.href = "login.html";

    const analyticsDiv = document.getElementById("analytics");
    const userGamesContainer = document.getElementById("user-games-list");

    const searchInput = document.getElementById("search");
    const filterPlatform = document.getElementById("filter-platform");
    const filterGenre = document.getElementById("filter-genre");

    const statsFilterGenre = document.getElementById("stats-filter-genre");
    const statsFilterPlatform = document.getElementById("stats-filter-platform");

    const addUserGameBtn = document.getElementById("add-user-game");

    let allUserGames = [];

    addUserGameBtn.addEventListener("click", () => window.location.href = "index.html");

    async function loadUserGames() {
        try {
            const res = await fetch(`${NODE_API}/user-games`, {
                headers: { "Authorization": "Bearer " + token }
            });
            allUserGames = await res.json();
            displayUserGames(allUserGames);
        } catch (err) {
            console.error(err);
        }
    }

    function displayUserGames(games) {
        userGamesContainer.innerHTML = games.map(ug => {
            const game = ug.gameId;
            return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${game.title}</strong> - Géneros: ${Array.isArray(game.genre) ? game.genre.join(", ") : game.genre} - Plataformas: ${Array.isArray(game.platform) ? game.platform.join(", ") : game.platform}
                </div>
                <div>
                    Rating: ${ug.rating} | Horas: ${ug.hoursPlayed}
                    <button class="btn btn-warning btn-sm ms-2 btn-edit" data-id="${ug._id}" data-rating="${ug.rating}" data-hours="${ug.hoursPlayed}">Editar</button>
                    <button class="btn btn-danger btn-sm ms-2 btn-delete" data-id="${ug._id}">Borrar</button>
                </div>
            </div>
            `;
        }).join("");
    }

    function filterUserGames() {
        const search = searchInput.value.toLowerCase();
        const platform = filterPlatform.value;
        const genre = filterGenre.value;

        const filtered = allUserGames.filter(ug => {
            const game = ug.gameId;
            const matchesTitle = game.title.toLowerCase().includes(search);
            const matchesPlatform = platform ? (Array.isArray(game.platform) ? game.platform.includes(platform) : game.platform === platform) : true;
            const matchesGenre = genre ? (Array.isArray(game.genre) ? game.genre.includes(genre) : game.genre === genre) : true;
            return matchesTitle && matchesPlatform && matchesGenre;
        });

        displayUserGames(filtered);
    }

    searchInput.addEventListener("input", filterUserGames);
    filterPlatform.addEventListener("change", filterUserGames);
    filterGenre.addEventListener("change", filterUserGames);

    async function loadAnalytics() {
        const genre = statsFilterGenre.value;
        const platform = statsFilterPlatform.value;

        try {
            const res = await fetch(`${PYTHON_API}/analytics/user/${userId}?genre=${genre}&platform=${platform}`);
            const stats = await res.json();
            analyticsDiv.innerHTML = `
                <p>Total horas: ${stats.total_hours}</p>
                <p>Rating promedio: ${stats.average_rating.toFixed(2)}</p>
                <p>Juegos jugados: ${stats.games_count}</p>
            `;
        } catch (err) {
            console.error(err);
        }
    }

    statsFilterGenre.addEventListener("change", loadAnalytics);
    statsFilterPlatform.addEventListener("change", loadAnalytics);

    userGamesContainer.addEventListener("click", async e => {
        const target = e.target;
        const userGameId = target.dataset.id;
        if (!userGameId) return;

        if (target.classList.contains("btn-delete")) {
            if (!confirm("¿Seguro que quieres borrar este juego?")) return;
            await fetch(`${NODE_API}/user-games/${userGameId}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            await loadUserGames();
            loadAnalytics();
        }

        if (target.classList.contains("btn-edit")) {
            document.getElementById("edit-user-game-id").value = userGameId;
            document.getElementById("edit-user-rating").value = target.dataset.rating;
            document.getElementById("edit-user-hours").value = target.dataset.hours;
            new bootstrap.Modal(document.getElementById('editUserGameModal')).show();
        }
    });

    document.getElementById("save-user-edit-btn").addEventListener("click", async () => {
        const gameId = document.getElementById("edit-user-game-id").value;
        const rating = Number(document.getElementById("edit-user-rating").value);
        const hoursPlayed = Number(document.getElementById("edit-user-hours").value);

        if (rating < 1 || rating > 10 || hoursPlayed < 0) {
            alert("Valores inválidos");
            return;
        }

        await fetch(`${NODE_API}/user-games/${gameId}`, {
            method: "PUT",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rating, hoursPlayed })
        });

        await loadUserGames();
        loadAnalytics();
        bootstrap.Modal.getInstance(document.getElementById('editUserGameModal')).hide();
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    loadUserGames();
    loadAnalytics();
});
