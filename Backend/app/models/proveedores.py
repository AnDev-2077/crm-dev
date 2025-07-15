from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from ..database import Base

proveedor_producto = Table(
    'proveedor_producto', Base.metadata,
    Column('proveedor_id', Integer, ForeignKey('proveedores.id'), primary_key=True),
    Column('producto_id', Integer, ForeignKey('productos.id'), primary_key=True)
)

class Proveedor(Base):
    __tablename__ = "proveedores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=True)
    direccion = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)

    productos = relationship("Producto", secondary="proveedor_producto", back_populates="proveedores")