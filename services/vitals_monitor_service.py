"""
Vitals Monitor Service
Real-time vital sign monitoring with trend data for live charts.
"""
from database.db import get_connection


def get_live_vitals(patient_id):
    """Get the most recent vitals for a patient."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1
    """, (patient_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)


def get_vitals_trend(patient_id, limit=30):
    """Get vitals trend data for charts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, patient_id, heart_rate, oxygen_level, blood_pressure_sys,
               blood_pressure_dia, temperature, respiratory_rate, blood_glucose,
               recorded_at
        FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT ?
    """, (patient_id, limit))
    rows = cursor.fetchall()
    conn.close()
    # Reverse to get chronological order
    data = [dict(r) for r in rows]
    data.reverse()
    return data


def get_all_patients_latest_vitals():
    """Get the latest vitals for all patients (for command center overview)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT v.*, p.first_name, p.last_name, p.status as patient_status
        FROM vitals v
        INNER JOIN patients p ON v.patient_id = p.patient_id
        WHERE v.id IN (
            SELECT MAX(id) FROM vitals GROUP BY patient_id
        )
        ORDER BY v.recorded_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
