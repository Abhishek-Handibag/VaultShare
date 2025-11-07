

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0+-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-67.4%25-F7DF1E?logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

**A Modern, Secure File-Sharing Application with End-to-End Encryption**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Docs](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

VaultShare is a modern, secure file-sharing application designed to provide **end-to-end encryption**, **password-protected access**, and **flexible sharing controls**. Built with a React frontend and Django backend, VaultShare ensures your files remain private and secure through client-side encryption before they ever reach the server.

### ✨ Why VaultShare?

- 🔐 **True End-to-End Encryption**: Files are encrypted on your device before upload
- 🎯 **Zero-Knowledge Architecture**: Server never sees unencrypted data
- 🔑 **Granular Access Control**: Share with specific users or generate time-limited links
- 🛡️ **Enterprise-Grade Security**: AES-128 encryption with PBKDF2 key derivation
- 🎨 **Modern UI**: Responsive Material-UI design with light/dark themes
- 🐳 **Easy Deployment**: Fully containerized with Docker Compose

---

## 📚 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture](#-architecture)
4. [Prerequisites](#-prerequisites)
5. [Installation](#-installation)
6. [Configuration](#-configuration)
7. [Usage](#-usage)
8. [API Reference](#-api-reference)
9. [Security & Encryption](#-security--encryption-details)
10. [Deployment](#-deployment)
11. [Contributing](#-contributing)
12. [License](#-license)
13. [Contact](#-contact)

---

## 🛡️ Features

### 🔐 Security Features
- **End-to-End Encryption**: Files encrypted client-side with AES-128 (Fernet)
- **Key Wrapping**: Encrypted file keys using PBKDF2-derived keys
- **JWT Authentication**: Secure token-based auth with HTTP-only cookies
- **OTP Verification**: Email-based one-time passcode for login/registration
- **Password Reset Flow**: Secure email-based password recovery

### 🤝 Sharing & Collaboration
- **User-Specific Sharing**: Share files with specific users via email
- **Permission Control**: Granular view/download permissions
- **Public Share Links**: Generate time-limited, UUID-based share links
- **Optional Password Protection**: Add extra security layer to share links
- **Revocable Access**: Expire shares manually anytime

### 📂 File Management
- **Secure Upload**: Client-side encryption before transmission
- **File Listing**: View owned and incoming shared files
- **Metadata Tracking**: File size, type, timestamps, and permissions
- **Easy Deletion**: Remove files and associated shares

### 🎨 User Experience
- **Modern UI**: Material-UI components with responsive design
- **Dark/Light Themes**: User preference support
- **Intuitive Navigation**: React Router-based SPA
- **Real-time Updates**: Redux state management

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Crypto-JS** - Client-side encryption

### Backend
- **Django 5** - Web framework
- **Django REST Framework** - RESTful API
- **Simple JWT** - JWT authentication
- **SQLite/PostgreSQL** - Database
- **Cryptography** - Encryption library
- **SMTP** - Email delivery

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy
- **Git** - Version control

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ HTTPS   │    Nginx     │  HTTP   │   Backend   │
│  (React)    │────────▶│ Reverse Proxy│────────▶│  (Django)   │
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                   │
      │ Client-Side                                       │
      │ Encryption                                        │
      │ (AES-128)                                         │
      └───────────────────────────────────────────────────┘
                     Encrypted Files Storage
```

### Frontend Architecture
- **React 18** with functional components and hooks
- **Redux Toolkit** for centralized state management
- **Material-UI** for consistent, responsive design
- **Axios** wrapper with credential handling
- **Client-side encryption** before API calls

### Backend Architecture
- **Django 5** with REST Framework for RESTful endpoints
- **Custom JWT cookie authentication** for security
- **Cryptography library** for server-side key management
- **SQLite** default (production-ready PostgreSQL support)

#### Data Models
- **User**: Extended Django user model
- **File**: Stores metadata, encrypted blob path, wrapped keys
- **FileShare**: Per-user permissions and timestamps
- **FileShareLink**: UUID-based public links with expiration
- **OTP**: One-time passcodes for authentication flows

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0 or higher)
- **Python** (v3.9 or higher)
- **Docker** & **Docker Compose** (for containerized deployment)
- **Git** (for cloning the repository)
- **SMTP Server** (for email functionality) - Gmail, SendGrid, or similar

---

## ⚙️ Installation

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abhishek-Handibag/VaultShare.git
   cd VaultShare
   ```

2. **Configure environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your settings
   ```

3. **Start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api`

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with API URL

# Start development server
npm start
```

---

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```dotenv
# Django Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite default)
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: postgresql://user:password@localhost:5432/vaultshare

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_specific_password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@vaultshare.com

# JWT Settings
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_EXPIRATION_HOURS=24

# File Upload Settings
MAX_UPLOAD_SIZE=104857600  # 100MB in bytes
```

### Frontend Environment Variables (`frontend/.env`)

```dotenv
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MAX_FILE_SIZE=104857600
```

---

## 🚀 Usage

### 1. **User Registration**
- Navigate to `/register`
- Provide email and password
- Verify OTP sent to your email

### 2. **Login**
- Go to `/login`
- Enter credentials
- Verify OTP from email

### 3. **Upload Files**
- Click "Upload File" button
- Select file (encrypted automatically on client-side)
- File is securely stored with encryption

### 4. **Share Files**

**Option A: Share with Specific Users**
- Select file → Click "Share"
- Enter recipient email
- Set permissions (view/download)
- Recipient receives notification

**Option B: Create Share Link**
- Select file → Click "Create Link"
- Set expiration time
- Optional: Add password protection
- Copy and share link

### 5. **Download Files**
- Access shared files from "Shared with Me"
- File is decrypted client-side after download

### 6. **Revoke Access**
- Go to file details
- Remove user shares or expire links
- Access is immediately revoked

---

## 📑 API Reference

Base URL: `http://localhost:8000/api/`

### Authentication Endpoints

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/auth/register/` | Register new user | `{email, password}` |
| `POST` | `/auth/login/` | Request OTP for login | `{email, password}` |
| `POST` | `/auth/verify-otp/` | Verify OTP and get JWT | `{email, otp}` |
| `POST` | `/auth/password-reset/` | Request password reset | `{email}` |
| `POST` | `/auth/password-reset-confirm/` | Confirm new password | `{email, otp, new_password}` |
| `POST` | `/auth/logout/` | Logout and clear session | - |

### File Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/files/` | List owned files | ✅ |
| `POST` | `/files/` | Upload encrypted file | ✅ |
| `GET` | `/files/{id}/` | Get file metadata | ✅ |
| `GET` | `/files/{id}/download/` | Download encrypted file | ✅ |
| `DELETE` | `/files/{id}/` | Delete file | ✅ |

### Sharing Endpoints

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/files/{id}/share/` | Share with user | `{email, permission}` |
| `POST` | `/files/{id}/links/` | Create share link | `{expires_in_hours, password}` |
| `GET` | `/shares/incoming/` | List files shared with you | - |
| `DELETE` | `/shares/{share_id}/` | Revoke user share | - |
| `DELETE` | `/links/{link_id}/` | Expire share link | - |
| `GET` | `/links/{uuid}/` | Access public share link | - |

---

## 🔐 Security & Encryption Details

### Encryption Flow

1. **File Upload**:
   ```
   File → Generate Random Key → Encrypt with Fernet (AES-128) →
   Upload Ciphertext → Store Wrapped Key
   ```

2. **Key Wrapping**:
   ```
   User Password → PBKDF2 (100k iterations) → Derived Key →
   Encrypt File Key → Store Encrypted Key
   ```

3. **File Download**:
   ```
   Download Ciphertext → Retrieve Wrapped Key →
   Unwrap with User Password → Decrypt File → User receives plaintext
   ```

### Security Features

- **AES-128 Encryption**: Industry-standard symmetric encryption
- **Fernet**: Authenticated encryption (AES-CBC + HMAC)
- **PBKDF2**: 100,000 iterations for key derivation
- **Zero-Knowledge**: Server never accesses plaintext
- **HTTP-Only Cookies**: XSS protection for JWT tokens
- **CSRF Protection**: Django built-in CSRF middleware
- **SQL Injection Prevention**: ORM parameterized queries
- **Rate Limiting**: Prevent brute-force attacks (recommended for production)

---

## ☁️ Deployment

### Production Checklist

- [ ] Set `DEBUG=False` in backend `.env`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set up SSL/TLS certificates
- [ ] Configure Nginx with HTTPS
- [ ] Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Enable CORS for your frontend domain only
- [ ] Set up persistent volumes for encrypted files
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Use environment secrets management (AWS Secrets, Azure Key Vault, etc.)

### Docker Production Deployment

```bash
# Update docker-compose.yml for production
# Add SSL certificates
# Configure environment variables

docker-compose -f docker-compose.prod.yml up -d
```

### Platform-Specific Guides

- **AWS**: Deploy on EC2 with RDS (PostgreSQL) and S3 for file storage
- **Heroku**: Use Heroku PostgreSQL and configure buildpacks
- **DigitalOcean**: Use App Platform or Droplets with managed database
- **Azure**: App Service with Azure Database for PostgreSQL

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/VaultShare.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🗺️ Roadmap

- [ ] Multi-file upload support
- [ ] Folder organization and hierarchy
- [ ] File preview (images, PDFs)
- [ ] Activity logs and audit trails
- [ ] Two-factor authentication (2FA)
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Integration with cloud storage (S3, Google Drive)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Abhishek Handibag

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/) - High-level Python web framework
- [React](https://reactjs.org/) - JavaScript library for building UIs
- [Material-UI](https://mui.com/) - React component library
- [Cryptography](https://cryptography.io/) - Python cryptography library
- [Docker](https://www.docker.com/) - Containerization platform

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Abhishek Handibag](https://github.com/Abhishek-Handibag)

</div>
