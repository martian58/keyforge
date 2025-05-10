let currentContact = null;
let contactCaesarKeys = {}; 
let refreshInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    const privateKey = JSON.parse(localStorage.getItem("private_key"));
    if (!privateKey) {
        alert("Private key not found. Please import your key in settings.");
        return;
    }

    const d = BigInt(privateKey.d);
    const n = BigInt(privateKey.n);

    fetch("/mykeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        const contactsList = document.getElementById("contactsList");
        contactsList.innerHTML = "";

        data.keys.forEach(({ user_id, username, encrypted_key }) => {
            // Decrypt our caesar key
            const cipherArray = encrypted_key.split(",").map(num => BigInt(num));
            const decryptedArray = cipherArray.map(c => modPow(c, d, n));
            const caesarKey = parseInt(decryptedArray.map(c => String.fromCharCode(Number(c))).join(''));


            // Save in the memory
            contactCaesarKeys[user_id] = caesarKey;

            // Add to our contact list
            const contactBtn = document.createElement("button");
            contactBtn.className = "block w-full text-left p-2 rounded bg-gray-700 hover:bg-gray-600";
            contactBtn.innerText = `💬 ${username}`;
            contactBtn.onclick = () => openChat(user_id, username);
            contactsList.appendChild(contactBtn);
        });
    });
});

function openChat(userId, username) {
    console.log("Opening chat with:", userId, username);
    currentContact = { userId, username };
    document.getElementById("chatWith").innerText = username;

    // Clear previous interval if exists
    if (refreshInterval) clearInterval(refreshInterval);

    // Fetch messages every second
    loadMessages();

    refreshInterval = setInterval(loadMessages, 1000);

    function loadMessages() {
        fetch(`/get_messages/${userId}`)
            .then(res => res.json())
            .then(messages => {
                console.log("Fetched messages:", messages);
                const chatBox = document.getElementById("chatBox");
                chatBox.innerHTML = "";

                const myKey = contactCaesarKeys[userId];
                messages.forEach(msg => {
                    console.log(`Message from ${msg.sender_id}: ${msg.encrypted_message}`);
                    const sender = msg.sender_id === currentContact.userId ? username : "You";
                    const decryptedText = caesarDecrypt(msg.encrypted_message, myKey);

                    const div = document.createElement("div");
                    div.className = sender === "You" ? "text-right mb-2" : "text-left mb-2";
                    div.innerHTML = `<span class="inline-block px-3 py-2 rounded bg-gray-600">${sender}: ${decryptedText}</span>`;
                    chatBox.appendChild(div);
                });

                chatBox.scrollTop = chatBox.scrollHeight;
            })
            .catch(err => {
                console.error("Failed to fetch messages:", err);
            });
    }
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (!message || !currentContact) return;

    const key = contactCaesarKeys[currentContact.userId];
    const encrypted = caesarEncrypt(message, key);

    fetch("/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            receiver_id: currentContact.userId,
            encrypted_message: encrypted
        })
    }).then(() => {
        input.value = "";
        openChat(currentContact.userId, currentContact.username);
    });
}

// Ceaser cipher
function caesarEncrypt(text, key) {
    return text.split('').map(c => String.fromCharCode(c.charCodeAt(0) + key)).join('');
}
function caesarDecrypt(text, key) {
    return text.split('').map(c => String.fromCharCode(c.charCodeAt(0) - key)).join('');
}

// Compute mod
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
