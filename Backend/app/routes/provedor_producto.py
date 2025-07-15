from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.productos import Producto
from ..models.proveedores import Proveedor
from ..schemas.proveedores_schema import ProveedorCreate, ProveedorOut
from ..schemas.producto_schema import ProductOut, ProductCreate, ProductoSchema
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/productos/", response_model=list[ProductOut])
def read_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).all()
    return productos

@router.post("/productos/", response_model=ProductOut)
def create_producto(producto: ProductoSchema, db: Session = Depends(get_db)):
    db_producto = Producto(**producto.dict())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

@router.get("/proveedores/", response_model=list[ProveedorOut])
def read_proveedores(db: Session = Depends(get_db)):
    proveedores = db.query(Proveedor).all()
    return proveedores

@router.post("/proveedores/", response_model=ProveedorOut)
def create_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db)):
    db_proveedor = Proveedor(**proveedor.dict())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor