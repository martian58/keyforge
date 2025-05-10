document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("password_confirm");
    const registerBtn = document.getElementById("registerBtn");
    const alertBox = document.getElementById("alert");

    function showAlert(message, type = "error") {
        alertBox.classList.remove("hidden");
        alertBox.className = `p-3 mb-4 rounded text-sm ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`;
        alertBox.textContent = message;
    }

    registerBtn.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const passwordConfirm = confirmInput.value;

        if (!username || !email || !password || !passwordConfirm) {
            return showAlert("All fields are required.", "error");
        }

        const payload = {
            username,
            email,
            password,
            password_confirm: passwordConfirm
        };

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                return showAlert(result.error || "Registration failed.", "error");
            }

            showAlert(result.message || "Registration successful!", "success");
            usernameInput.value = "";
            emailInput.value = "";
            passwordInput.value = "";
            confirmInput.value = "";
            window.location.href = "/login";
        } catch (error) {
            console.error("Request failed", error);
            showAlert("Something went wrong.", "error");
        }
    });
});
