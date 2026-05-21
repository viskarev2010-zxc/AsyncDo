from pydantic import BaseModel, Field

class UserAuth(BaseModel):
    login: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=4)