document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const alertBox = document.getElementById("alert");

    function showAlert(message, type = "error") {
        alertBox.classList.remove("hidden");
        alertBox.className = `p-3 mb-4 rounded text-sm ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
        alertBox.textContent = message;
    }

    loginBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            return showAlert("All fields are required", "error");
        }

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                return showAlert(result.error || "Login failed", "error");
            }

            showAlert(result.message || "Login successful", "success");

            // Redirect after login
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (err) {
            console.error("Login error:", err);
            showAlert("Something went wrong.", "error");
        }
    });
});
