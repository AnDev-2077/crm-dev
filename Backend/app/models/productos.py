from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, DECIMAL, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .proveedores import proveedor_producto
from .tUnidad import TipoUnidad

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio_compra = Column(DECIMAL(10, 2), nullable=True)
    precio_venta = Column(DECIMAL(10, 2), nullable=True)
    stock = Column(Integer, nullable=True)
    tUnidad = Column(Integer, ForeignKey("tUnidad.id")) 
    fechaIngreso = Column(TIMESTAMP, nullable=True, server_default=func.now())
    is_active = Column(Boolean, default=True, nullable=True)
    imagen = Column(String(255), nullable=True)

    tipo_unidad = relationship("TipoUnidad")  
    proveedores = relationship("Proveedor", secondary="proveedor_producto", back_populates="productos")
    detalles_venta = relationship("DetalleVenta", back_populates="producto")
