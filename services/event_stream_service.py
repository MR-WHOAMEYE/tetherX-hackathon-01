"""
Event Stream Service
Logs and retrieves clinical events for the live event stream.
"""
import json
from datetime import datetime
from database.db import get_connection


def log_event(event_type, title, description="", patient_id=None, staff_name=None, severity="info", metadata=None):
    """Log a clinical event to the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO clinical_events (event_type, severity, patient_id, staff_name, title, description, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (event_type, severity, patient_id, staff_name, title, description, json.dumps(metadata or {})))
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return {
        "id": event_id,
        "event_type": event_type,
        "severity": severity,
        "patient_id": patient_id,
        "staff_name": staff_name,
        "title": title,
        "description": description,
        "metadata": metadata or {},
        "created_at": datetime.now().isoformat()
    }


def get_recent_events(limit=50, event_type=None):
    """Get recent clinical events."""
    conn = get_connection()
    cursor = conn.cursor()
    if event_type:
        cursor.execute("""
            SELECT * FROM clinical_events WHERE event_type = ? ORDER BY created_at DESC LIMIT ?
        """, (event_type, limit))
    else:
        cursor.execute("""
            SELECT * FROM clinical_events ORDER BY created_at DESC LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    events = []
    for r in rows:
        events.append({
            "id": r["id"],
            "event_type": r["event_type"],
            "severity": r["severity"],
            "patient_id": r["patient_id"],
            "staff_name": r["staff_name"],
            "title": r["title"],
            "description": r["description"],
            "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
            "created_at": r["created_at"]
        })
    return events
