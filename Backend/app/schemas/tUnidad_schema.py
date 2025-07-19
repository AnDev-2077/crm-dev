from pydantic import BaseModel

class TUnidadBase(BaseModel):
    nombre: str

class TUnidadCreate(TUnidadBase):
    pass

class TUnidadOut(TUnidadBase):
    id: int

    class Config:
        from_attributes = True