from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductoSchema(BaseModel):

    nombre: str
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    tUnidad: Optional[str] = None

    
    
class ProductCreate(ProductoSchema):
    pass

class ProductOut(ProductoSchema):
    id: int
    class Config:
        from_attributes = True