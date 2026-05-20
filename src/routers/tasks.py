from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.schemas import TaskCreate
from src.models import TaskModel

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("")
async def get_tasks(db: AsyncSession = Depends(get_db)):
    query = select(TaskModel).order_by(TaskModel.id.desc())
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks

@router.post("")
async def create_task(task_data: TaskCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_task = TaskModel(title=task_data.title)
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)
        return {"status": "success", "task": {"id": new_task.id, "title": new_task.title}}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))