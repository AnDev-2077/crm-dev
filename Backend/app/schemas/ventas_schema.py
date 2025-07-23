from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DetalleVentaCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class VentaCreate(BaseModel):
    cliente_id: int
    detalles: List[DetalleVentaCreate]

class DetalleVenta(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    total: Optional[float] = None

    class Config:
        orm_mode = True

class VentaOut(BaseModel):
    id: int
    cliente_id: int
    fecha: datetime
    detalles: List[DetalleVenta]

    class Config:
        orm_mode = True
