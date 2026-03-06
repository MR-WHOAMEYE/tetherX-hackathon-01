"""
Patient Risk Prediction Service
Predicts deterioration, ICU admission, and complication risks.
"""
import json
import random
import numpy as np
from services.ml_engine import ml_registry

def predict_risk(patient: dict, vitals: dict = None) -> dict:
    """Predict clinical risks using XGBoost/LightGBM representations and tabular models."""
    age = patient.get("age", 50)
    symptoms = json.loads(patient.get("symptoms", "[]")) if isinstance(patient.get("symptoms"), str) else patient.get("symptoms", [])
    history = json.loads(patient.get("medical_history", "[]")) if isinstance(patient.get("medical_history"), str) else patient.get("medical_history", [])
    status = patient.get("status", "active")

    # 1. XGBoost/LightGBM Inference 
    xgb_probability = ml_registry.risk_model.predict_proba(patient, vitals)
    shap_factors = ml_registry.risk_model.get_feature_importance(patient, vitals)

    # 2. Hard Clinical Rules (Base Factors)
    age_factor = min(1.0, age / 100)
    high_risk_symptoms = {"Chest pain", "Shortness of breath", "Seizures", "Confusion", "Palpitations"}
    symptom_factor = sum(0.15 if s in high_risk_symptoms else 0.05 for s in symptoms)
    
    high_risk_history = {"Heart Disease", "Stroke", "Cancer", "COPD", "Chronic Kidney Disease"}
    history_factor = sum(0.12 if h in high_risk_history else 0.04 for h in history)
    status_factor = {"critical": 0.30, "monitoring": 0.10, "active": 0.05, "discharged": 0.0}.get(status, 0.05)

    # 3. Hybrid Confidence Scoring (ML Probe + Rules)
    composite_base = (xgb_probability * 0.5) + (symptom_factor + history_factor + status_factor) * 0.5
    
    deterioration_risk = min(0.98, max(0.05, composite_base * 1.3))
    icu_risk = min(0.95, max(0.02, composite_base * 0.9))
    complication_risk = min(0.92, max(0.03, composite_base * 1.1))

    # Determine monitoring frequency based on ML probabilities
    max_risk = max(deterioration_risk, icu_risk, complication_risk)
    if max_risk > 0.7:
        monitoring = "Every 15 minutes"
    elif max_risk > 0.5:
        monitoring = "Every 30 minutes"
    elif max_risk > 0.3:
        monitoring = "Every 1 hour"
    else:
        monitoring = "Every 4 hours"

    # Merge SHAP (explainability) with clinical reasons
    explainability_factors = set(shap_factors)
    if age > 70: explainability_factors.add("Advanced age increases complication risk")
    if len(symptoms) > 3: explainability_factors.add("Multiple concurrent symptoms")
    if len(history) > 2 and "None" not in history: explainability_factors.add("Complex medical history")

    return {
        "deterioration_risk": round(deterioration_risk * 100, 1),
        "icu_risk": round(icu_risk * 100, 1),
        "complication_risk": round(complication_risk * 100, 1),
        "monitoring_frequency": monitoring,
        "risk_factors": list(explainability_factors),
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
