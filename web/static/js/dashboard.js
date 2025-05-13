let privateKey = null;

async function fetchUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    return data.users;
}

document.getElementById('searchUser').addEventListener('input', async function () {
    const query = this.value.toLowerCase();
    const users = await fetchUsers();

    const filtered = users.filter(u => u.username.toLowerCase().includes(query));
    const ul = document.getElementById('userResults');
    ul.innerHTML = '';

    filtered.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="p-2 bg-gray-800 rounded flex justify-between items-center">
                <span>${user.username}</span>
                <button onclick="requestKey('${user.user_id}')" class="bg-green-600 px-2 py-1 rounded">Request Key</button>
            </div>`;
        ul.appendChild(li);
    });
});



function requestKey(user2_id) {
    fetch('/request_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user2_id
         })
    })
    .then(res => res.json())
    .then(data => {
        alert("Encrypted Caesar key received and stored.");
    });
}
