const NODE_API = "http://localhost:5000/api/node";
const token = localStorage.getItem("token");
const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));

if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const gamesContainer = document.getElementById("games-list");
    const searchInput = document.getElementById("search");
    const filterGenre = document.getElementById("filter-genre");
    const filterPlatform = document.getElementById("filter-platform");
    const addForm = document.getElementById("add-game-form");

    let allGames = [];

    // ─── CARGAR JUEGOS ─────────────────────────────
    async function loadGames() {
        try {
            const res = await fetch(`${NODE_API}/games`);
            allGames = await res.json();
            displayGames(allGames);
        } catch (err) {
            console.error("Error cargando juegos:", err);
        }
    }

    // ─── MOSTRAR JUEGOS ─────────────────────────────
    function displayGames(games) {
        gamesContainer.innerHTML = games.map(game => `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="${game.cover || ''}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${game.title}</h5>
                        <p><strong>Plataformas:</strong> 
                          <span data-type="platforms" data-value="${Array.isArray(game.platform) ? game.platform.join(",") : game.platform || ''}">
                            ${Array.isArray(game.platform) ? game.platform.join(", ") : game.platform || "-"}
                          </span>
                        </p>
                        <p><strong>Géneros:</strong> 
                          <span data-type="genres" data-value="${Array.isArray(game.genre) ? game.genre.join(",") : game.genre || ''}">
                            ${Array.isArray(game.genre) ? game.genre.join(", ") : game.genre || "-"}
                          </span>
                        </p>
                        <p><strong>Fecha de lanzamiento:</strong> 
                          <span data-type="releaseDate" data-value="${game.releaseDate || ''}">${game.releaseDate || "-"}</span>
                        </p>
                        <button class="btn btn-success btn-add-user-game mb-2" data-id="${game._id}">Añadir juego</button>
                        ${isAdmin ? `
                        <button class="btn btn-warning btn-edit" data-id="${game._id}">Editar</button>
                        <button class="btn btn-danger btn-delete" data-id="${game._id}">Borrar</button>
                        ` : ""}
                    </div>
                </div>
            </div>
        `).join("");
    }

    // ─── AÑADIR JUEGO GLOBAL ─────────────────────────
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const cover = document.getElementById("cover").value;
        const description = document.getElementById("description").value;
        const releaseDate = document.getElementById("releaseDate").value;

        const platforms = Array.from(
            document.querySelectorAll('input[name="platforms"]:checked')
        ).map(cb => cb.value);

        const genres = Array.from(
            document.querySelectorAll('input[name="genres"]:checked')
        ).map(cb => cb.value);

        try {
            const res = await fetch(`${NODE_API}/games`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    platform: platforms,
                    genre: genres,
                    description,
                    cover,
                    releaseDate
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error al crear juego");
                return;
            }

            alert("Juego creado correctamente ✅");
            addForm.reset();
            loadGames();

        } catch (err) {
            console.error(err);
            alert("Error al crear el juego");
        }
    });

    // ─── EVENT DELEGATION PARA TARJETA, BOTONES ───
    gamesContainer.addEventListener("click", async e => {
        const target = e.target;

        // ─ Ignorar clicks en botones (cada botón tiene su función)
        if (target.tagName === "BUTTON") return;

        // ─ Click en la tarjeta para ir a gameDetail
        const card = target.closest(".card");
        if (card) {
            const gameId = card.querySelector(".btn-add-user-game")?.dataset.id;
            if (gameId) window.location.href = `gameDetail.html?id=${gameId}`;
        }
    });

    // ─── BOTONES (delegados) ───────────────────────
    gamesContainer.addEventListener("click", async e => {
        const target = e.target;
        const gameId = target.dataset.id;
        if (!gameId) return;

        // AÑADIR JUEGO AL USUARIO
        if (target.classList.contains("btn-add-user-game")) {
            document.getElementById("add-user-game-id").value = gameId;
            document.getElementById("user-hours").value = "";
            document.getElementById("user-rating").value = "";

            const modal = new bootstrap.Modal(
                document.getElementById("addUserGameModal")
            );
            modal.show();
        }

        // SOLO ADMIN: BORRAR
        if (isAdmin && target.classList.contains("btn-delete")) {
            if (!confirm("¿Seguro que quieres borrar este juego?")) return;
            try {
                await fetch(`${NODE_API}/games/${gameId}`, { method: "DELETE" });
                loadGames();
            } catch (err) {
                console.error("Error borrando juego:", err);
            }
        }

        // SOLO ADMIN: EDITAR
        if (isAdmin && target.classList.contains("btn-edit")) {
            const cardBody = target.closest(".card-body");
            const cardParent = cardBody.closest(".card");

            const currentTitle = cardBody.querySelector(".card-title")?.innerText || "";
            const currentPlatforms = (cardBody.querySelector('span[data-type="platforms"]')?.dataset.value || "").split(",").filter(p => p);
            const currentGenres = (cardBody.querySelector('span[data-type="genres"]')?.dataset.value || "").split(",").filter(g => g);
            const currentReleaseDate = cardBody.querySelector('span[data-type="releaseDate"]')?.dataset.value || "";
            const currentCover = cardParent.querySelector("img")?.src || "";

            document.getElementById("edit-game-id").value = gameId;
            document.getElementById("edit-title").value = currentTitle;
            document.getElementById("edit-releaseDate").value = currentReleaseDate;
            document.getElementById("edit-cover").value = currentCover;

            document.querySelectorAll('input[name="edit-platforms"]').forEach(cb => cb.checked = currentPlatforms.includes(cb.value));
            document.querySelectorAll('input[name="edit-genres"]').forEach(cb => cb.checked = currentGenres.includes(cb.value));

            const modal = new bootstrap.Modal(document.getElementById('editGameModal'));
            modal.show();
        }
    });

    // ─── AÑADIR JUEGO A USUARIO DESDE MODAL ─────
    document.getElementById("confirm-add-user-game")
    .addEventListener("click", async () => {
        const gameId = document.getElementById("add-user-game-id").value;
        const hoursPlayed = document.getElementById("user-hours").value;
        const rating = document.getElementById("user-rating").value;

        try {
            const res = await fetch(`${NODE_API}/user-games`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ gameId, hoursPlayed, rating })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Error al añadir juego");
                return;
            }

            const modalEl = document.getElementById("addUserGameModal");
            bootstrap.Modal.getInstance(modalEl).hide();
            alert("Juego añadido a tu lista ✅");

        } catch (err) {
            console.error(err);
            alert("Error al añadir juego");
        }
    });

    // ─── GUARDAR CAMBIOS DEL MODAL ─────────────────
    document.getElementById("save-edit-btn").addEventListener("click", async () => {
        const gameId = document.getElementById("edit-game-id").value;
        const updatedGame = {
            title: document.getElementById("edit-title").value,
            platform: Array.from(document.querySelectorAll('input[name="edit-platforms"]:checked')).map(cb => cb.value),
            genre: Array.from(document.querySelectorAll('input[name="edit-genres"]:checked')).map(cb => cb.value),
            releaseDate: document.getElementById("edit-releaseDate").value,
            cover: document.getElementById("edit-cover").value
        };

        try {
            await fetch(`${NODE_API}/games/${gameId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedGame)
            });
            loadGames();
            const modalEl = document.getElementById('editGameModal');
            bootstrap.Modal.getInstance(modalEl).hide();
        } catch (err) {
            console.error("Error editando juego:", err);
        }
    });

    // ─── FILTRAR JUEGOS ─────────────────────────────
    function filterGames() {
        const search = searchInput.value.toLowerCase();
        const genre = filterGenre.value;
        const platform = filterPlatform.value;

        const filtered = allGames.filter(game => {
            const matchesTitle = game.title.toLowerCase().includes(search);
            const matchesGenre = genre ? (Array.isArray(game.genre) ? game.genre.includes(genre) : game.genre === genre) : true;
            const matchesPlatform = platform ? (Array.isArray(game.platform) ? game.platform.includes(platform) : game.platform === platform) : true;
            return matchesTitle && matchesGenre && matchesPlatform;
        });

        displayGames(filtered);
    }

    searchInput.addEventListener("input", filterGames);
    filterGenre.addEventListener("change", filterGames);
    filterPlatform.addEventListener("change", filterGames);

    // ─── LOGOUT ─────────────────────────────
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    document.getElementById("user-btn").addEventListener("click", () => {
        window.location.href = "userProfile.html";
    });

    loadGames();
});
