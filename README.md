## Secure Share Hub

Secure Share Hub is a modern, secure file‑sharing application designed to provide end‑to‑end encryption, password‑protected access, and flexible sharing controls. Built with a React front end and a Django REST back end, the entire stack is containerized with Docker for easy deployment.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Security & Encryption Details](#security--encryption-details)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

---

## Features

- **User Registration & OTP Login**: Users register with email/password and verify via one‑time passcode (OTP) sent by email.
- **JWT Authentication**: Secure JWT tokens stored in HTTP‑only cookies for session management.
- **Password Reset Flow**: Secure email‑based password reset using expiring tokens.
- **End‑to‑End Encryption**: Files are encrypted client‑side with a unique symmetric key (AES‑128 via Fernet) before upload.
- **Key Wrapping**: File keys are wrapped with a PBKDF2‑derived key from the user’s password and stored encrypted.
- **Granular Sharing**:
  - Share with specific users by email with view/download permissions.
  - Generate time‑limited, public share links (UUID) with optional password protection.
  - Revoke or expire shares manually.
- **File Management**:
  - List owned and incoming shared files with metadata and active permissions.
  - Delete files and associated shares.
- **Containerized Deployment**: Docker Compose setup for frontend, backend, and Nginx reverse proxy.

---

## Architecture

### Front End

- **React 18** with **Redux Toolkit** for state management.
- **Material‑UI** for responsive UI themes (light/dark).
- **React Router** for navigation between views.
- **Axios** wrapper (`services/api.js`) with credentials for secure API calls.

### Back End

- **Django 5** & **Django REST Framework** provide RESTful endpoints.
- **Simple JWT** for token issuance and custom cookie authentication.
- **SQLite** by default (switchable to PostgreSQL via environment).
- **Cryptography** library for all encryption related tasks.
- Models:
  - `User` (extended Django user)
  - `File`: tracks owner, filename, encrypted blob path, wrapped key, metadata.
  - `FileShare`: per‑user share permissions and timestamps.
  - `FileShareLink`: UUID share links with expiration.
  - `OTP`: stores one‑time passcodes for login/reset flows.

---

## Installation

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

---

## Configuration

Edit the following `.env` files:

- **backend/.env**:
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

- **frontend/.env**:
  ```dotenv
  REACT_APP_API_URL=http://localhost:8000/api
  ```

---

## Usage

1. **Register**: Navigate to `/register` and sign up with email and password.
2. **Verify OTP**: Enter the OTP sent to your email to verify and log in.
3. **Upload File**: Click “Upload” and select a file; it will be encrypted client‑side before sending.
4. **Manage Shares**: On file list, use “Share” to invite other users or generate a public link.
5. **Download File**: Recipients can download only if they have permission and the share is valid.
6. **Revoke Access**: Remove user shares or expire links from the file detail view.

---

## API Reference

All endpoints are prefixed with `/api/`.

### Authentication

- `POST /auth/register/` – Register new user.
- `POST /auth/verify-otp/` – Verify OTP and obtain JWT cookie.
- `POST /auth/login/` – Request OTP for login.
- `POST /auth/password-reset/` – Request password‑reset OTP.
- `POST /auth/password-reset-confirm/` – Confirm reset with OTP and set new password.

### Files

- `GET /files/` – List own files.
- `POST /files/` – Upload encrypted file.
- `GET /files/{id}/` – Retrieve file metadata.
- `DELETE /files/{id}/` – Delete file.

### Sharing

- `POST /files/{id}/share/` – Share with user: `{ email, permission }`.
- `POST /files/{id}/links/` – Create share link: `{ expires_in_hours, password_optional }`.
- `GET /shares/incoming/` – Files shared with you.
- `DELETE /shares/{share_id}/` – Revoke a user share.
- `DELETE /links/{link_id}/` – Expire a share link.

---

## Security & Encryption Details

1. **Fernet Encryption**: Uses AES‑128 in CBC mode with HMAC for integrity.
2. **Key Generation**: Each upload generates a fresh symmetric key via `Fernet.generate_key()`.
3. **Key Wrapping**: File key encrypted with PBKDF2HMAC‑derived key from user’s password.
4. **Client‑Side Crypto**: Browser encrypts file before sending; server never sees plaintext.
5. **HTTPS Only**: Ensure SSL termination at reverse proxy (Nginx) for all traffic.

---

## Deployment

1. **Production Mode**: Set `DEBUG=False` in backend `.env`.
2. **Nginx Proxy**: Adjust `docker-compose.yml` to mount your SSL certs.
3. **Persistent Storage**: Replace volume mounts with managed volumes for encrypted files.
4. **Scaling**: Swap SQLite for PostgreSQL and add Redis for caching JWT blacklists.

---

## Contributing

Contributions are welcome! Please fork, create a feature branch, and submit a pull request.

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Commit your changes and push.
4. Open a pull request describing your changes.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

