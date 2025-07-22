from ast import List
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
from ..models.tUnidad import TipoUnidad
from ..schemas.tUnidad_schema import TUnidadCreate, TUnidadOut
from sqlalchemy.orm import joinedload
from typing import List
from ..schemas.compra_schema import CompraCreate



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

@router.get("/productos/", response_model=List[ProductOut])
def get_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).options(
        joinedload(Producto.tipo_unidad),
        joinedload(Producto.proveedores)
    ).all()
    return productos

@router.get("/productos/{producto_id}", response_model=ProductOut)
def get_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = (
        db.query(Producto)
        .options(joinedload(Producto.tipo_unidad), joinedload(Producto.proveedores))
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
    tUnidad: int = Form(None), 
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
    tUnidad: int = Form(None), 
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

@router.get("/productos/proveedor/{proveedor_id}", response_model=List[ProductOut])
def get_productos_por_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    productos = (
        db.query(Producto)
        .options(joinedload(Producto.tipo_unidad), joinedload(Producto.proveedores))
        .join(Producto.proveedores)
        .filter(Proveedor.id == proveedor_id)
        .all()
    )
    return productos

#################################TIPO UNIDAD#################################

@router.get("/tipo-unidad/", response_model=list[TUnidadOut])
def get_unidades(db: Session = Depends(get_db)):
    return db.query(TipoUnidad).all()


@router.post("/tipo-unidad/")
def crear_tipo_unidad(unidad: TUnidadCreate, db: Session = Depends(get_db)):
    nueva_unidad = TipoUnidad(nombre=unidad.nombre)
    db.add(nueva_unidad)
    db.commit()
    db.refresh(nueva_unidad)
    return nueva_unidad

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

###############################COMPRAS#########################################

@router.post("/compras/")
def registrar_compra(compra: CompraCreate, db: Session = Depends(get_db)):
    nueva_compra = Compra(proveedor_id=compra.proveedor_id)
    db.add(nueva_compra)
    db.flush()  # Necesario para obtener el ID antes de commit

    for item in compra.productos:
        producto_existente = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not producto_existente:
            raise HTTPException(status_code=404, detail=f"Producto con ID {item.producto_id} no encontrado")

        detalle = DetalleCompra(
            compra_id=nueva_compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario
        )
        db.add(detalle)

        # Opcional: actualizar el stock del producto
        producto_existente.stock += item.cantidad

    db.commit()
    db.refresh(nueva_compra)
    return {"message": "Compra registrada correctamente", "id": nueva_compra.id}