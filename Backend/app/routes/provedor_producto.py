from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from ..database import SessionLocal
from ..models.productos import Producto
from ..models.proveedores import Proveedor
from ..schemas.proveedores_schema import ProveedorCreate, ProveedorOut
from ..schemas.producto_schema import ProductOut, ProductCreate, ProductoSchema
from datetime import datetime
from pathlib import Path
import uuid
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


BASE_DIR = Path(__file__).resolve().parent.parent.parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)


#################################PRODUCTOS#################################

@router.get("/productos/", response_model=list[ProductOut])
def read_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).options(joinedload(Producto.proveedores)).all()
    return productos

@router.get("/productos/{producto_id}", response_model=ProductOut)
def get_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = (
        db.query(Producto)
        .options(joinedload(Producto.proveedores))
        .filter(Producto.id == producto_id)
        .first()
    )
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/productos/", response_model=ProductOut)
async def create_producto(
    nombre: str = Form(...),
    descripcion: str = Form(None),
    precio: float = Form(None),
    stock: int = Form(None),
    tUnidad: str = Form(None),
    proveedor_id: int = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    producto_data = {
        "nombre": nombre,
        "descripcion": descripcion,
        "precio": precio,
        "stock": stock,
        "tUnidad": tUnidad
    }
    if imagen and imagen.filename:
        if not imagen.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

        file_extension = imagen.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = IMAGES_DIR / unique_filename

        try:
            contents = await imagen.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            producto_data["imagen"] = f"/images/{unique_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {e}")

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

@router.put("/productos/{producto_id}", response_model=ProductOut)
async def update_producto(
    producto_id: int,
    nombre: str = Form(...),
    descripcion: str = Form(None),
    precio: float = Form(None),
    stock: int = Form(None),
    tUnidad: str = Form(None),
    proveedor_id: int = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto.nombre = nombre
    producto.descripcion = descripcion
    producto.precio = precio
    producto.stock = stock
    producto.tUnidad = tUnidad

    if proveedor_id:
        proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        producto.proveedores = [proveedor] 

    if imagen and imagen.filename:
        if not imagen.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

        file_extension = imagen.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = IMAGES_DIR / unique_filename

        try:
            contents = await imagen.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            producto.imagen = f"/images/{unique_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {e}")

    db.commit()
    db.refresh(producto)
    return producto

#################################PROVEEDORES#################################
@router.get("/proveedores/", response_model=list[ProveedorOut])
def read_proveedores(db: Session = Depends(get_db)):
    return db.query(Proveedor).all()

@router.post("/proveedores/", response_model=ProveedorOut)
def create_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db)):
    db_proveedor = Proveedor(**proveedor.dict())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor
