from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
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
    productos = db.query(Producto).options(joinedload(Producto.proveedores)).all()
    return productos

@router.post("/productos/", response_model=ProductOut)
def create_producto(producto: ProductoSchema, db: Session = Depends(get_db)):

    proveedor_id = producto.proveedor_id
    producto_data = producto.dict(exclude={"proveedor_id"})


    db_producto = Producto(**producto_data)

    if proveedor_id:
        proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        db_producto.proveedores.append(proveedor)

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