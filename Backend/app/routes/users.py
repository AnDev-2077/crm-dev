from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.usuario_schema import UsuarioCreate, UsuarioOut, UsuarioUpdate
from ..routes.auth import get_current_user, hash_password, verify_password

router = APIRouter(
    prefix="/users",
    tags=["Gestión de Usuarios"]
)


def require_admin(current_user: Usuario = Depends(get_current_user)):
    """Requiere que el usuario sea administrador"""
    if current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Se requieren permisos de administrador"
        )
    return current_user

@router.get("/", response_model=List[UsuarioOut])
def get_usuarios(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    """Obtener todos los usuarios (solo admin)"""
    usuarios = db.query(Usuario).all()
    return usuarios

@router.get("/{user_id}", response_model=UsuarioOut)
def get_usuario(user_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    """Obtener un usuario por ID (solo admin)"""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario

@router.post("/", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    """Crear un nuevo usuario (solo admin)"""
    
    existing_user = db.query(Usuario).filter(Usuario.correo == usuario.correo).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado"
        )
    
    
    hashed_password = hash_password(usuario.contraseña)
    db_usuario = Usuario(
        nombre=usuario.nombre,
        apellidos=usuario.apellidos,
        correo=usuario.correo,
        contraseña=hashed_password,
        rol=usuario.rol,
        is_active=usuario.is_active
    )
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.put("/{user_id}", response_model=UsuarioOut)
def update_usuario(
    user_id: int, 
    usuario_update: UsuarioUpdate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(require_admin)
):
    """Actualizar un usuario por ID (solo admin)"""
    db_usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    
    if usuario_update.correo and usuario_update.correo != db_usuario.correo:
        existing_user = db.query(Usuario).filter(Usuario.correo == usuario_update.correo).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado"
            )
    
    
    update_data = usuario_update.dict(exclude_unset=True)
    
    
    if "contraseña" in update_data:
        update_data["contraseña"] = hash_password(update_data["contraseña"])
    
    for field, value in update_data.items():
        setattr(db_usuario, field, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/{user_id}")
def delete_usuario(user_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    """Eliminar un usuario por ID (solo admin)"""
    db_usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    
    if db_usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propia cuenta"
        )
    
    db.delete(db_usuario)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

@router.patch("/{user_id}/toggle-status", response_model=UsuarioOut)
def toggle_usuario_status(user_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    """Activar/desactivar un usuario (solo admin)"""
    db_usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    
    if db_usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propia cuenta"
        )
    
    db_usuario.is_active = not db_usuario.is_active
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.get("/buscar/{correo}", response_model=UsuarioOut)
def buscar_usuario_por_correo(correo: str, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    """Buscar un usuario por correo electrónico (solo admin)"""
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario
