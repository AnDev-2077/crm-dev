from pydantic import BaseModel
from typing import Optional

class ProveedorSchema(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None

class ProveedorCreate(ProveedorSchema):
    pass

class ProveedorOut(ProveedorSchema):
    id: int

    class Config:
        from_attributes = True