from typing import List
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .proveedores_schema import ProveedorOut

class ProductoSchema(BaseModel):

    nombre: str
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    tUnidad: Optional[str] = None 
    fechaIngreso: Optional[datetime] = None   #idk
    imagen: Optional[str] = None 
    
class ProductCreate(ProductoSchema):
    pass

class ProductOut(ProductoSchema):
    id: int
    proveedores: List[ProveedorOut] = []
    class Config:
        from_attributes = True