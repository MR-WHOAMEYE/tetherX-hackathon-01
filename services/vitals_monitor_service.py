"""
Live Vitals Monitor Service
Generates realistic vital sign updates for demo purposes.
Triggers risk recalculation and alerts when vitals change.
"""
import random
import json
from database.db import get_connection


def generate_vitals_update(patient_id: str) -> dict:
    """Generate a realistic vitals reading for a patient."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vitals WHERE patient_id=? ORDER BY recorded_at DESC LIMIT 1", (patient_id,))
    last = cursor.fetchone()

    cursor.execute("SELECT status, first_name, last_name FROM patients WHERE patient_id=?", (patient_id,))
    patient = cursor.fetchone()
    conn.close()

    if not patient:
        return {}

    status = patient["status"]
    name = f"{patient['first_name']} {patient['last_name']}"

    if last:
        base = dict(last)
        # Slight random variation from last reading
        hr = max(40, min(180, base["heart_rate"] + random.randint(-5, 5)))
        o2 = max(75, min(100, round(base["oxygen_level"] + random.uniform(-1.5, 1.0), 1)))
        bp_sys = max(70, min(200, base["blood_pressure_sys"] + random.randint(-5, 5)))
        bp_dia = max(40, min(120, base["blood_pressure_dia"] + random.randint(-3, 3)))
        temp = max(95.0, min(106.0, round(base["temperature"] + random.uniform(-0.3, 0.3), 1)))
        rr = max(8, min(35, base["respiratory_rate"] + random.randint(-2, 2)))
    else:
        # Generate from scratch based on status
        if status == "critical":
            hr = random.randint(90, 140)
            o2 = round(random.uniform(85, 94), 1)
            bp_sys = random.randint(85, 180)
            bp_dia = random.randint(50, 110)
            temp = round(random.uniform(99.0, 103.5), 1)
            rr = random.randint(18, 30)
        else:
            hr = random.randint(60, 100)
            o2 = round(random.uniform(94, 100), 1)
            bp_sys = random.randint(100, 145)
            bp_dia = random.randint(60, 90)
            temp = round(random.uniform(97.0, 99.5), 1)
            rr = random.randint(12, 20)

    return {
        "patient_id": patient_id,
        "patient_name": name,
        "heart_rate": hr,
        "oxygen_level": o2,
        "blood_pressure_sys": bp_sys,
        "blood_pressure_dia": bp_dia,
        "temperature": temp,
        "respiratory_rate": rr,
        "blood_glucose": round(random.uniform(70, 180), 1),
        "weight": 0,
        "recorded_by": "System Monitor",
    }


def get_critical_patients() -> list:
    """Get list of patients who are critical or monitoring."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT patient_id FROM patients
        WHERE status IN ('critical', 'monitoring') LIMIT 20""")
    rows = cursor.fetchall()
    conn.close()
    return [r["patient_id"] for r in rows]


def get_live_vitals_snapshot(patient_id: str, points: int = 20) -> list:
    """Get recent vitals for live chart display."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT heart_rate, oxygen_level, blood_pressure_sys,
        blood_pressure_dia, respiratory_rate, temperature, recorded_at
        FROM vitals WHERE patient_id=?
        ORDER BY recorded_at DESC LIMIT ?""", (patient_id, points))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in reversed(rows)]
