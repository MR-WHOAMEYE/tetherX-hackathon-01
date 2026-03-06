"""
Intelligent Triage System — Severity scoring and patient prioritization.
"""
import json

SYMPTOM_SEVERITY = {
    "Chest pain": 25, "Shortness of breath": 22, "Seizures": 24, "Confusion": 20,
    "Palpitations": 15, "Numbness": 12, "Blurred vision": 14, "Swelling": 10,
    "Fever": 12, "Cough": 8, "Headache": 10, "Dizziness": 13, "Nausea": 7,
    "Fatigue": 5, "Abdominal pain": 12, "Back pain": 8, "Joint pain": 6,
    "Weight loss": 9,
}

HISTORY_RISK = {
    "Heart Disease": 12, "Stroke": 14, "Cancer": 15, "COPD": 10,
    "Diabetes Type 2": 8, "Hypertension": 7, "Chronic Kidney Disease": 10,
    "Epilepsy": 9, "HIV": 8, "Hepatitis": 7, "Asthma": 5,
    "Depression": 3, "Anxiety": 2, "Migraine": 3, "Arthritis": 2,
}


def calculate_severity(symptoms: list, vitals: dict = None, age: int = 50, medical_history: list = None) -> dict:
    score = 0
    risk_factors = []

    # Symptom scoring
    for s in symptoms:
        if s in SYMPTOM_SEVERITY:
            score += SYMPTOM_SEVERITY[s]
            if SYMPTOM_SEVERITY[s] >= 15:
                risk_factors.append(f"High-severity symptom: {s}")

    # Vital signs scoring
    if vitals:
        bp_sys = vitals.get("blood_pressure_sys", 120)
        bp_dia = vitals.get("blood_pressure_dia", 80)
        hr = vitals.get("heart_rate", 72)
        o2 = vitals.get("oxygen_level", 98.0)
        temp = vitals.get("temperature", 98.6)
        rr = vitals.get("respiratory_rate", 16)

        if o2 < 90:
            score += 25
            risk_factors.append(f"Critical O2: {o2}%")
        elif o2 < 94:
            score += 15
            risk_factors.append(f"Low O2: {o2}%")

        if bp_sys > 180 or bp_sys < 80:
            score += 20
            risk_factors.append(f"Abnormal BP: {bp_sys}/{bp_dia}")
        elif bp_sys > 160 or bp_sys < 90:
            score += 10

        if hr > 130 or hr < 45:
            score += 18
            risk_factors.append(f"Critical HR: {hr} bpm")
        elif hr > 110 or hr < 50:
            score += 10

        if temp > 103.0:
            score += 15
            risk_factors.append(f"High fever: {temp}°F")
        elif temp > 100.4:
            score += 8

        if rr > 24:
            score += 12
            risk_factors.append(f"Tachypnea: {rr}/min")
        elif rr > 20:
            score += 5

    # Age scoring
    if age > 75:
        score += 12
        risk_factors.append(f"Advanced age: {age}")
    elif age > 65:
        score += 8
    elif age < 5:
        score += 10
        risk_factors.append(f"Pediatric patient: age {age}")

    # Medical history scoring
    if medical_history:
        for h in medical_history:
            if h in HISTORY_RISK:
                score += HISTORY_RISK[h]
                if HISTORY_RISK[h] >= 10:
                    risk_factors.append(f"Significant history: {h}")

    # Normalize to 0-100
    score = min(100, score)

    # Determine priority
    if score >= 75:
        priority = "Critical"
        action = "Immediate doctor consultation. Prepare for emergency intervention."
        color = "#DC2626"
    elif score >= 50:
        priority = "High"
        action = "Urgent evaluation required. Assign to available physician within 15 minutes."
        color = "#EA580C"
    elif score >= 25:
        priority = "Medium"
        action = "Standard evaluation. Patient should be seen within 1 hour."
        color = "#CA8A04"
    else:
        priority = "Low"
        action = "Routine assessment. Patient can wait in standard queue."
        color = "#16A34A"

    return {
        "severity_score": score,
        "priority_level": priority,
        "suggested_action": action,
        "risk_factors": risk_factors,
        "color": color,
    }


def triage_all_patients(patients: list) -> list:
    """Score and rank all patients by severity."""
    results = []
    for p in patients:
        symptoms = json.loads(p.get("symptoms", "[]")) if isinstance(p.get("symptoms"), str) else p.get("symptoms", [])
        history = json.loads(p.get("medical_history", "[]")) if isinstance(p.get("medical_history"), str) else p.get("medical_history", [])
        triage = calculate_severity(symptoms, age=p.get("age", 50), medical_history=history)
        results.append({**p, **triage})
    results.sort(key=lambda x: x["severity_score"], reverse=True)
    return results
