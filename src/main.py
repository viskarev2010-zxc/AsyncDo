import os
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.config import settings
from src.routers import tasks_router, users_router
from src.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="AsyncDo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Сначала СТРОГО подключаем монтирование папки статики.
# Это нужно, чтобы запросы вида /frontend/css/... обрабатывались как файлы, а не как текст.
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# 2. Подключаем роутеры вашего бэкенд API
app.include_router(tasks_router)
app.include_router(users_router)


# 3. СТРОГО В САМОМ КОНЦЕ ФАЙЛА создаем универсальный роутер для Single Page Application.
# Выражение {catchall:path} означает: "перехватить абсолютно любой путь любой вложенности"
@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    # Защита: если фронтенд пытается запросить несуществующий адрес API бэкенда,
    # отдаем стандартный 404, а не ломаем логику
    if catchall.startswith("api/"):
        return {"detail": "Not Found"}

    # На любые другие адреса (/, /auth, /users/sanya) принудительно возвращаем index.html
    html_path = "frontend/html/index.html"
    if os.path.exists(html_path):
        return FileResponse(html_path)

    return {"detail": f"Файл {html_path} не найден на сервере. Проверьте структуру папок!"}


if __name__ == "__main__":
    uvicorn.run("src.main:app", host=settings.HOST, port=settings.PORT, reload=True)