document.addEventListener("DOMContentLoaded", () => {
    const keysList = document.getElementById("keysList");

    // Fetch the encrypted keys from the backend
    fetch("/mykeys", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        const keys = data.keys;

        if (!keys || keys.length === 0) {
            keysList.innerHTML = `<p class="text-gray-400">You don't have any Caesar keys yet.</p>`;
            return;
        }

        keys.forEach(({ username, encrypted_key }) => {
            // Unlocks the Caesar cipher key with our custom RSA decryption
            const decryptedKey = decryptRSA(encrypted_key);

            const item = document.createElement("div");
            item.className = "p-4 bg-gray-800 rounded";
            item.innerHTML = `
                <h2 class="text-xl font-semibold mb-2">🔗 Key with <span class="text-blue-300">${username}</span></h2>
                <p><strong>Decrypted Caesar Key:</strong> <span class="text-green-400">${decryptedKey}</span></p>
            `;
            keysList.appendChild(item);
        });
    })
    .catch(error => {
        console.error("Failed to fetch keys:", error);
        keysList.innerHTML = `<p class="text-red-500">Failed to load your Caesar keys.</p>`;
    });
});

// Decrypts the Caesar cipher key using our custom RSA implementation
function decryptRSA(encryptedKey) {
    const privateKey = JSON.parse(localStorage.getItem("private_key"));

    if (!privateKey) {
        console.error("Private key is missing!");
        return "Error: Missing private key";
    }

    // Convert the private key components from strings to BigInt
    const d = BigInt(privateKey.d);
    const n = BigInt(privateKey.n);

    // Decrypt the encrypted key 
    const cipherArray = encryptedKey.split(",").map(num => BigInt(num));
    const decryptedKey = cipherArray.map(c => modPow(c, d, n)).map(c => String.fromCharCode(Number(c)));

    // join the decrypted characters and return the Caesar key
    return decryptedKey.join('');
}


function modPow(base, exp, mod) {
    base %= mod;
    let result = 1n;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % mod;
        base = (base * base) % mod;
        exp >>= 1n;
    }
    return result;
}
