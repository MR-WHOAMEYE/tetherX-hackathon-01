"""
Vercel Serverless Function Entry Point
Exports the FastAPI app for Vercel's Python runtime.
"""
import sys
import os
import traceback

# Add project root to Python path so imports work
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

try:
    from app import app
except Exception as e:
    # If the main app fails to load, create a minimal app that reports the error
    from fastapi import FastAPI
    app = FastAPI()
    _startup_error = traceback.format_exc()

    @app.get("/{path:path}")
    async def startup_error(path: str = ""):
        return {"error": "Application failed to start", "details": _startup_error}
