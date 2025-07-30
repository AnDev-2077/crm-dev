from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta
from ..database import SessionLocal, get_db
from ..models.usuario import Usuario
from ..schemas.usuario_schema import UsuarioCreate, UsuarioOut, UsuarioLogin, Token
from ..utils.jwt import crear_token, verificar_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hashea una contraseña"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_email(db: Session, email: str):
    """Obtiene un usuario por su correo electrónico"""
    return db.query(Usuario).filter(Usuario.correo == email).first()

def authenticate_user(db: Session, email: str, password: str):
    """Autentica un usuario verificando sus credenciales"""
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.contraseña):
        return False
    if not user.is_active:
        return False
    return user

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Obtiene el usuario actual desde el token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = verificar_token(token)
        if payload is None:
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/registro", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario"""

    db_user = get_user_by_email(db, email=usuario.correo)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado"
        )
    

    hashed_password = hash_password(usuario.contraseña)
    db_user = Usuario(
        nombre=usuario.nombre,
        apellidos=usuario.apellidos,
        correo=usuario.correo,
        contraseña=hashed_password,
        rol=usuario.rol,
        is_active=usuario.is_active
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(user_credentials: UsuarioLogin, db: Session = Depends(get_db)):
    """Autentica un usuario y devuelve un token JWT"""
    user = authenticate_user(db, user_credentials.correo, user_credentials.contraseña)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crear_token(
        data={"sub": user.correo}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UsuarioOut)
def obtener_usuario_actual(current_user: Usuario = Depends(get_current_user)):
    """Obtiene la información del usuario autenticado"""
    return current_user

@router.get("/usuarios", response_model=list[UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    """Lista todos los usuarios (requiere autenticación)"""
    
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción"
        )
    
    users = db.query(Usuario).all()
    return users