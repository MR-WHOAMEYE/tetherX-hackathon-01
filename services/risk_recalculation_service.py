"""
Risk Recalculation Service
Automatically updates risk scores when patient vitals change.
"""
import json
from database.db import get_connection
from services.risk_service import predict_risk
from services.triage_service import calculate_severity


def recalculate_patient_risk(patient_id: str, vitals: dict) -> dict:
    """Recalculate risk scores based on new vitals data."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE patient_id=?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return {}

    patient = dict(row)
    conn.close()

    # Parse JSON fields
    symptoms = json.loads(patient.get("symptoms", "[]")) if isinstance(patient.get("symptoms"), str) else patient.get("symptoms", [])
    history = json.loads(patient.get("medical_history", "[]")) if isinstance(patient.get("medical_history"), str) else patient.get("medical_history", [])

    # Predict risk
    risk = predict_risk(patient, vitals)

    # Calculate triage severity
    triage = calculate_severity(symptoms, vitals, patient.get("age", 50), history)

    # Store risk history
    store_risk_history(patient_id, risk, triage)

    return {
        "patient_id": patient_id,
        "deterioration_risk": risk["deterioration_risk"],
        "icu_risk": risk["icu_risk"],
        "complication_risk": risk["complication_risk"],
        "risk_level": risk["risk_level"],
        "severity_score": triage["severity_score"],
        "priority_level": triage["priority_level"],
        "monitoring_frequency": risk["monitoring_frequency"],
    }


def store_risk_history(patient_id: str, risk: dict, triage: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO risk_history
        (patient_id, deterioration_risk, icu_risk, complication_risk,
         severity_score, risk_level)
        VALUES (?,?,?,?,?,?)""",
        (patient_id, risk["deterioration_risk"], risk["icu_risk"],
         risk["complication_risk"], triage["severity_score"], risk["risk_level"]))
    conn.commit()
    conn.close()


def get_patient_risk_history(patient_id: str, limit: int = 20) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM risk_history WHERE patient_id=?
        ORDER BY calculated_at DESC LIMIT ?""", (patient_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in reversed(rows)]
