"""
Case Similarity Finder Service
Compares current patient with historical cases.
"""
import json
import numpy as np
from database.db import get_connection


def find_similar_cases(patient: dict, top_n: int = 10) -> dict:
    """Find patients with similar profiles."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE patient_id != ?", (patient.get("patient_id", ""),))
    all_patients = [dict(r) for r in cursor.fetchall()]
    conn.close()

    target_symptoms = set(json.loads(patient.get("symptoms", "[]")) if isinstance(patient.get("symptoms"), str) else patient.get("symptoms", []))
    target_history = set(json.loads(patient.get("medical_history", "[]")) if isinstance(patient.get("medical_history"), str) else patient.get("medical_history", []))
    target_age = patient.get("age", 50)
    target_gender = patient.get("gender", "")

    scored = []
    for p in all_patients:
        p_symptoms = set(json.loads(p.get("symptoms", "[]")) if isinstance(p.get("symptoms"), str) else p.get("symptoms", []))
        p_history = set(json.loads(p.get("medical_history", "[]")) if isinstance(p.get("medical_history"), str) else p.get("medical_history", []))

        # Jaccard similarity for symptoms
        sym_union = target_symptoms | p_symptoms
        sym_inter = target_symptoms & p_symptoms
        sym_sim = len(sym_inter) / len(sym_union) if sym_union else 0

        # Jaccard similarity for history
        hist_union = target_history | p_history
        hist_inter = target_history & p_history
        hist_sim = len(hist_inter) / len(hist_union) if hist_union else 0

        # Age similarity
        age_sim = max(0, 1 - abs(target_age - p.get("age", 50)) / 50)

        # Gender match
        gender_sim = 1.0 if target_gender == p.get("gender", "") else 0.5

        overall = sym_sim * 0.45 + hist_sim * 0.30 + age_sim * 0.15 + gender_sim * 0.10
        if overall > 0.1:
            scored.append({
                "patient_id": p["patient_id"],
                "name": f"{p['first_name']} {p['last_name']}",
                "age": p["age"],
                "gender": p["gender"],
                "status": p["status"],
                "similarity_score": round(overall * 100, 1),
                "common_symptoms": list(sym_inter),
                "common_history": list(hist_inter),
            })

    scored.sort(key=lambda x: x["similarity_score"], reverse=True)

    # Aggregate stats
    similar = scored[:top_n]
    total_similar = len([s for s in scored if s["similarity_score"] > 30])

    # Recovery rate calculation
    discharged = sum(1 for s in scored if s["status"] == "discharged")
    recovery_rate = round(discharged / len(scored) * 100, 1) if scored else 0

    # Common treatments from similar patients
    common_treatments = _get_common_treatments(similar)

    return {
        "similar_cases": similar,
        "total_similar": total_similar,
        "recovery_rate": recovery_rate,
        "common_treatments": common_treatments,
    }


def _get_common_treatments(similar_patients: list) -> list:
    """Extract common treatment approaches from similar cases."""
    conn = get_connection()
    cursor = conn.cursor()
    treatments = {}
    for p in similar_patients:
        cursor.execute("SELECT * FROM treatment_plans WHERE patient_id=?", (p["patient_id"],))
        for tp in cursor.fetchall():
            name = tp["treatment_name"]
            treatments[name] = treatments.get(name, 0) + 1
    conn.close()

    # If no treatment plans exist, return generic info
    if not treatments:
        return ["Medication therapy", "Physical therapy", "Lifestyle modifications"]

    return [t for t, _ in sorted(treatments.items(), key=lambda x: x[1], reverse=True)[:5]]
