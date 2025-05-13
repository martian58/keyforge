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
    currentContact = { userId, username };
    document.getElementById("chatWith").innerText = username;

    // Clear previous interval if exists
    if (refreshInterval) clearInterval(refreshInterval);

    // Fetch messages immediately and then every second
    loadMessages();
    refreshInterval = setInterval(loadMessages, 1000);

    // Fetch and display messages
    function loadMessages() {
        fetch(`/get_messages/${userId}`)
            .then(res => res.json())
            .then(messages => {
                const chatBox = document.getElementById("chatBox");
                chatBox.innerHTML = "";

                const myKey = contactCaesarKeys[userId];

                messages.forEach(msg => {
                    const isSender = msg.sender_id === currentContact.userId;
                    const senderName = isSender ? username : "You";
                    const decryptedText = caesarDecrypt(msg.encrypted_message, myKey);

                    // Format timestamp
                    const time = new Date(msg.timestamp);
                    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    // Create message element
                    const messageDiv = document.createElement("div");
                    messageDiv.className = isSender ? "text-left mb-2" : "text-right mb-2";

                    const bubble = document.createElement("div");
                    bubble.className = isSender
                        ? "inline-block bg-gray-700 text-white px-4 py-2 rounded-lg max-w-xs"
                        : "inline-block bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs";

                    bubble.innerHTML = `
                        <div class="text-lg">${decryptedText}</div>
                        <div class="text-sm text-gray-300 mt-1">${senderName} • ${formattedTime}</div>
                    `;

                    messageDiv.appendChild(bubble);
                    chatBox.appendChild(messageDiv);
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


document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');

    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); 
            sendMessage(); // Send the message
        }
    });
});