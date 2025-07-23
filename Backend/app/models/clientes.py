from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=True)
    direccion = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    documento = Column(String(100), nullable=True)
    tipoDocumento = Column(String(50), nullable= False, default="DNI")

    ventas = relationship("Venta", back_populates="cliente")
