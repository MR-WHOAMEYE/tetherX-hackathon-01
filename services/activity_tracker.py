"""
Staff Activity Tracker Service
Tracks all staff actions for the activity feed.
"""
import json
from database.db import get_connection


def log_activity(staff_name, staff_role, action_type, description, patient_id=None, metadata=None):
    """Log a staff activity."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO staff_activity (staff_name, staff_role, action_type, patient_id, description, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (staff_name, staff_role, action_type, patient_id, description, json.dumps(metadata or {})))
    conn.commit()
    activity_id = cursor.lastrowid
    conn.close()
    return {
        "id": activity_id,
        "staff_name": staff_name,
        "staff_role": staff_role,
        "action_type": action_type,
        "patient_id": patient_id,
        "description": description,
        "metadata": metadata or {}
    }


def get_recent_activities(limit=50, staff_role=None):
    """Get recent staff activities."""
    conn = get_connection()
    cursor = conn.cursor()
    if staff_role:
        cursor.execute("""
            SELECT * FROM staff_activity WHERE staff_role = ? ORDER BY created_at DESC LIMIT ?
        """, (staff_role, limit))
    else:
        cursor.execute("""
            SELECT * FROM staff_activity ORDER BY created_at DESC LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    activities = []
    for r in rows:
        activities.append({
            "id": r["id"],
            "staff_name": r["staff_name"],
            "staff_role": r["staff_role"],
            "action_type": r["action_type"],
            "patient_id": r["patient_id"],
            "description": r["description"],
            "metadata": json.loads(r["metadata"]) if r["metadata"] else {},
            "created_at": r["created_at"]
        })
    return activities
