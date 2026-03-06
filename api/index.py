"""
Vercel Serverless Function Entry Point
Exports the FastAPI app for Vercel's Python runtime.
"""
import sys
import os

# Add project root to Python path so imports work
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from app import app
