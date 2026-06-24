# AsyncDo — Async Task Manager

AsyncDo is a modern, high-performance task manager built with FastAPI and SQLAlchemy 2.0 in pure async mode.

---

## Key Features

### Backend
- 100% Async — FastAPI + async SQLAlchemy + asyncio
- User Authentication — registration and login with salted password hashing
- Full CRUD — create, read, update, and delete tasks
- Bulk Actions — clear all completed tasks in one click
- Task Confirmation — mark tasks as done without deleting

### Frontend
- Real-time Search — filter tasks by title with highlighted matches
- Task Filtering — all, active, or completed views
- Sorting — newest or oldest first
- Inline Editing — edit task title directly in the list
- Dark Theme — toggle with persistent setting in localStorage
- Smooth Animations — slide in/out effects on task changes
- Task Counter — live count of active, completed, and total tasks
- No Frameworks — pure vanilla HTML, CSS, and JavaScript

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.0 (async) |
| Validation | Pydantic v2 |
| Database | PostgreSQL |
| Auth | hashlib (SHA-256 + salt) |
| Frontend | HTML5, CSS3, Vanilla JS |

---

## Project Structure
- AsyncDo/
- |
- ├── frontend/
- | ├── css/
- | | └── style.css
- | ├── images/
- | | ├── userlogo.png
- | | └── userlogo-dark.png
- | ├── js/
- | | └── app.js
- | └── index.html
- |
- ├── src/
- | ├── models/
- | | ├── init.py
- | | ├── tasks.py
- | | └── users.py
- | ├── routers/
- | | ├── init.py
- | | ├── tasks.py
- | | └── users.py
- | ├── schemas/
- | | ├── init.py
- | | ├── tasks.py
- | | └── users.py
- | ├── init.py
- | ├── auth_utils.py
- | ├── config.py
- | ├── database.py
- | └── main.py
- |
- ├── .env
- ├── .env.example
- ├── .gitignore
- ├── LICENSE
- ├── README.md
- └── requirements.txt

text

---

## Quick Start

### Prerequisites

- Python 3.9 or higher
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/viskarev2010-zxc/AsyncDo.git
cd AsyncDo

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
```
### Run
```
bash
# Start the server
uvicorn src.main:app --reload

# Or using python
python -m src.main
```
#### Open http://localhost:8000 in your browser.

### API Reference
#### Tasks
- GET	/api/tasks?user_id={id}	Get all tasks for user
- POST	/api/tasks	Create a new task
- PATCH	/api/tasks/{id}?user_id={id}	Update task title
- PATCH	/api/tasks/{id}/confirm?user_id={id}	Mark task as completed
- DELETE	/api/tasks/{id}?user_id={id}	Delete a task
- DELETE	/api/tasks/completed?user_id={id}	Clear all completed tasks
#### Users
- POST	/api/users/register	Register a new user
- POST	/api/users/login	Login and get user ID
### Examples
```
bash
# Register a new user
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"login": "alex", "password": "secure123"}'

# Login
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"login": "alex", "password": "secure123"}'

# Create a new task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn FastAPI", "owner_id": 1}'

# Get all tasks
curl "http://localhost:8000/api/tasks?user_id=1"

# Edit a task
curl -X PATCH "http://localhost:8000/api/tasks/1?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn FastAPI and SQLAlchemy"}'

# Mark task as completed
curl -X PATCH "http://localhost:8000/api/tasks/1/confirm?user_id=1"

# Delete a task
curl -X DELETE "http://localhost:8000/api/tasks/1?user_id=1"

# Clear all completed tasks
curl -X DELETE "http://localhost:8000/api/tasks/completed?user_id=1"
```
### What I Learned
Building this project helped me understand:
- async/await in Python
- FastAPI — routers, middleware, lifespan, static files, CORS
- SQLAlchemy 2.0 — async engine, session, ORM with type hints
- Pydantic v2 — data validation and serialization
- Password hashing with hashlib (SHA-256 + salt)
- Vanilla JavaScript — Fetch API, DOM manipulation, event handling
- CSS — animations, transitions, dark theme, responsive design
- Fullstack application architecture
- Git and GitHub — commits, push, project structure
### License
MIT License 

### Author
Alexander — https://github.com/viskarev2010-zxc

### If you find this project useful, please consider giving it a star. ⭐