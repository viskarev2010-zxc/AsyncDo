from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.schemas import TaskCreate
from src.models import TaskModel

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("")
async def get_tasks(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(TaskModel).where(TaskModel.owner_id == user_id).order_by(TaskModel.id.desc())
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.post("")
async def create_task(task_data: TaskCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_task = TaskModel(
            title=task_data.title,
            owner_id=task_data.owner_id
        )
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)

        return {"status": "success", "task": {"id": new_task.id, "title": new_task.title}}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{task_id}")
async def delete_task(task_id: int, user_id: int,
    db: AsyncSession = Depends(get_db)):
    try:
        task = await db.get(TaskModel, task_id)

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Задача с id {task_id} не найдена"
            )

        if task.owner_id != user_id:
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
async def is_confirmed(task_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    try:
        task = await db.get(TaskModel, task_id)
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Задача с id {task_id} не найдена"
            )

        if task.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Вы не можете изменить статус чужой задачи!")
        task.confirmed = True
        await db.commit()
        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

