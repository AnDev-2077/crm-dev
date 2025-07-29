from ast import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from ..database import SessionLocal
from ..models.productos import Producto
from ..models.proveedores import Proveedor
from ..models.clientes import Cliente
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
    precio_compra: float = Form(None),
    precio_venta: float = Form(None),
    stock: int = Form(None),
    tUnidad: int = Form(None), 
    proveedor_id: int = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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

@router.delete("/tipo-unidad/{unidad_id}")
def eliminar_unidad(unidad_id: int, db: Session = Depends(get_db)):
    unidad = db.query(TipoUnidad).filter(TipoUnidad.id == unidad_id).first()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")
    db.delete(unidad)
    db.commit()
    return {"message": "Unidad eliminada correctamente"}

#################################PROVEEDORES#################################

@router.get("/proveedores/", response_model=list[ProveedorOut])
def read_proveedores(db: Session = Depends(get_db)):
    return db.query(Proveedor).all()

@router.get("/proveedores/{proveedor_id}", response_model=dict)
def obtener_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    try:
        proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        return {
            "id": proveedor.id,
            "nombre": proveedor.nombre,
            "documento": proveedor.documento,
            "tipoDocumento": proveedor.tipoDocumento,
            "correo": proveedor.correo,
            "telefono": proveedor.telefono,
            "direccion": proveedor.direccion
        }
    except Exception as e:
        print(f"Error en obtener_proveedor: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/proveedores/{proveedor_id}")
def actualizar_proveedor(proveedor_id: int, proveedor_data: dict, db: Session = Depends(get_db)):
    try:
        proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
        # Actualizar campos
        proveedor.nombre = proveedor_data.get("nombre", proveedor.nombre)
        proveedor.documento = proveedor_data.get("documento", proveedor.documento)
        proveedor.tipoDocumento = proveedor_data.get("tipoDocumento", proveedor.tipoDocumento)
        proveedor.correo = proveedor_data.get("correo", proveedor.correo)
        proveedor.telefono = proveedor_data.get("telefono", proveedor.telefono)
        proveedor.direccion = proveedor_data.get("direccion", proveedor.direccion)
        
        db.commit()
        return {"message": "Proveedor actualizado correctamente"}
    except Exception as e:
        db.rollback()
        print(f"Error en actualizar_proveedor: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/proveedores/", response_model=ProveedorOut)
def create_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db)):
    db_proveedor = Proveedor(**proveedor.dict())
    db.add(db_proveedor)
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor

##########################CLIENTES######################################

@router.get("/clientes/", response_model=list[ClienteOut])
def read_clientes(db: Session = Depends(get_db)):
    return db.query(Cliente).all()

@router.post("/clientes/", response_model=ClienteOut)
def create_clientes(cliente: ClienteCreate, db: Session = Depends(get_db)):
    db_cliente = Cliente(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

@router.get("/clientes/{cliente_id}", response_model=dict)
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    try:
        cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        return {
            "id": cliente.id,
            "nombre": cliente.nombre,
            "documento": cliente.documento,
            "tipoDocumento": cliente.tipoDocumento,
            "correo": cliente.correo,
            "telefono": cliente.telefono,
            "direccion": cliente.direccion
        }
    except Exception as e:
        print(f"Error en obtener_cliente: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/clientes/{cliente_id}")
def actualizar_cliente(cliente_id: int, cliente_data: dict, db: Session = Depends(get_db)):
    try:
        cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        # Actualizar campos
        cliente.nombre = cliente_data.get("nombre", cliente.nombre)
        cliente.documento = cliente_data.get("documento", cliente.documento)
        cliente.tipoDocumento = cliente_data.get("tipoDocumento", cliente.tipoDocumento)
        cliente.correo = cliente_data.get("correo", cliente.correo)
        cliente.telefono = cliente_data.get("telefono", cliente.telefono)
        cliente.direccion = cliente_data.get("direccion", cliente.direccion)
        
        db.commit()
        return {"message": "Cliente actualizado correctamente"}
    except Exception as e:
        db.rollback()
        print(f"Error en actualizar_cliente: {e}")
        raise HTTPException(status_code=500, detail=str(e))
###############################COMPRAS#########################################

@router.post("/compras/")
def crear_compra(compra: CompraCreate, db: Session = Depends(get_db)):

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
def obtener_siguiente_numero(db: Session = Depends(get_db)):
    ultima_compra = db.query(Compra).order_by(Compra.id.desc()).first()
    numero = ultima_compra.id + 1 if ultima_compra else 1
    return {"numero_orden": f"{numero:07d}"}


@router.get("/compras/", response_model=List[dict])
def listar_compras(db: Session = Depends(get_db)):
    try:
        compras = db.query(Compra).all()
        
        result = []
        for compra in compras:
            # Obtener proveedor
            proveedor = db.query(Proveedor).filter(Proveedor.id == compra.proveedor_id).first()
            
            compra_data = {
                "id": compra.id,
                "orden_compra": compra.orden_compra,
                "fecha": compra.fecha.isoformat() if compra.fecha else None,
                "proveedor": {
                    "id": proveedor.id if proveedor else None,
                    "nombre": proveedor.nombre if proveedor else "N/A",
                    "documento": proveedor.documento if proveedor else "N/A"
                },
                "detalles": []
            }
            
            # Obtener detalles
            detalles = db.query(DetalleCompra).filter(DetalleCompra.compra_id == compra.id).all()
            
            for detalle in detalles:
                producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
                
                detalle_data = {
                    "id": detalle.id,
                    "producto": {
                        "id": producto.id if producto else None,
                        "nombre": producto.nombre if producto else "N/A"
                    },
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "total": float(detalle.cantidad * detalle.precio_unitario)
                }
                compra_data["detalles"].append(detalle_data)
            
            result.append(compra_data)
        
        return result
    except Exception as e:
        print(f"Error en listar_compras: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compras/{compra_id}", response_model=dict)
def obtener_compra(compra_id: int, db: Session = Depends(get_db)):
    try:
        compra = db.query(Compra).filter(Compra.id == compra_id).first()
        if not compra:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        
        # Obtener proveedor
        proveedor = db.query(Proveedor).filter(Proveedor.id == compra.proveedor_id).first()
        
        compra_data = {
            "id": compra.id,
            "orden_compra": compra.orden_compra,
            "fecha": compra.fecha.isoformat() if compra.fecha else None,
            "proveedor": {
                "id": proveedor.id if proveedor else None,
                "nombre": proveedor.nombre if proveedor else "Sin proveedor",
                "documento": proveedor.documento if proveedor else "N/A",
                "correo": proveedor.correo if proveedor else "N/A",
                "telefono": proveedor.telefono if proveedor else "N/A"
            },
            "detalles": []
        }
        
        # Obtener detalles
        detalles = db.query(DetalleCompra).filter(DetalleCompra.compra_id == compra.id).all()
        
        for detalle in detalles:
            producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
            
            detalle_data = {
                "id": detalle.id,
                "producto": {
                    "id": producto.id if producto else None,
                    "nombre": producto.nombre if producto else "Producto no encontrado"
                },
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario),
                "total": float(detalle.cantidad * detalle.precio_unitario)
            }
            compra_data["detalles"].append(detalle_data)
        
        return compra_data
    except Exception as e:
        print(f"Error en obtener_compra: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
##########################VENTAS##############################

@router.post("/ventas/", response_model=VentaOut)
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db)):
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

