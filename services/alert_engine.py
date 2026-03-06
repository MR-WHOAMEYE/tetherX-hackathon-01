"""
Real-Time Alert Engine
Triggers alerts when patient vitals or risk scores exceed thresholds.
"""
from database.db import get_connection
from datetime import datetime

# Thresholds
THRESHOLDS = {
    "oxygen_level": {"critical": 90, "warning": 94, "direction": "below"},
    "heart_rate_high": {"critical": 130, "warning": 110, "direction": "above"},
    "heart_rate_low": {"critical": 45, "warning": 50, "direction": "below"},
    "blood_pressure_sys_high": {"critical": 180, "warning": 160, "direction": "above"},
    "blood_pressure_sys_low": {"critical": 80, "warning": 90, "direction": "below"},
    "temperature_high": {"critical": 103.0, "warning": 100.4, "direction": "above"},
    "respiratory_rate": {"critical": 28, "warning": 24, "direction": "above"},
}


def check_vitals_alerts(patient_id: str, patient_name: str, vitals: dict) -> list:
    """Check vitals against thresholds and generate alerts."""
    alerts = []
    checks = [
        ("oxygen_level", vitals.get("oxygen_level", 98), "O₂ Level"),
        ("heart_rate_high", vitals.get("heart_rate", 72), "Heart Rate"),
        ("heart_rate_low", vitals.get("heart_rate", 72), "Heart Rate"),
        ("blood_pressure_sys_high", vitals.get("blood_pressure_sys", 120), "Blood Pressure"),
        ("blood_pressure_sys_low", vitals.get("blood_pressure_sys", 120), "Blood Pressure"),
        ("temperature_high", vitals.get("temperature", 98.6), "Temperature"),
        ("respiratory_rate", vitals.get("respiratory_rate", 16), "Respiratory Rate"),
    ]

    for key, value, label in checks:
        thresh = THRESHOLDS[key]
        severity = None
        if thresh["direction"] == "below":
            if value < thresh["critical"]:
                severity = "critical"
            elif value < thresh["warning"]:
                severity = "warning"
        else:
            if value > thresh["critical"]:
                severity = "critical"
            elif value > thresh["warning"]:
                severity = "warning"

        if severity:
            alert = create_alert(
                alert_type="vitals",
                severity=severity,
                title=f"{label} {'Critical' if severity == 'critical' else 'Warning'}",
                message=f"Patient {patient_name} ({patient_id}): {label} is {value}",
                patient_id=patient_id,
                patient_name=patient_name,
                threshold_value=str(thresh[severity]),
                actual_value=str(value)
            )
            alerts.append(alert)
    return alerts


def check_risk_alert(patient_id: str, patient_name: str, risk_score: float) -> dict | None:
    """Generate alert if risk score exceeds limit."""
    if risk_score >= 70:
        return create_alert("risk", "critical",
            f"High Deterioration Risk",
            f"Patient {patient_name}: Deterioration risk at {risk_score}%",
            patient_id, patient_name, "70", str(risk_score))
    elif risk_score >= 50:
        return create_alert("risk", "warning",
            f"Elevated Deterioration Risk",
            f"Patient {patient_name}: Deterioration risk at {risk_score}%",
            patient_id, patient_name, "50", str(risk_score))
    return None


def create_alert(alert_type, severity, title, message,
                 patient_id=None, patient_name=None,
                 threshold_value=None, actual_value=None) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO alerts
        (alert_type, severity, title, message, patient_id, patient_name,
         threshold_value, actual_value)
        VALUES (?,?,?,?,?,?,?,?)""",
        (alert_type, severity, title, message, patient_id, patient_name,
         threshold_value, actual_value))
    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()
    return {
        "id": alert_id, "alert_type": alert_type, "severity": severity,
        "title": title, "message": message, "patient_id": patient_id,
        "patient_name": patient_name, "threshold_value": threshold_value,
        "actual_value": actual_value, "acknowledged": 0,
        "created_at": datetime.now().isoformat()
    }


def get_recent_alerts(limit: int = 30, unacknowledged_only: bool = False) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM alerts"
    if unacknowledged_only:
        query += " WHERE acknowledged=0"
    query += " ORDER BY created_at DESC LIMIT ?"
    cursor.execute(query, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def acknowledge_alert(alert_id: int, staff_name: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET acknowledged=1, acknowledged_by=? WHERE id=?",
                   (staff_name, alert_id))
    conn.commit()
    conn.close()


def get_alert_counts() -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT severity, COUNT(*) as count FROM alerts WHERE acknowledged=0 GROUP BY severity")
    rows = cursor.fetchall()
    conn.close()
    return {r["severity"]: r["count"] for r in rows}
