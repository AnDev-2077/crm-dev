from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.provedor_producto import router as provedor_producto_router
from sqlalchemy import text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(provedor_producto_router)

@app.get("/")
def root(): 
    return {"message": "Hello, World!"}

@app.get("/db-status")
def db_status():
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ok", "message": "Conexión exitosa a la base de datos"}
    except Exception as e:
        return {"status": "error", "message": str(e)}