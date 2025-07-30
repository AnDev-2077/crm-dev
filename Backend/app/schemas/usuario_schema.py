from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    apellidos: str
    correo: EmailStr
    rol: str
    is_active: Optional[bool] = True

class UsuarioCreate(UsuarioBase):
    contraseña: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    correo: Optional[EmailStr] = None
    rol: Optional[str] = None
    is_active: Optional[bool] = None
    contraseña: Optional[str] = None

class UsuarioOut(UsuarioBase):
    id: int
    
    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    correo: EmailStr
    contraseña: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    correo: Optional[str] = None
