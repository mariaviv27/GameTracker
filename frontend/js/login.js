const API_BASE = "http://localhost:5000/api/node"; // apuntando al gateway

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Timeout manual de 10 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Error ${res.status}: ${text}`);
        }

        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error("Respuesta inválida del servidor (no es JSON).");
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("isAdmin", data.isAdmin); // true o false
            localStorage.setItem("userId", data.userId);   // <-- añadido
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login fallido");
        }

    } catch (err) {
        if (err.name === "AbortError") {
            alert("La petición tardó demasiado y fue cancelada (timeout).");
        } else {
            alert("Error al iniciar sesión: " + err.message);
            console.error(err);
        }
    }
});
