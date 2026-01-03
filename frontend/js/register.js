const API_BASE = "http://localhost:5000/api/node"; // tu gateway

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        // Timeout de 10 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        alert("Usuario registrado correctamente. ID: " + data.userId);
        window.location.href = "login.html";

    } catch (err) {
        if (err.name === "AbortError") {
            alert("La petición tardó demasiado y fue cancelada (timeout).");
        } else {
            alert("Error al registrar usuario: " + err.message);
            console.error(err);
        }
    }
});
