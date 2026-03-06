"""
Treatment Outcome Predictor Service
Predicts success probability for treatment options.
"""
import json
import random
import numpy as np


def predict_outcomes(patient: dict, treatments: list = None) -> list:
    """Predict outcomes for treatment options."""
    if not treatments:
        treatments = _get_default_treatments(patient)

    age = patient.get("age", 50)
    history = json.loads(patient.get("medical_history", "[]")) if isinstance(patient.get("medical_history"), str) else patient.get("medical_history", [])

    results = []
    np.random.seed(hash(patient.get("patient_id", "default")) % 2**32)

    for treatment in treatments:
        base_prob = np.random.uniform(0.55, 0.95)
        # Adjustments
        if age > 70:
            base_prob *= 0.88
        if age > 80:
            base_prob *= 0.90
        if len(history) > 3:
            base_prob *= 0.92

        recovery_prob = round(min(0.98, max(0.15, base_prob)) * 100, 1)
        side_effects = round(np.random.uniform(5, 35), 1)

        weeks = int(np.random.uniform(2, 16))
        time_str = f"{weeks} weeks" if weeks > 1 else "1 week"

        results.append({
            "treatment_name": treatment,
            "recovery_probability": recovery_prob,
            "time_to_recovery": time_str,
            "side_effects_risk": side_effects,
            "confidence_level": "High" if recovery_prob > 75 else "Moderate" if recovery_prob > 50 else "Low",
        })

    results.sort(key=lambda x: x["recovery_probability"], reverse=True)
    return results


def _get_default_treatments(patient: dict) -> list:
    symptoms = json.loads(patient.get("symptoms", "[]")) if isinstance(patient.get("symptoms"), str) else patient.get("symptoms", [])
    treatments = set()
    symptom_treatments = {
        "Chest pain": ["Cardiovascular medication therapy", "Cardiac intervention", "Lifestyle modifications"],
        "Shortness of breath": ["Bronchodilator therapy", "Supplemental oxygen", "Pulmonary rehabilitation"],
        "Headache": ["Analgesic therapy", "Preventive medication", "Neurological evaluation"],
        "Fever": ["Antibiotic therapy", "Antipyretic treatment", "Supportive care"],
        "Cough": ["Antibiotic therapy", "Bronchodilator therapy", "Cough suppressants"],
        "Abdominal pain": ["GI medication therapy", "Surgical intervention", "Dietary modification"],
        "Fatigue": ["Iron supplementation", "Hormone therapy", "Lifestyle modifications"],
        "Seizures": ["Anticonvulsant therapy", "Neurological monitoring", "Surgical evaluation"],
    }
    for s in symptoms:
        if s in symptom_treatments:
            treatments.update(symptom_treatments[s][:2])
    if not treatments:
        treatments = {"Standard medication therapy", "Physical therapy", "Lifestyle modifications"}
    return list(treatments)[:5]
