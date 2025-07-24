from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.provedor_producto import router as provedor_producto_router
from app.routes.auth import router as auth_router
from sqlalchemy import text
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import SessionLocal

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)

app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

app.include_router(provedor_producto_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Hello, World!"}

@app.get("/db-status")
def db_status():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ok", "message": "Conexión exitosa a la base de datos"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
