[![Build Status](https://img.shields.io/github/actions/workflow/status/Abhishek-Handibag/Secure-share-hub/ci.yml?style=flat&logo=github)](https://github.com/Abhishek-Handibag/Secure-share-hub/actions) ![Docker Image](https://img.shields.io/docker/build/abhishekhandibag/secure-share-hub?style=flat&logo=docker) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)


## 🔒 Secure Share Hub

Secure Share Hub is a modern, secure file‑sharing application designed to provide **end‑to‑end encryption**, **password‑protected access**, and **flexible sharing controls**. Built with a React front end and a Django REST back end, the entire stack is containerized with Docker for seamless deployment.

---

## 📚 Table of Contents

1. [🛡️ Features](#-features)
2. [🏗️ Architecture](#-architecture)
3. [⚙️ Installation](#-installation)
4. [🔧 Configuration](#-configuration)
5. [🚀 Usage](#-usage)
6. [📑 API Reference](#-api-reference)
7. [🔐 Security & Encryption Details](#-security--encryption-details)
8. [☁️ Deployment](#-deployment)
9. [🤝 Contributing](#-contributing)
10. [📄 License](#-license)

---

## 🛡️ Features

- 📧 **User Registration & OTP Login**: Users register with email/password and verify via one‑time passcode (OTP) sent by email.
- 🔑 **JWT Authentication**: Secure JWT tokens stored in HTTP‑only cookies for session management.
- 🔄 **Password Reset Flow**: Secure email‑based password reset using expiring tokens.
- 🔐 **End‑to‑End Encryption**: Files are encrypted client‑side with a unique symmetric key (AES‑128 via Fernet) before upload.
- 🔒 **Key Wrapping**: File keys are wrapped with a PBKDF2‑derived key from the user’s password and stored encrypted.
- 🌐 **Granular Sharing**:
  - 👥 Share with specific users by email with view/download permissions.
  - 🔗 Generate time‑limited, public share links (UUID) with optional password protection.
  - ✂️ Revoke or expire shares manually.
- 📂 **File Management**:
  - 📑 List owned and incoming shared files with metadata and active permissions.
  - 🗑️ Delete files and associated shares.
- 🐳 **Containerized Deployment**: Docker Compose setup for frontend, backend, and Nginx reverse proxy.

---

## 🏗️ Architecture

### ⚛️ Front End

- React 18 with Redux Toolkit for state management 🗂️
- Material‑UI for responsive UI themes (light/dark) 🎨
- React Router for navigation between views 🔀
- Axios wrapper (`services/api.js`) with credentials for secure API calls 🌐

### 🖥️ Back End

- Django 5 & Django REST Framework provide RESTful endpoints 🍰
- Simple JWT for token issuance and custom cookie authentication 🛡️
- SQLite by default (switchable to PostgreSQL via environment) 🐘
- Cryptography library for all encryption tasks 🔏
- **Models**:
  - **User** (extended Django user) 👤
  - **File**: tracks owner, filename, encrypted blob path, wrapped key, metadata 📦
  - **FileShare**: per‑user share permissions and timestamps ⏱️
  - **FileShareLink**: UUID share links with expiration ⌛
  - **OTP**: stores one‑time passcodes for login/reset flows 🔑

---

## ⚙️ Installation

<details>
<summary>Click to expand</summary>

1. **Clone the repo**:
   ```bash
   git clone https://github.com/Abhishek-Handibag/Secure-share-hub.git
   cd Secure-share-hub
   ```
2. **Copy environment examples**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. **Start with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
4. **Access**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api`

</details>

---

## 🔧 Configuration

### 🔑 backend/.env

```dotenv
SECRET_KEY=your_django_secret
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_email_password
EMAIL_USE_TLS=True
JWT_SECRET_KEY=your_jwt_secret
```

### 🌐 frontend/.env

```dotenv
REACT_APP_API_URL=http://localhost:8000/api
``` 

---

## 🚀 Usage

1. 📝 **Register**: `/register` → sign up with email and password.
2. 🔍 **Verify OTP**: Enter the OTP sent to your email.
3. ☁️ **Upload File**: Click “Upload”; file is encrypted client‑side.
4. 🔗 **Manage Shares**: Use “Share” to invite users or create links.
5. 📥 **Download File**: Recipients download based on permissions.
6. 🛑 **Revoke Access**: Remove shares or expire links from file details.

---

## 📑 API Reference

All endpoints are prefixed with `/api/`.

### 🔐 Authentication

| Method | Endpoint                     | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| POST   | `/auth/register/`            | Register new user                   |
| POST   | `/auth/login/`               | Request OTP for login               |
| POST   | `/auth/verify-otp/`          | Verify OTP and obtain JWT cookie    |
| POST   | `/auth/password-reset/`      | Request password‑reset OTP          |
| POST   | `/auth/password-reset-confirm/` | Confirm reset and set new password |

### 📂 Files

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| GET    | `/files/`        | List own files           |
| POST   | `/files/`        | Upload encrypted file    |
| GET    | `/files/{id}/`   | Retrieve file metadata   |
| DELETE | `/files/{id}/`   | Delete file              |

### 🌐 Sharing

| Method | Endpoint                   | Description                           |
| ------ | -------------------------- | ------------------------------------- |
| POST   | `/files/{id}/share/`       | Share with user: `{email, permission}`|
| POST   | `/files/{id}/links/`       | Create share link: `{expires_in_hours, password_optional}`|
| GET    | `/shares/incoming/`        | List files shared with you            |
| DELETE | `/shares/{share_id}/`      | Revoke a user share                   |
| DELETE | `/links/{link_id}/`        | Expire a share link                   |

---

## 🔐 Security & Encryption Details

1. 🔏 **Fernet Encryption**: AES‑128 in CBC mode with HMAC for integrity.
2. 🔑 **Key Generation**: Fresh symmetric key per upload (`Fernet.generate_key()`).
3. 🔒 **Key Wrapping**: File key encrypted with PBKDF2HMAC‑derived key.
4. 🖥️ **Client‑Side Crypto**: Browser encrypts before sending; server sees only ciphertext.

---

## ☁️ Deployment

1. 🚧 **Production Mode**: Set `DEBUG=False` in backend `.env`.
2. 🛡️ **Nginx Proxy**: Mount SSL certs in `docker-compose.yml`.
3. 🗃️ **Persistent Storage**: Use managed volumes for encrypted files.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. 🔀 Fork the repo.
2. 📂 Create branch: `feature/YourFeature`.
3. 📝 Commit & push changes.
4. 📬 Open a pull request.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

