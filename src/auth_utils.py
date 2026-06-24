import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from src.config import settings
import hashlib
import secrets

# Инициализируем схему авторизации (FastAPI будет искать токен в заголовке Authorization)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

def generate_salt() -> str:
    return secrets.token_hex(16)

def hash_password(password: str, salt: str) -> str:
    password_bytes = (password + salt).encode('utf-8')
    return hashlib.sha256(password_bytes).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    # Используем современный и безопасный timezone-aware datetime
    expire = datetime.datetime.now(datetime.timezone.utc) + (expires_delta or datetime.timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверный токен или сессия истекла",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Расшифровываем токен
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Извлекаем ID и принудительно приводим к числу
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception

        return int(user_id_str)

    except Exception as e:
        # Если библиотека jwt упала по любой причине — не даем серверу выдать ошибку 500,
        # а безопасно возвращаем клиенту 401 Unauthorized
        print(f"Ошибка декодирования JWT: {e}")  # Выведет реальную причину в терминал бэкенда
        raise credentials_exception