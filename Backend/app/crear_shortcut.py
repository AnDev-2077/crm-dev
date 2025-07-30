import os
from pyshortcuts import make_shortcut

script_path = os.path.abspath("app/start_app.py")

if os.path.exists(script_path):
    print(f"📁 Script encontrado en: {script_path}")
else:
    print("❌ No se encontró el script.")
    exit()

make_shortcut(
    script=script_path,
    name="Mi Aplicación Web",
    description="Inicia backend y frontend sin consola",
    terminal=False,
    startmenu=False,
    desktop=True
)

print("✅ Acceso directo creado en el escritorio.")
