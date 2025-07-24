from ast import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session, joinedload
from ..database import SessionLocal, get_db
from ..models.productos import Producto
from ..models.proveedores import Proveedor
from ..models.clientes import Cliente
from ..models.usuario import Usuario
from ..schemas.proveedores_schema import ProveedorCreate, ProveedorOut
from ..schemas.clientes_schema import ClienteCreate, ClienteOut
from ..schemas.producto_schema import ProductOut, ProductCreate, ProductoSchema
from datetime import datetime
from pathlib import Path
import uuid
from ..models.tUnidad import TipoUnidad
from ..schemas.tUnidad_schema import TUnidadCreate, TUnidadOut
from sqlalchemy.orm import joinedload
from typing import List
from ..schemas.compra_schema import CompraCreate
from ..models.compra import Compra
from ..models.compra import DetalleCompra
from sqlalchemy import func
from ..models.ventas import Venta, DetalleVenta
from ..schemas.ventas_schema import VentaCreate, VentaOut
from ..routes.auth import get_current_user

router = APIRouter()

# Funciones de control de roles
def require_admin(current_user: Usuario = Depends(get_current_user)):
    """Requiere que el usuario sea administrador"""
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Se requieren permisos de administrador"
        )
    return current_user

def require_authenticated(current_user: Usuario = Depends(get_current_user)):
    """Requiere que el usuario esté autenticado"""
    return current_user

BASE_DIR = Path(__file__).resolve().parent.parent.parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)

#################################PRODUCTOS#################################

@router.get("/productos/", response_model=List[ProductOut])
def get_productos(db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    productos = db.query(Producto).options(
        joinedload(Producto.tipo_unidad),
        joinedload(Producto.proveedores)
    ).all()
    return productos

@router.get("/productos/{producto_id}", response_model=ProductOut)
def get_producto(producto_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
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
    precio_compra: float = Form(None),
    precio_venta: float = Form(None),
    stock: int = Form(None),
    tUnidad: int = Form(None), 
    proveedor_id: int = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    producto_data = {
        "nombre": nombre,
        "descripcion": descripcion,
        "precio_compra": precio_compra,
        "precio_venta": precio_venta,
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
    precio_compra: float = Form(None),
    precio_venta: float = Form(None),
    stock: int = Form(None),
    tUnidad: int = Form(None), 
    proveedor_id: int = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto.nombre = nombre
    producto.descripcion = descripcion
    producto.precio_compra = precio_compra
    producto.precio_venta = precio_venta
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
def get_productos_por_proveedor(proveedor_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
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
def get_unidades(db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    return db.query(TipoUnidad).all()

@router.post("/tipo-unidad/")
def crear_tipo_unidad(unidad: TUnidadCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    nueva_unidad = TipoUnidad(nombre=unidad.nombre)
    db.add(nueva_unidad)
    db.commit()
    db.refresh(nueva_unidad)
    return nueva_unidad

#################################PROVEEDORES#################################

@router.get("/proveedores/", response_model=list[ProveedorOut])
def read_proveedores(db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    return db.query(Proveedor).all()

@router.post("/proveedores/", response_model=ProveedorOut)
def create_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    db_proveedor = Proveedor(**proveedor.dict())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor
##########################CLIENTES######################################

@router.get("/clientes/", response_model=list[ClienteOut])
def read_clientes(db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    return db.query(Cliente).all()

@router.post("/clientes/", response_model=ClienteOut)
def create_clientes(cliente: ClienteCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    db_cliente = Cliente(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

###############################COMPRAS#########################################

@router.post("/compras/")
def crear_compra(compra: CompraCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):

    ultimo_orden = db.query(func.max(Compra.orden_compra)).scalar()
    if ultimo_orden and ultimo_orden.isdigit():
        nuevo_numero = int(ultimo_orden) + 1
    else:
        nuevo_numero = 1
    orden_formateada = f"{nuevo_numero:07d}"

    total_calculado = sum(item.cantidad * item.precio_unitario for item in compra.productos)

    nueva_compra = Compra(
        proveedor_id=compra.proveedor_id,
        orden_compra=orden_formateada,
        fecha=datetime.now(),
    )

    db.add(nueva_compra)
    db.flush()

    for item in compra.productos:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto ID {item.producto_id} no encontrado")

        detalle = DetalleCompra(
            compra_id=nueva_compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
        )
        db.add(detalle)

        producto.stock += item.cantidad

    db.commit()
    db.refresh(nueva_compra)

    return {
        "message": "Compra registrada correctamente",
        "orden_compra": nueva_compra.orden_compra,
        "id": nueva_compra.id,
        "total": total_calculado
    }

@router.get("/compras/siguiente-numero")
def obtener_siguiente_numero(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    ultima_compra = db.query(Compra).order_by(Compra.id.desc()).first()
    numero = ultima_compra.id + 1 if ultima_compra else 1
    return {"numero_orden": f"{numero:07d}"}



##########################VENTAS##############################

@router.post("/ventas/", response_model=VentaOut)
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    # Obtener el último número de orden registrado
    ultimo_orden = db.query(func.max(Venta.orden_venta)).scalar()
    if ultimo_orden and ultimo_orden.isdigit():
        nuevo_numero = int(ultimo_orden) + 1
    else:
        nuevo_numero = 1
    orden_formateada = f"{nuevo_numero:07d}"

    nueva_venta = Venta(
        cliente_id=venta.cliente_id,
        orden_venta=orden_formateada,
        fecha=datetime.now(),
    )

    db.add(nueva_venta)
    db.flush() 

    for item in venta.detalles:
        detalle = DetalleVenta(
            venta_id=nueva_venta.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
        )
        db.add(detalle)

        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if producto:
            producto.stock -= item.cantidad

    db.commit()
    db.refresh(nueva_venta)

    return nueva_venta

@router.get("/ventas/", response_model=List[VentaOut])
def listar_ventas(db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    return db.query(Venta).options(joinedload(Venta.detalles)).all()

@router.get("/ventas/siguiente-numero")
def obtener_siguiente_numero(db: Session = Depends(get_db), current_user: Usuario = Depends(require_authenticated)):
    ultima_venta = db.query(Venta).order_by(Venta.id.desc()).first()
    numero = ultima_venta.id + 1 if ultima_venta else 1
    return {"numero_orden": f"{numero:07d}"}