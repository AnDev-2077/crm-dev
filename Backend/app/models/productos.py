from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, DECIMAL, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .proveedores import proveedor_producto


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(DECIMAL(10, 2), nullable=True)
    stock = Column(Integer, nullable=True)
    tUnidad = Column(String(100), nullable=True)    
    fechaIngreso = Column(TIMESTAMP, nullable=True, server_default=func.now())
    is_active = Column(Boolean, default=True, nullable=True)    
    imagen = Column(String(255), nullable=True) 

    proveedores = relationship("Proveedor", secondary="proveedor_producto", back_populates="productos")