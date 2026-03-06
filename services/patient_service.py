"""
Patient Data Management Service — CRUD operations for patient records.
"""
import json
from database.db import get_connection


def get_all_patients(status_filter=None, search_query=None, limit=100):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM patients WHERE 1=1"
    params = []
    if status_filter and status_filter != "all":
        query += " AND status=?"
        params.append(status_filter)
    if search_query:
        query += " AND (first_name LIKE ? OR last_name LIKE ? OR patient_id LIKE ?)"
        params.extend([f"%{search_query}%"] * 3)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_patient(patient_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE patient_id=?", (patient_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def create_patient(data: dict) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM patients")
    count = cursor.fetchone()[0]
    pid = f"PT-{10001 + count}"
    cursor.execute("""INSERT INTO patients (patient_id,first_name,last_name,age,gender,blood_type,
        date_of_birth,phone,email,address,emergency_contact,insurance_id,allergies,medical_history,
        current_medications,symptoms,status,assigned_doctor,assigned_nurse,room_number)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (pid, data.get("first_name",""), data.get("last_name",""), data.get("age",0),
         data.get("gender",""), data.get("blood_type",""), data.get("date_of_birth",""),
         data.get("phone",""), data.get("email",""), data.get("address",""),
         data.get("emergency_contact",""), data.get("insurance_id",""),
         json.dumps(data.get("allergies",[])), json.dumps(data.get("medical_history",[])),
         json.dumps(data.get("current_medications",[])), json.dumps(data.get("symptoms",[])),
         data.get("status","active"), data.get("assigned_doctor",""),
         data.get("assigned_nurse",""), data.get("room_number","")))
    conn.commit()
    conn.close()
    return pid


def update_patient(patient_id: str, data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    fields = []
    values = []
    for key, val in data.items():
        if key in ("patient_id", "id", "created_at"):
            continue
        if isinstance(val, list):
            val = json.dumps(val)
        fields.append(f"{key}=?")
        values.append(val)
    values.append(patient_id)
    cursor.execute(f"UPDATE patients SET {','.join(fields)}, updated_at=CURRENT_TIMESTAMP WHERE patient_id=?", values)
    conn.commit()
    conn.close()


def get_patient_vitals(patient_id: str, limit=10):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vitals WHERE patient_id=? ORDER BY recorded_at DESC LIMIT ?", (patient_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_vitals(data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO vitals (patient_id,blood_pressure_sys,blood_pressure_dia,heart_rate,
        oxygen_level,temperature,respiratory_rate,blood_glucose,weight,recorded_by)
        VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (data["patient_id"], data.get("blood_pressure_sys",120), data.get("blood_pressure_dia",80),
         data.get("heart_rate",72), data.get("oxygen_level",98.0), data.get("temperature",98.6),
         data.get("respiratory_rate",16), data.get("blood_glucose",100), data.get("weight",150),
         data.get("recorded_by","")))
    conn.commit()
    conn.close()


def get_patient_labs(patient_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lab_results WHERE patient_id=? ORDER BY ordered_at DESC", (patient_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_patient_medications(patient_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medications WHERE patient_id=? ORDER BY created_at DESC", (patient_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_patient_appointments(patient_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE patient_id=? ORDER BY scheduled_date DESC", (patient_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_patients_by_status():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status, COUNT(*) as count FROM patients GROUP BY status")
    rows = cursor.fetchall()
    conn.close()
    return {r["status"]: r["count"] for r in rows}


def get_patient_count():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM patients")
    count = cursor.fetchone()[0]
    conn.close()
    return count
