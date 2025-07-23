from pydantic import BaseModel
from typing import List

class DetalleCompraCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class CompraCreate(BaseModel):
    proveedor_id: int
    productos: List[DetalleCompraCreate]
