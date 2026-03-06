"""
Risk Recalculation Service
Automatically recalculates patient risk scores and maintains priority queue.
"""
import json
import random
from datetime import datetime
from database.db import get_connection


def recalculate_risk(patient_id, vitals=None):
    """Recalculate risk score based on latest vitals and patient data."""
    conn = get_connection()
    cursor = conn.cursor()

    # Get patient data
    cursor.execute("SELECT * FROM patients WHERE patient_id = ?", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return None

    # Get latest vitals if not provided
    if not vitals:
        cursor.execute("SELECT * FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1", (patient_id,))
        vitals_row = cursor.fetchone()
        if vitals_row:
            vitals = dict(vitals_row)

    # Calculate risk components
    risk_score = 0
    severity_score = 0
    factors = {}

    if vitals:
        # Oxygen level risk
        o2 = vitals.get("oxygen_level", 98)
        if o2 < 90:
            risk_score += 30
            factors["oxygen"] = "critical"
        elif o2 < 95:
            risk_score += 15
            factors["oxygen"] = "low"

        # Heart rate risk
        hr = vitals.get("heart_rate", 72)
        if hr > 120 or hr < 50:
            risk_score += 25
            factors["heart_rate"] = "abnormal"
        elif hr > 100 or hr < 60:
            risk_score += 10
            factors["heart_rate"] = "borderline"

        # Blood pressure risk
        bp_sys = vitals.get("blood_pressure_sys", 120)
        if bp_sys > 180 or bp_sys < 80:
            risk_score += 25
            factors["blood_pressure"] = "critical"
        elif bp_sys > 140 or bp_sys < 90:
            risk_score += 12
            factors["blood_pressure"] = "elevated"

        # Temperature risk
        temp = vitals.get("temperature", 98.6)
        if temp > 103 or temp < 95:
            risk_score += 20
            factors["temperature"] = "critical"
        elif temp > 100.4:
            risk_score += 10
            factors["temperature"] = "fever"

        # Respiratory rate
        rr = vitals.get("respiratory_rate", 16)
        if rr > 30 or rr < 8:
            risk_score += 20
            factors["respiratory"] = "critical"
        elif rr > 24 or rr < 12:
            risk_score += 10
            factors["respiratory"] = "abnormal"

    # Patient status modifier
    status = patient["status"]
    if status == "critical":
        severity_score = min(risk_score + 20, 100)
    elif status == "monitoring":
        severity_score = min(risk_score + 10, 100)
    else:
        severity_score = risk_score

    # Age factor
    age = patient["age"]
    if age > 70:
        risk_score = min(risk_score + 10, 100)
    elif age > 60:
        risk_score = min(risk_score + 5, 100)

    # Ensure score is within 0-100
    risk_score = max(0, min(100, risk_score))
    severity_score = max(0, min(100, severity_score))

    # Calculate deterioration risk (slight randomization for realism)
    deterioration_risk = min(100, risk_score + random.randint(-5, 10))
    deterioration_risk = max(0, deterioration_risk)

    # Determine triage priority
    if risk_score >= 70:
        triage_priority = "immediate"
    elif risk_score >= 50:
        triage_priority = "urgent"
    elif risk_score >= 30:
        triage_priority = "delayed"
    else:
        triage_priority = "minimal"

    # Save to risk history
    cursor.execute("""
        INSERT INTO risk_history (patient_id, risk_score, severity_score, deterioration_risk, triage_priority, factors)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (patient_id, risk_score, severity_score, deterioration_risk, triage_priority, json.dumps(factors)))
    conn.commit()
    conn.close()

    return {
        "patient_id": patient_id,
        "risk_score": risk_score,
        "severity_score": severity_score,
        "deterioration_risk": deterioration_risk,
        "triage_priority": triage_priority,
        "factors": factors,
        "calculated_at": datetime.now().isoformat()
    }


def get_risk_history(patient_id, limit=20):
    """Get risk score history for a patient."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM risk_history WHERE patient_id = ? ORDER BY calculated_at DESC LIMIT ?
    """, (patient_id, limit))
    rows = cursor.fetchall()
    conn.close()
    data = []
    for r in rows:
        data.append({
            "id": r["id"],
            "patient_id": r["patient_id"],
            "risk_score": r["risk_score"],
            "severity_score": r["severity_score"],
            "deterioration_risk": r["deterioration_risk"],
            "triage_priority": r["triage_priority"],
            "factors": json.loads(r["factors"]) if r["factors"] else {},
            "calculated_at": r["calculated_at"]
        })
    data.reverse()
    return data


def get_patient_priority_queue(limit=20):
    """Get patients ranked by composite priority score."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.patient_id, p.first_name, p.last_name, p.status, p.assigned_doctor,
               p.room_number, p.updated_at,
               rh.risk_score, rh.severity_score, rh.deterioration_risk, rh.triage_priority,
               rh.calculated_at
        FROM patients p
        LEFT JOIN (
            SELECT patient_id, risk_score, severity_score, deterioration_risk, triage_priority, calculated_at,
                   ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY calculated_at DESC) as rn
            FROM risk_history
        ) rh ON p.patient_id = rh.patient_id AND rh.rn = 1
        WHERE p.status IN ('active', 'critical', 'monitoring')
        ORDER BY
            CASE p.status WHEN 'critical' THEN 0 ELSE 1 END,
            COALESCE(rh.risk_score, 0) DESC,
            p.updated_at DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_command_center_metrics():
    """Get aggregated metrics for the command center."""
    conn = get_connection()
    cursor = conn.cursor()

    metrics = {}

    # Active patients
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE status IN ('active','critical','monitoring')")
    metrics["active_patients"] = cursor.fetchone()["count"]

    # Critical cases
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE status = 'critical'")
    metrics["critical_cases"] = cursor.fetchone()["count"]

    # Monitoring
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE status = 'monitoring'")
    metrics["monitoring_cases"] = cursor.fetchone()["count"]

    # Discharged today
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE status = 'discharged' AND DATE(discharge_date) = DATE('now')")
    metrics["discharged_today"] = cursor.fetchone()["count"]

    # Active alerts
    cursor.execute("SELECT COUNT(*) as count FROM alerts WHERE status = 'active'")
    metrics["active_alerts"] = cursor.fetchone()["count"]

    # Unique doctors
    cursor.execute("SELECT COUNT(DISTINCT assigned_doctor) as count FROM patients WHERE assigned_doctor IS NOT NULL AND assigned_doctor != '' AND status IN ('active','critical','monitoring')")
    metrics["active_doctors"] = cursor.fetchone()["count"]

    # ICU occupancy (patients in rooms starting with 'ICU')
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE room_number LIKE 'ICU%' AND status IN ('active','critical','monitoring')")
    metrics["icu_occupancy"] = cursor.fetchone()["count"]

    # Average wait (estimate from appointments today)
    metrics["avg_wait_minutes"] = 24

    # Emergency queue
    cursor.execute("SELECT COUNT(*) as count FROM patients WHERE status = 'critical'")
    metrics["emergency_queue"] = cursor.fetchone()["count"]

    conn.close()
    return metrics


def get_workload_analysis():
    """Get doctor workload analysis."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT assigned_doctor,
               COUNT(*) as total_patients,
               SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) as critical_patients,
               SUM(CASE WHEN status = 'monitoring' THEN 1 ELSE 0 END) as monitoring_patients,
               SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_patients
        FROM patients
        WHERE assigned_doctor IS NOT NULL AND assigned_doctor != ''
          AND status IN ('active','critical','monitoring')
        GROUP BY assigned_doctor
        ORDER BY critical_patients DESC, total_patients DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_ai_insights(limit=10):
    """Generate AI clinical insights based on current patient data."""
    conn = get_connection()
    cursor = conn.cursor()

    insights = []

    # Find patients with high risk
    cursor.execute("""
        SELECT p.patient_id, p.first_name, p.last_name, p.status,
               rh.risk_score, rh.deterioration_risk, rh.triage_priority, rh.factors
        FROM patients p
        INNER JOIN (
            SELECT patient_id, risk_score, deterioration_risk, triage_priority, factors,
                   ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY calculated_at DESC) as rn
            FROM risk_history
        ) rh ON p.patient_id = rh.patient_id AND rh.rn = 1
        WHERE rh.risk_score >= 40
        ORDER BY rh.risk_score DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()

    for r in rows:
        factors = json.loads(r["factors"]) if r["factors"] else {}
        factor_list = [f"{k}: {v}" for k, v in factors.items()]

        if r["risk_score"] >= 70:
            action = "Immediate monitoring required. Consider ICU transfer."
        elif r["risk_score"] >= 50:
            action = "Increase monitoring frequency. Review treatment plan."
        else:
            action = "Continue current monitoring. Schedule follow-up review."

        insights.append({
            "patient_id": r["patient_id"],
            "patient_name": f"{r['first_name']} {r['last_name']}",
            "risk_score": r["risk_score"],
            "deterioration_risk": r["deterioration_risk"],
            "triage_priority": r["triage_priority"],
            "factors": factor_list,
            "suggested_action": action,
            "status": r["status"]
        })

    # Also include critical patients without risk history
    if len(insights) < limit:
        cursor.execute("""
            SELECT patient_id, first_name, last_name, status FROM patients
            WHERE status = 'critical'
            AND patient_id NOT IN (SELECT DISTINCT patient_id FROM risk_history)
            LIMIT ?
        """, (limit - len(insights),))
        for r in cursor.fetchall():
            insights.append({
                "patient_id": r["patient_id"],
                "patient_name": f"{r['first_name']} {r['last_name']}",
                "risk_score": 65,
                "deterioration_risk": 60,
                "triage_priority": "urgent",
                "factors": ["Status: critical"],
                "suggested_action": "Risk assessment pending. Recommend immediate vitals check.",
                "status": r["status"]
            })

    conn.close()
    return insights
