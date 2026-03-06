"""
Follow-Up Care Management Service
Manages post-treatment follow-up scheduling and reminders.
"""
from database.db import get_connection
import json


def get_upcoming_followups(patient_id: str = None, limit: int = 20) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    if patient_id:
        cursor.execute("""SELECT a.*, p.first_name, p.last_name, p.age, p.status as patient_status
            FROM appointments a JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.patient_id=? AND a.status='scheduled'
            ORDER BY a.scheduled_date ASC LIMIT ?""", (patient_id, limit))
    else:
        cursor.execute("""SELECT a.*, p.first_name, p.last_name, p.age, p.status as patient_status
            FROM appointments a JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.status='scheduled'
            ORDER BY a.scheduled_date ASC LIMIT ?""", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def schedule_followup(patient_id: str, doctor: str, apt_type: str, date: str, time: str, notes: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO appointments (patient_id,doctor_name,appointment_type,scheduled_date,scheduled_time,status,notes)
        VALUES (?,?,?,?,?,?,?)""", (patient_id, doctor, apt_type, date, time, "scheduled", notes))
    conn.commit()
    conn.close()


def complete_followup(appointment_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE appointments SET status='completed' WHERE id=?", (appointment_id,))
    conn.commit()
    conn.close()


def cancel_followup(appointment_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE appointments SET status='cancelled' WHERE id=?", (appointment_id,))
    conn.commit()
    conn.close()


def get_followup_stats() -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status, COUNT(*) as count FROM appointments GROUP BY status")
    rows = cursor.fetchall()
    conn.close()
    stats = {r["status"]: r["count"] for r in rows}
    return {
        "scheduled": stats.get("scheduled", 0),
        "completed": stats.get("completed", 0),
        "cancelled": stats.get("cancelled", 0),
        "no_show": stats.get("no_show", 0),
        "total": sum(stats.values()),
    }


def generate_medication_reminders(patient_id: str) -> list:
    """Generate medication reminders based on current prescriptions."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT current_medications FROM patients WHERE patient_id=?", (patient_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return []

    meds = json.loads(row["current_medications"]) if isinstance(row["current_medications"], str) else row["current_medications"]
    reminders = []
    for med in meds:
        if med.lower() != "none":
            reminders.append({
                "medication": med,
                "reminder": f"Take {med} as prescribed",
                "frequency": "Daily",
                "status": "active",
            })
    return reminders
