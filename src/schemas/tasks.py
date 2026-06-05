from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=27)
    owner_id: int

class TaskUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=27)