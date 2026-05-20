from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base

class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(nullable=False)
    confirmed: Mapped[bool] = mapped_column(default=False)