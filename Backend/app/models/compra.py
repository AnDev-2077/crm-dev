from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, DECIMAL
from sqlalchemy.orm import relationship
from ..database import Base

class Compra(Base):
    __tablename__ = "compras"
    id = Column(Integer, primary_key=True, index=True)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), nullable=False)
    fecha = Column(DateTime, default=func.now())
    detalles = relationship("DetalleCompra", back_populates="compra", cascade="all, delete-orphan")

class DetalleCompra(Base):
    __tablename__ = "detalle_compra"
    id = Column(Integer, primary_key=True, index=True)
    compra_id = Column(Integer, ForeignKey("compras.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(10, 2), nullable=False)
    compra = relationship("Compra", back_populates="detalles")
