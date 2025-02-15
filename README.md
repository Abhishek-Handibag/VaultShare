# 🔐 Secure File Sharing Application

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> A modern, secure file sharing platform with end-to-end encryption built using React and Django.

## ✨ Key Features

- 🔑 Robust user authentication & authorization
- 🔒 End-to-end encrypted file transfers
- 🗝️ Password-protected file uploads
- 👁️ Built-in file preview for images & PDFs
- 🔗 Customizable sharing permissions
- ⏳ Time-limited share links
- 🌓 Sleek dark/light theme
- 🐳 Docker-ready deployment

## 🛠️ Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

- ⚛️ React 18
- 🎨 Material-UI
- 📦 Redux Toolkit
- 🛣️ React Router
- 🚀 Nginx (Production)
</details>

<details>
<summary><strong>Backend</strong></summary>

- 🐍 Django 5
- 🌐 Django REST Framework
- 🎫 JWT Authentication
- 💾 SQLite/PostgreSQL
- ⚡ Python 3.11
</details>

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- Python >= 3.11
- npm or yarn
- pip

### 🐳 Docker Setup
1. Make sure you have Docker and Docker Compose installed
2. Clone the repository
3. Run the following commands:

### Local Development Setup

# Installation Guide

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
# Windows
python -m venv venv

# Linux/MacOS
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/MacOS
source venv/bin/activate
```

4. Install the required Python packages:
```bash
pip install -r requirements.txt
```

5. Set up the database:
```bash
python manage.py migrate
```

6. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

7. Start the Django development server:
```bash
python manage.py runserver
```

The backend server will start running at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory with the following content:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm start
```

The frontend application will start running at `http://localhost:3000`
