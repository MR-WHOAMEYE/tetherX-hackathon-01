"""
Clinical Event Stream Service
Captures and logs all system events for real-time display.
"""
from database.db import get_connection
from datetime import datetime


def log_event(event_type: str, title: str, description: str = "",
              severity: str = "info", patient_id: str = None,
              staff_name: str = None, department: str = None) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO clinical_events
        (event_type, severity, title, description, patient_id, staff_name, department)
        VALUES (?,?,?,?,?,?,?)""",
        (event_type, severity, title, description, patient_id, staff_name, department))
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return {
        "id": event_id, "event_type": event_type, "severity": severity,
        "title": title, "description": description, "patient_id": patient_id,
        "staff_name": staff_name, "department": department,
        "created_at": datetime.now().isoformat()
    }


def get_recent_events(limit: int = 50) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM clinical_events
        ORDER BY created_at DESC LIMIT ?""", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_events_by_type(event_type: str, limit: int = 20) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM clinical_events
        WHERE event_type=? ORDER BY created_at DESC LIMIT ?""", (event_type, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_event_counts() -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT event_type, COUNT(*) as count FROM clinical_events
        GROUP BY event_type ORDER BY count DESC""")
    rows = cursor.fetchall()
    conn.close()
    return {r["event_type"]: r["count"] for r in rows}
