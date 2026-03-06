"""
Alert Engine Service
Monitors vitals and risk scores, generates real-time alerts when thresholds are exceeded.
"""
import json
from datetime import datetime
from database.db import get_connection


# Threshold configurations
THRESHOLDS = {
    "oxygen_level": {"min": 90, "severity": "critical", "label": "Oxygen Level"},
    "heart_rate_high": {"max": 120, "severity": "critical", "label": "Heart Rate (High)"},
    "heart_rate_low": {"min": 50, "severity": "warning", "label": "Heart Rate (Low)"},
    "blood_pressure_sys_high": {"max": 180, "severity": "critical", "label": "Systolic BP (High)"},
    "blood_pressure_sys_low": {"min": 80, "severity": "warning", "label": "Systolic BP (Low)"},
    "temperature_high": {"max": 103, "severity": "critical", "label": "Temperature (High)"},
    "respiratory_rate_high": {"max": 30, "severity": "warning", "label": "Respiratory Rate (High)"},
    "respiratory_rate_low": {"min": 8, "severity": "warning", "label": "Respiratory Rate (Low)"},
}

RISK_THRESHOLD = 70


def check_vitals_thresholds(patient_id, vitals):
    """Check vitals against thresholds and generate alerts."""
    alerts = []

    checks = [
        ("oxygen_level", vitals.get("oxygen_level"), "min"),
        ("heart_rate_high", vitals.get("heart_rate"), "max"),
        ("heart_rate_low", vitals.get("heart_rate"), "min"),
        ("blood_pressure_sys_high", vitals.get("blood_pressure_sys"), "max"),
        ("blood_pressure_sys_low", vitals.get("blood_pressure_sys"), "min"),
        ("temperature_high", vitals.get("temperature"), "max"),
        ("respiratory_rate_high", vitals.get("respiratory_rate"), "max"),
        ("respiratory_rate_low", vitals.get("respiratory_rate"), "min"),
    ]

    for key, value, check_type in checks:
        if value is None:
            continue
        threshold = THRESHOLDS[key]
        triggered = False
        threshold_val = 0

        if check_type == "min" and "min" in threshold:
            threshold_val = threshold["min"]
            triggered = value < threshold_val
        elif check_type == "max" and "max" in threshold:
            threshold_val = threshold["max"]
            triggered = value > threshold_val

        if triggered:
            alert = create_alert(
                patient_id=patient_id,
                alert_type="vitals_threshold",
                severity=threshold["severity"],
                title=f"{threshold['label']} Alert",
                description=f"Patient {patient_id}: {threshold['label']} is {value} (threshold: {threshold_val})",
                threshold_value=threshold_val,
                actual_value=value
            )
            alerts.append(alert)

    return alerts


def check_risk_threshold(patient_id, risk_score):
    """Check if risk score exceeds threshold."""
    if risk_score >= RISK_THRESHOLD:
        severity = "emergency" if risk_score >= 85 else "critical"
        return create_alert(
            patient_id=patient_id,
            alert_type="risk_threshold",
            severity=severity,
            title="High Deterioration Risk",
            description=f"Patient {patient_id}: Risk score {risk_score}% exceeds threshold",
            threshold_value=RISK_THRESHOLD,
            actual_value=risk_score
        )
    return None


def create_alert(patient_id, alert_type, severity, title, description="", threshold_value=None, actual_value=None):
    """Create a new alert in the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO alerts (patient_id, alert_type, severity, title, description, threshold_value, actual_value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (patient_id, alert_type, severity, title, description, threshold_value, actual_value))
    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()
    return {
        "id": alert_id,
        "patient_id": patient_id,
        "alert_type": alert_type,
        "severity": severity,
        "title": title,
        "description": description,
        "threshold_value": threshold_value,
        "actual_value": actual_value,
        "status": "active",
        "created_at": datetime.now().isoformat()
    }


def get_active_alerts(limit=50):
    """Get all active alerts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM alerts WHERE status = 'active' ORDER BY
        CASE severity WHEN 'emergency' THEN 1 WHEN 'critical' THEN 2 WHEN 'warning' THEN 3 END,
        created_at DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def acknowledge_alert(alert_id, acknowledged_by="System"):
    """Acknowledge an alert."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE alerts SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = ?
        WHERE id = ?
    """, (acknowledged_by, datetime.now().isoformat(), alert_id))
    conn.commit()
    conn.close()
    return {"id": alert_id, "status": "acknowledged"}


def get_alert_stats():
    """Get alert statistics."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT severity, COUNT(*) as count FROM alerts WHERE status = 'active' GROUP BY severity")
    rows = cursor.fetchall()
    conn.close()
    stats = {"warning": 0, "critical": 0, "emergency": 0, "total": 0}
    for r in rows:
        stats[r["severity"]] = r["count"]
        stats["total"] += r["count"]
    return stats
