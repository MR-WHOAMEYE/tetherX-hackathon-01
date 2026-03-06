"""
Patient Risk Prediction Service
Predicts deterioration, ICU admission, and complication risks.
"""
import json
import random
import numpy as np


def predict_risk(patient: dict, vitals: dict = None) -> dict:
    """Predict clinical risks for a patient."""
    age = patient.get("age", 50)
    symptoms = json.loads(patient.get("symptoms", "[]")) if isinstance(patient.get("symptoms"), str) else patient.get("symptoms", [])
    history = json.loads(patient.get("medical_history", "[]")) if isinstance(patient.get("medical_history"), str) else patient.get("medical_history", [])
    status = patient.get("status", "active")

    # Base risk from age
    age_factor = min(1.0, age / 100)

    # Symptom severity factor
    high_risk_symptoms = {"Chest pain", "Shortness of breath", "Seizures", "Confusion", "Palpitations"}
    symptom_factor = sum(0.15 if s in high_risk_symptoms else 0.05 for s in symptoms)

    # History factor
    high_risk_history = {"Heart Disease", "Stroke", "Cancer", "COPD", "Chronic Kidney Disease"}
    history_factor = sum(0.12 if h in high_risk_history else 0.04 for h in history)

    # Vital signs factor
    vitals_factor = 0
    risk_factors = []
    if vitals:
        o2 = vitals.get("oxygen_level", 98)
        hr = vitals.get("heart_rate", 72)
        bp_sys = vitals.get("blood_pressure_sys", 120)
        temp = vitals.get("temperature", 98.6)

        if o2 < 92:
            vitals_factor += 0.25
            risk_factors.append("Hypoxemia detected")
        if hr > 120 or hr < 50:
            vitals_factor += 0.15
            risk_factors.append("Abnormal heart rate")
        if bp_sys > 170 or bp_sys < 85:
            vitals_factor += 0.15
            risk_factors.append("Blood pressure instability")
        if temp > 102:
            vitals_factor += 0.10
            risk_factors.append("Significant fever")

    # Status factor
    status_factor = {"critical": 0.30, "monitoring": 0.10, "active": 0.05, "discharged": 0.0}.get(status, 0.05)

    # Calculate composite risks
    base = age_factor * 0.15 + symptom_factor + history_factor + vitals_factor + status_factor

    deterioration_risk = min(0.95, max(0.05, base * 1.2 + random.uniform(-0.05, 0.05)))
    icu_risk = min(0.90, max(0.02, base * 0.85 + random.uniform(-0.05, 0.05)))
    complication_risk = min(0.92, max(0.03, base * 1.0 + random.uniform(-0.05, 0.05)))

    # Monitoring frequency
    max_risk = max(deterioration_risk, icu_risk, complication_risk)
    if max_risk > 0.7:
        monitoring = "Every 15 minutes"
    elif max_risk > 0.5:
        monitoring = "Every 30 minutes"
    elif max_risk > 0.3:
        monitoring = "Every 1 hour"
    else:
        monitoring = "Every 4 hours"

    # Additional risk factors
    if age > 70:
        risk_factors.append("Advanced age increases complication risk")
    if len(symptoms) > 3:
        risk_factors.append("Multiple concurrent symptoms")
    if len(history) > 2 and "None" not in history:
        risk_factors.append("Complex medical history")

    return {
        "deterioration_risk": round(deterioration_risk * 100, 1),
        "icu_risk": round(icu_risk * 100, 1),
        "complication_risk": round(complication_risk * 100, 1),
        "monitoring_frequency": monitoring,
        "risk_factors": risk_factors,
        "risk_level": "Critical" if max_risk > 0.7 else "High" if max_risk > 0.5 else "Moderate" if max_risk > 0.3 else "Low",
        "risk_color": "#DC2626" if max_risk > 0.7 else "#EA580C" if max_risk > 0.5 else "#CA8A04" if max_risk > 0.3 else "#16A34A",
    }


def get_risk_trend(patient_id: str, days: int = 7) -> list:
    """Generate risk trend data for a patient over time."""
    np.random.seed(hash(patient_id) % 2**32)
    base = np.random.uniform(20, 70)
    trend = []
    for i in range(days):
        val = base + np.random.normal(0, 5) + np.sin(i / 2) * 3
        trend.append({"day": f"Day {i+1}", "risk": round(min(100, max(0, val)), 1)})
        base += np.random.uniform(-2, 2)
    return trend
