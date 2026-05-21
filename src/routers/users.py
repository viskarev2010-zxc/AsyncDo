from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.schemas.users import UserAuth
from src.models.users import UserModel
from src.auth_utils import generate_salt, hash_password

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/register")
async def register_user(user_data: UserAuth, db: AsyncSession = Depends(get_db)):
    try:
        query = select(UserModel).where(UserModel.login == user_data.login)
        result = await db.execute(query)
        existing_user = result.scalars().first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким логином уже существует"
            )

        user_salt = generate_salt()

        hashed_pass = hash_password(user_data.password, user_salt)

        new_user = UserModel(
            login=user_data.login,
            hashed_password=hashed_pass,
            salt=user_salt
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return {
            "status": "success",
            "message": "Пользователь успешно зарегистрирован",
            "user_id": new_user.id
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login_user(user_data: UserAuth, db: AsyncSession = Depends(get_db)):
    query = select(UserModel).where(UserModel.login == user_data.login)
    result = await db.execute(query)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Неверный логин или пароль"
        )

    checked_hash = hash_password(user_data.password, user.salt)

    if checked_hash != user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="Неверный логин или пароль"
        )

    return {
        "status": "success",
        "message": "Вы успешно вошли в профиль",
        "user_id": user.id
    }