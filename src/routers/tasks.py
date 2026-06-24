from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.schemas import TaskCreate
from src.models import TaskModel
from src.schemas.tasks import TaskUpdate
# ДОБАВЛЕН ИМПОРТ: функция-защитник токена
from src.auth_utils import get_current_user_id

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("")
async def get_tasks(
        db: AsyncSession = Depends(get_db),
        # ИЗМЕНЕНО: вместо user_id из URL, берем его из защищенного токена
        current_user_id: int = Depends(get_current_user_id)
):
    query = select(TaskModel).where(TaskModel.owner_id == current_user_id).order_by(TaskModel.id.desc())
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.post("")
async def create_task(
        task_data: TaskCreate,
        db: AsyncSession = Depends(get_db),
        # ДОБАВЛЕНО: привязываем создателя строго по его токену
        current_user_id: int = Depends(get_current_user_id)
):
    try:
        new_task = TaskModel(
            title=task_data.title,
            owner_id=current_user_id  # ИЗМЕНЕНО: теперь подделать создателя невозможно
        )
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)

        return {"status": "success", "task": {"id": new_task.id, "title": new_task.title}}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{task_id}")
async def delete_task(
        task_id: int,
        db: AsyncSession = Depends(get_db),
        # ИЗМЕНЕНО: берем текущего пользователя из токена
        current_user_id: int = Depends(get_current_user_id)
):
    try:
        task = await db.get(TaskModel, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Задача с id {task_id} не найдена"
            )

        # Сверяем владельца с ID из токена
        if task.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Вы не можете удалить чужую задачу!"
            )

        await db.delete(task)
        await db.commit()

        return {"status": "success", "message": f"Задача {task_id} успешно удалена"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{task_id}/confirm")
async def is_confirmed(
        task_id: int,
        db: AsyncSession = Depends(get_db),
        # ИЗМЕНЕНО: берем текущего пользователя из токена
        current_user_id: int = Depends(get_current_user_id)
):
    try:
        task = await db.get(TaskModel, task_id)
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Задача с id {task_id} не найдена"
            )

        # Сверяем владельца с ID из токена
        if task.owner_id != current_user_id:
            raise HTTPException(status_code=403, detail="Вы не можете изменить статус чужой задачи!")

        task.confirmed = True
        await db.commit()
        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{task_id}")
async def update_task(
        task_id: int,
        task_data: TaskUpdate,
        db: AsyncSession = Depends(get_db),
        # ИЗМЕНЕНО: берем текущего пользователя из токена
        current_user_id: int = Depends(get_current_user_id)
):
    task = await db.get(TaskModel, task_id)

    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")

    # Сверяем владельца с ID из токена
    if task.owner_id != current_user_id:
        raise HTTPException(status_code=403, detail="Нельзя редактировать чужую задачу")

    task.title = task_data.title
    await db.commit()

    return {"status": "success"}
