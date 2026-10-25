# Student Management System (Fullstack)

A full-stack Student Management System built with a Django REST API backend and a modern HTML/CSS/JavaScript frontend.

## Features

- Student Record Management (Create, Read, Update, Delete)
- Search and Filter Students
- MySQL Database integration with Django ORM
- Clean, responsive UI

## Project Structure

```text
student-management-fullstack/
├── backend/
│   ├── config/            # Django project settings and URLs
│   ├── students/          # Student management app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── index.html         # Main dashboard
│   ├── style.css          # Styling
│   └── app.js             # API communication and UI interactions
└── README.md
```

## Getting Started

### 1. Backend Setup (Django + MySQL)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your MySQL database in `config/settings.py` or `.env`.

5. Apply migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The backend API will run at `http://127.0.0.1:8000/`.

### 2. Frontend Setup

1. Navigate to the `frontend` directory.
2. Open `index.html` directly in your browser or run with a local server (e.g., Live Server on VS Code at port 5500).
