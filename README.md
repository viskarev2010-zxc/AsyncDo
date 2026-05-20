# AsyncDo — Async Task Manager

**AsyncDo** is a modern, high-performance task manager built with **FastAPI** and **SQLAlchemy 2.0** in pure async mode. A perfect example of modern asynchronous Python web development.

## Key Features

- **100% Async** — FastAPI + async SQLAlchemy + asyncio
- **High Performance** — non-blocking database operations
- **Clean UI** — responsive design with smooth animations
- **REST API** — full CRUD operations
- **Lightweight** — no frontend frameworks, pure vanilla JS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.0 (async) |
| Validation | Pydantic |
| Database | PostgreSQL |
| Frontend | HTML5, CSS3, Vanilla JS |

## Project Structure
- AsyncDo/
- ├── frontend/
- │ ├── index.html
- │ └── js/
- │ └── app.js
- ├── src/
- │ ├── models/
- │ │ └── tasks.py
- │ ├── routers/
- │ │ └── tasks.py
- │ ├── schemas/
- │ │ └── tasks.py
- │ ├── init.py
- │ ├── config.py
- │ ├── database.py
- │ └── main.py
- ├── .env
- ├── .env.example
- ├── .gitignore
- ├── README.md
- └── requirements.txt

## Quick Start

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/viskarev2010-zxc/AsyncDo.git
cd AsyncDo

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
```
```
Run the application
# Start the server
uvicorn src.main:app --reload

# Or using python
python -m src.main
```

### Open http://localhost:8000 in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`     | `/api/tasks`                 | Get all tasks |
| `POST`    | `/api/tasks`                 | Create a new task |
| `PATCH`   | `/api/tasks/{id}/confirm`    | Mark as completed |
| `DELETE`  | `/api/tasks/{id}`            | Delete a task |
```
# Create a new task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn FastAPI"}'

# Get all tasks
curl http://localhost:8000/api/tasks

# Mark task as completed
curl -X PATCH http://localhost:8000/api/tasks/1/confirm

# Delete a task
curl -X DELETE http://localhost:8000/api/tasks/1
```
What I Learned Building this project helped me understand:

- Async Python with async/await

- FastAPI (routers, middleware, lifespan, static files)

- SQLAlchemy 2.0 in async mode

- Frontend-backend integration with Fetch API

- CORS configuration

- Fullstack application structure

## License: 

MIT License

## Author: 

Alexander

### Perfect for learning: async Python, FastAPI, SQLAlchemy 2.0, fullstack development

