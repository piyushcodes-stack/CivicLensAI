# CivicLensAI – AI-Powered Civic Complaint Management System

CivicLensAI is a web-based civic complaint management platform designed to help citizens report public infrastructure and civic issues while enabling administrators to manage, monitor, and track complaints.

## Features

- User registration and login
- Submit and track civic complaints
- AI-assisted complaint category classification
- Priority prediction using keyword-based rules
- Similar complaint detection using text similarity
- Admin complaint management
- Complaint analytics dashboard
- Location details for reported issues

## Technology Stack

**Frontend**
- React.js
- Vite
- CSS
- Recharts
- Lucide React

**Backend**
- Python
- Django
- Django REST Framework

**Database**
- SQLite (local development)
- PostgreSQL support through psycopg

## Project Structure

```text
CivicLensAI/
├── backend/
│   ├── accounts/
│   ├── ai_engine/
│   ├── analytics/
│   ├── complaints/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── .gitignore
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd CivicLensAI
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
```

Activate virtual environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django server:

```bash
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`.

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed by Vite.

## AI Components

- Complaint classification: keyword-based classification.
- Priority prediction: rule-based keyword analysis.
- Duplicate detection: text similarity using Python's `difflib`.

## Project Purpose

CivicLensAI aims to improve civic issue reporting, complaint tracking, and administrative monitoring through a centralized digital platform.

## Author

**Piyush Dubey**

B.Sc. Computer Science Project
