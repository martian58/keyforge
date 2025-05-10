// gcd function
function gcd(a, b) {
    return b === 0n ? a : gcd(b, a % b);
}

// inverse function
function modInverse(a, m) {
    let [m0, x0, x1] = [m, 0n, 1n];
    while (a > 1n) {
        let q = a / m;
        [a, m] = [m, a % m];
        [x0, x1] = [x1 - q * x0, x0];
    }
    return x1 < 0n ? x1 + m0 : x1;
}

function generatePrime(bits = 512) {
    while (true) {
        const rand = BigInt('0b' + Array(bits).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join(''));
        if (isProbablyPrime(rand)) return rand;
    }
}

function isProbablyPrime(n, k = 5) {
    if (n < 2n || n % 2n === 0n) return false;
    let s = 0n, d = n - 1n;
    while (d % 2n === 0n) {
        d /= 2n;
        s++;
    }
    for (let i = 0; i < k; i++) {
        const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)));
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;
        let continueLoop = false;
        for (let r = 0n; r < s - 1n; r++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) {
                continueLoop = true;
                break;
            }
        }
        if (continueLoop) continue;
        return false;
    }
    return true;
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

// key generation
function generateRSAKeyPair() {
    const e = 65537n;
    let p, q, n, phi, d;

    do {
        p = generatePrime(256);
        q = generatePrime(256);
        n = p * q;
        phi = (p - 1n) * (q - 1n);
    } while (gcd(e, phi) !== 1n);

    d = modInverse(e, phi);

    return {
        publicKey: { e: e.toString(), n: n.toString() },
        privateKey: { d: d.toString(), n: n.toString() }
    };
}

// store keys and send public key to server
function generateAndSaveKeys() {
    const { publicKey, privateKey } = generateRSAKeyPair();

    // save private key in the localstorage
    localStorage.setItem("private_key", JSON.stringify(privateKey));

    // send public key to backeend
    fetch("/store_public_key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_key: publicKey })
    })
    .then(response => response.json())
    .then(data => {
        alert("Public key uploaded.\n\nIMPORTANT: Copy and save your private key:\n\n" + JSON.stringify(privateKey, null, 2));
    })
    .catch(err => {
        console.error("Error uploading public key:", err);
        alert("Failed to upload public key.");
    });
}


// Dark mode
function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle("dark");
    document.body.classList.toggle("bg-white");
    document.body.classList.toggle("text-black");


    localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") toggleTheme();
});

function setPrivateKey() {
    try {
        const key = JSON.parse(document.getElementById("privateKeyInput").value);
        if (!key.d || !key.n) {
            alert("Invalid private key format.");
            return;
        }
        localStorage.setItem("private_key", JSON.stringify(key));
        alert("Private key saved to local storage.");
        location.reload();
    } catch (e) {
        alert("Error parsing the private key. Please check the format.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") toggleTheme();

    const privateKey = localStorage.getItem("private_key");
    if (!privateKey) {
        document.getElementById("missingKeyMessage").classList.remove("hidden");
    }
});