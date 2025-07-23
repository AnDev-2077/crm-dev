from pydantic import BaseModel
from typing import Optional

class ClienteSchema(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    documento: Optional[str] = None
    tipoDocumento: Optional[str] = None

class ClienteCreate(ClienteSchema):
    pass

class ClienteOut(ClienteSchema):
    id: int
    
    class Config:
        from_attributes = True