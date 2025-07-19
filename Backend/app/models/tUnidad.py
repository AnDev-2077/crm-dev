from sqlalchemy import Column, Integer, String
from ..database import Base

class TipoUnidad(Base):
    __tablename__ = "tUnidad"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
