from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from .proveedores_schema import ProveedorOut
from .tUnidad_schema import TUnidadOut

class ProductoSchema(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    imagen: Optional[str] = None

class ProductCreate(ProductoSchema):
    tUnidad: Optional[int] = None  

class ProductOut(ProductoSchema):
    id: int
    fechaIngreso: Optional[datetime] = None
    tipo_unidad: Optional[TUnidadOut] = None  
    proveedores: List[ProveedorOut] = []

    class Config:
        from_attributes = True