@router.get("/ventas/", response_model=List[dict])
def listar_ventas(db: Session = Depends(get_db)):
    try:
        ventas = db.query(Venta).all()
        
        result = []
        for venta in ventas:
            # Obtener cliente
            cliente = db.query(Cliente).filter(Cliente.id == venta.cliente_id).first()
            
            venta_data = {
                "id": venta.id,
                "orden_venta": venta.orden_venta,
                "fecha": venta.fecha.isoformat() if venta.fecha else None,
                "cliente": {
                    "id": cliente.id if cliente else None,
                    "nombre": cliente.nombre if cliente else "Sin cliente",
                    "documento": cliente.documento if cliente else "N/A"
                },
                "detalles": []
            }
            
            # Obtener detalles
            detalles = db.query(DetalleVenta).filter(DetalleVenta.venta_id == venta.id).all()
            
            for detalle in detalles:
                producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
                
                detalle_data = {
                    "id": detalle.id,
                    "producto": {
                        "id": producto.id if producto else None,
                        "nombre": producto.nombre if producto else "Producto no encontrado"
                    },
                    "cantidad": detalle.cantidad,
                    "precio_unitario": float(detalle.precio_unitario),
                    "total": float(detalle.cantidad * detalle.precio_unitario)
                }
                venta_data["detalles"].append(detalle_data)
            
            result.append(venta_data)
        
        return result
    except Exception as e:
        print(f"Error en listar_ventas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ventas/siguiente-numero")
def obtener_siguiente_numero(db: Session = Depends(get_db)):
    ultima_venta = db.query(Venta).order_by(Venta.id.desc()).first()
    numero = ultima_venta.id + 1 if ultima_venta else 1
    return {"numero_orden": f"{numero:07d}"}

@router.get("/ventas/{venta_id}", response_model=dict)
def obtener_venta(venta_id: int, db: Session = Depends(get_db)):
    try:
        venta = db.query(Venta).filter(Venta.id == venta_id).first()
        if not venta:
            raise HTTPException(status_code=404, detail="Venta no encontrada")
        
        # Obtener cliente
        cliente = db.query(Cliente).filter(Cliente.id == venta.cliente_id).first()
        
        venta_data = {
            "id": venta.id,
            "orden_venta": venta.orden_venta,
            "fecha": venta.fecha.isoformat() if venta.fecha else None,
            "cliente": {
                "id": cliente.id if cliente else None,
                "nombre": cliente.nombre if cliente else "Sin cliente",
                "documento": cliente.documento if cliente else "N/A"
            },
            "detalles": []
        }
        
        # Obtener detalles
        detalles = db.query(DetalleVenta).filter(DetalleVenta.venta_id == venta.id).all()
        
        for detalle in detalles:
            producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
            
            detalle_data = {
                "id": detalle.id,
                "producto": {
                    "id": producto.id if producto else None,
                    "nombre": producto.nombre if producto else "Producto no encontrado"
                },
                "cantidad": detalle.cantidad,
                "precio_unitario": float(detalle.precio_unitario),
                "total": float(detalle.cantidad * detalle.precio_unitario)
            }
            venta_data["detalles"].append(detalle_data)
        
        return venta_data
    except Exception as e:
        print(f"Error en obtener_venta: {e}")
        raise HTTPException(status_code=500, detail=str(e))