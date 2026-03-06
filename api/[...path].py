"""
Vercel catch-all Serverless Function entrypoint for FastAPI.
This makes /api/* paths resolve to the same ASGI app.
"""
import os
import sys
import traceback

# Add project root to Python path so imports work.
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

try:
    from app import app
except Exception:
    from fastapi import FastAPI

    app = FastAPI()
    _startup_error = traceback.format_exc()

    @app.get("/{path:path}")
    async def startup_error(path: str = ""):
        return {"error": "Application failed to start", "details": _startup_error}
