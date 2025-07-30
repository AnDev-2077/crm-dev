import subprocess
import webbrowser
import time
import sys
import os

def start_app():
    """Inicia la aplicación completa"""
    print("🚀 Iniciando aplicación...")
    

    backend_dir = r"C:\Users\Mauro\Downloads\MauroWEB\Backend"
    frontend_dir = r"C:\Users\Mauro\Downloads\MauroWEB\Frontend\frontend-app\dist"
    

    if not os.path.exists(backend_dir):
        print(f"❌ Directorio backend no encontrado: {backend_dir}")
        return False
    
    if not os.path.exists(frontend_dir):
        print(f"❌ Directorio frontend no encontrado: {frontend_dir}")
        return False
    
    print("✅ Directorios encontrados")
    
    try:

        print("📁 Iniciando backend...")
        backend_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "app.main:app", 
            "--host", "127.0.0.1", "--port", "8000", "--reload"
        ], cwd=backend_dir, creationflags=subprocess.CREATE_NO_WINDOW)
        

        print("🌐 Iniciando frontend...")
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "5173"
        ], cwd=frontend_dir, creationflags=subprocess.CREATE_NO_WINDOW)
        

        print("⏳ Esperando que los servidores se inicien...")
        time.sleep(5)
        
        print("🌐 Abriendo navegador...")
        webbrowser.open("http://localhost:5173")
        
        print("✅ Aplicación iniciada!")
        print("📁 Backend: http://127.0.0.1:8000")
        print("🌐 Frontend: http://localhost:5173")
        print("💡 Presiona Ctrl+C para detener")
        
    
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Deteniendo aplicación...")
            backend_process.terminate()
            frontend_process.terminate()
            backend_process.wait()
            frontend_process.wait()
            print("✅ Aplicación detenida")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_app() 