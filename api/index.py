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
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    app = FastAPI()
    _startup_error = traceback.format_exc()
    _startup_exception = repr(e)

    @app.api_route(
        "/{path:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    )
    async def startup_error(path: str = "", request: Request = None):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application failed to start",
                "exception": _startup_exception,
                "method": request.method if request else None,
                "path": path,
                "details": _startup_error,
            },
        )
