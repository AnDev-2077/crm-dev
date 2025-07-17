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

IMAGES_DIR = Path("images")
IMAGES_DIR.mkdir(exist_ok=True)

@router.post("/productos/", response_model=ProductOut)
async def create_producto(
    nombre: str = Form(...),
    descripcion: str = Form(None),
    precio: float = Form(None),
    stock: int = Form(None),
    tUnidad: str = Form(None),
    proveedor_id: int = Form(None),
    file: UploadFile = File(None),  # Imagen opcional
    db: Session = Depends(get_db)
):
    # Crear datos del producto
    producto_data = {
        "nombre": nombre,
        "descripcion": descripcion,
        "precio": precio,
        "stock": stock,
        "tUnidad": tUnidad
    }
    
    # Manejar imagen si se proporciona
    if file and file.filename:
        # Validar tipo de archivo
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
        
        # Generar nombre único y guardar
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = IMAGES_DIR / unique_filename
        
        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            producto_data["imagen"] = f"/images/{unique_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail="Error al guardar la imagen")

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