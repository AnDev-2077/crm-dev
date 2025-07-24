from sqlalchemy import Column, Integer, String, Boolean
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellidos = Column(String(100), nullable=False)
    correo = Column(String(100), nullable=False, unique=True, index=True)
    contraseña = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
