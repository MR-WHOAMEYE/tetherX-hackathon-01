"""
Staff Activity Tracking Service
Logs and retrieves staff actions for the activity feed.
"""
from database.db import get_connection
from datetime import datetime


def log_activity(staff_name: str, staff_role: str, action: str,
                 details: str = "", patient_id: str = None,
                 department: str = None) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO staff_activity
        (staff_name, staff_role, action, details, patient_id, department)
        VALUES (?,?,?,?,?,?)""",
        (staff_name, staff_role, action, details, patient_id, department))
    conn.commit()
    activity_id = cursor.lastrowid
    conn.close()
    return {
        "id": activity_id, "staff_name": staff_name, "staff_role": staff_role,
        "action": action, "details": details, "patient_id": patient_id,
        "department": department, "created_at": datetime.now().isoformat()
    }


def get_recent_activity(limit: int = 30) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM staff_activity
        ORDER BY created_at DESC LIMIT ?""", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_staff_workload() -> list:
    """Get workload per doctor."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT assigned_doctor as doctor,
               COUNT(*) as total_patients,
               SUM(CASE WHEN status='critical' THEN 1 ELSE 0 END) as critical_count,
               SUM(CASE WHEN status='monitoring' THEN 1 ELSE 0 END) as monitoring_count,
               SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active_count
        FROM patients WHERE assigned_doctor IS NOT NULL AND assigned_doctor != ''
        GROUP BY assigned_doctor ORDER BY total_patients DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_activity_by_staff(staff_name: str, limit: int = 20) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM staff_activity
        WHERE staff_name=? ORDER BY created_at DESC LIMIT ?""", (staff_name, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
