"""
Authentication & Role Management Service
"""
from database.db import get_connection


def authenticate(username: str, password: str) -> dict | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None
