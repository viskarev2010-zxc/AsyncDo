from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    login: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    salt: Mapped[str] = mapped_column(nullable=False)