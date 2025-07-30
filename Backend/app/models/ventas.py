from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, String
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Venta(Base):
    __tablename__ = "ventas"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    vendedor_id = Column(Integer, ForeignKey("usuario.id"), nullable=True)
    fecha = Column(DateTime, default=datetime.now)
    orden_venta = Column(String(20), unique=True, nullable=False)
    
    cliente = relationship("Cliente", back_populates="ventas")
    vendedor = relationship("Usuario", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")

class DetalleVenta(Base):
    __tablename__ = "detalle_venta"
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"))
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(10, 2), nullable=False)


    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto")
