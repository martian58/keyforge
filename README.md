## 📚 Table of Contents

- [Authors](#authors)
- [Overview](#overview)
- [Features](#features)
- [How to Use](#how-to-use)
- [System Architecture](#system-architecture)
- [Endpoints](#endpoints)
- [Security Model](#security-model)
- [Code Structure & Key Files](#code-structure--key-files)
- [Future Work](#future-work)

## 🔐 Secure Chat System with Key Distribution Center (KDC)

A secure, two-way chat application built using **Flask**, **JavaScript**, **Rust**, and **Tailwind CSS**, featuring end-to-end encrypted communication. The system utilizes a **Key Distribution Center (KDC)** for secure RSA-based key exchange and session establishment. All messages between users are encrypted using a **custom Caesar cipher** initialized with securely exchanged session keys. 
---

## 👨‍💻 Authors

* Project by Fuad Alizada, Nadir Askarov, Valiyyaddin Aliyev, Rahman Aghazada
* French-Azerbaijani University


## 🧠 Overview

Our application allows registered users to:
- Generate RSA keys.
- Communicate securely using Caesar cipher.
- Share symmetric Caesar keys encrypted using RSA using KDC.
- Chat with other users in real-time.

Each message is **encrypted** on the client side using Caesar cipher with a shared symmetric key, which is securely exchanged via RSA through the KDC.

---

## 🚀 Features

- 🔑 RSA key generation and Caesar key exchange using secure KDC.
- 🔐 Caesar cipher-encrypted messages with real-time updates.
- 🧾 Full chat history with sender and receiver identification.
- 🕵️ Secure private key storage (via browser's `localStorage`).
- 🌙 Dark mode using Tailwind CSS.

---

## 📖 How to Use

1. **Register**: Go to `http://13.42.171.119:8080/register`(or your local link),  fill out the form, and sign up.

2. **Log In**: Head to `/login` with your credentials.

3. **Generate Keys**: On the Settings page (`/settings`), click "Generate RSA Key Pair" to create your keys. Your private key stays in your browser.

4. **Start Chatting**: Go to `/chat`, pick a user, and type a message. It will be encrypted with a Caesar key shared via the KDC.

5. **Check Messages**: Your chat history loads automatically, with messages decrypted on your end.

6. **Switch Themes**: In `/settings`, toggle between dark and light modes for a comfort.

If you are on a new device, restore your private key in Settings to decrypt your chats

## 🏗️ System Architecture

1. **Client-Side (Browser):**
   - Stores private RSA keys in `localStorage`.
   - Encrypts and decrypts Caesar messages.
   - Periodically fetches new messages every second via `setInterval`.
   - Uses the corresponding public key for encrypted communication with the KDC

2. **Server-Side (Flask):**
   - Perform registration, login, session management.
   - Provides secure key storage and distribution via KDC.
   - Manages message persistence in a database using SQLAlchemy.
   - Each message is associated with data such as sender, recivier and Caesar key ID

3. **Key Distribution Center (KDC):**
   - Acts as a trusted intermediary for securely distributing Caesar keys.
   - Encrypts Caesar keys with recipients' public RSA keys.
   - Generates a unique Caesar key for each communication session or message.
   - Verifies user identities before distributing keys

---

## 🧪 Testing Strategy

   **- Unit Testing**: Encryption, decryption, and key exchange functions were tested by different inputs.

   **- Manual Testing:** Users registered and sent encrypted messages to verify decryption.

   **- Security Cases:** Tested invalid keys, unauthorized access, wrong passwords;

---


## 📦 Requirements

- Python 3.8+
- `pip` for package management

## 🔧 Installation

```bash
git clone https://github.com/martian58/keyforge.git
cd keyforge
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
````
## Desktop App
```bash
cd keyforge
cd desktop
cd src-tauri
cargo tauri build
./target/release/keyforge
```
Or
```bash
cargo tauri run
```

## 🗄️ Setup Database

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```



## 🔗 Endpoints

| Endpoint               | Method   | Description                  |
| ---------------------- | -------- | ---------------------------- |
| `/register`            | GET/POST | User registration page       |
| `/login`               | GET/POST | User login                   |
| `/dashboard`           | GET      | Main dashboard after login   |
| `/mykeys`              | GET/POST | View , upload encrypted keys |
| `/send_message`        | POST     | Send encrypted message       |
| `/get_messages/<uuid>` | GET      | Retrieve message history     |
| `/logout`              | GET      | Logout current user          |

---

## 🔐 Security Model

## 🔑 Key Generation & Storage

* Users generate an **RSA key pair** on settings.
* Private keys are stored **only on the client side** in browser `localStorage`.
* Public keys are stored on the server for secure Caesar key encryption.

## 🔁 Key Exchange via KDC

* When a user wants to talk to another user, KDC generates a **random Caesar key**.
* This key is encrypted with the recipient's **RSA public key** and sent to the users (`/request_key`).
* The recipient fetches and **decrypts** this key using their RSA private key.

## 📩 Message Encryption

* Messages are encrypted and decrypted using **Caesar cipher**.
* Messages are stored in encrypted form in the database.
* Real-time updates are fetched every second with `setInterval`.

---

## 📁 Code Structure & Key Files

```bash
.
├── app.py                  # Flask app and routes
├── models.py               # SQLAlchemy models (User, Message, Key)
├── templates/
│   └── chat.html           # Main chat UI with Tailwind 
├── static/
│   ├── css/output.css      # Tailwind CSS
│   └── js/chat.js          # Main chat logic (encryption, polling)
├── migrations/             # Database migrations
├── requirements.txt
└── README.md
```

---

## 🔮 Future Work

* Use **AES** instead of Caesar for stronger encryption.
* Use **WebSockets** for real-time messaging.
* Secure key storage using IndexedDB and Web Crypto API.
* Implement **digital signatures** for message integrity.

---

> 🔐 This project demonstrates the basic principles of secure key distribution, symmetric/asymmetric encryption, and real-time communication using a custom KDC model.






