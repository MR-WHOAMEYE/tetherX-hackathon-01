"""
AI Clinical Copilot Service
Rule-based diagnosis suggestion engine.
"""
import json
import random

# Knowledge base: symptom -> condition mappings with confidence
CONDITION_DB = {
    "Chest pain": [
        {"condition": "Acute Coronary Syndrome", "confidence": 0.75, "tests": ["Troponin", "ECG", "Chest X-ray"], "specialist": "Cardiologist"},
        {"condition": "Costochondritis", "confidence": 0.40, "tests": ["Physical Exam"], "specialist": ""},
        {"condition": "Pulmonary Embolism", "confidence": 0.55, "tests": ["D-Dimer", "CT Pulmonary Angiography"], "specialist": "Pulmonologist"},
        {"condition": "GERD", "confidence": 0.35, "tests": ["Endoscopy", "pH Monitoring"], "specialist": "Gastroenterologist"},
    ],
    "Shortness of breath": [
        {"condition": "Pneumonia", "confidence": 0.65, "tests": ["Chest X-ray", "CBC", "Sputum Culture"], "specialist": "Pulmonologist"},
        {"condition": "Heart Failure", "confidence": 0.60, "tests": ["BNP", "Echocardiogram", "Chest X-ray"], "specialist": "Cardiologist"},
        {"condition": "Asthma Exacerbation", "confidence": 0.55, "tests": ["Spirometry", "Peak Flow"], "specialist": "Pulmonologist"},
        {"condition": "COPD Exacerbation", "confidence": 0.50, "tests": ["ABG", "Chest X-ray", "Spirometry"], "specialist": "Pulmonologist"},
    ],
    "Headache": [
        {"condition": "Migraine", "confidence": 0.70, "tests": ["Neurological Exam"], "specialist": "Neurologist"},
        {"condition": "Tension Headache", "confidence": 0.65, "tests": ["Physical Exam"], "specialist": ""},
        {"condition": "Intracranial Hemorrhage", "confidence": 0.30, "tests": ["CT Head", "MRI Brain"], "specialist": "Neurologist"},
        {"condition": "Meningitis", "confidence": 0.25, "tests": ["Lumbar Puncture", "Blood Culture", "CT Head"], "specialist": "Infectious Disease"},
    ],
    "Dizziness": [
        {"condition": "Benign Positional Vertigo", "confidence": 0.60, "tests": ["Dix-Hallpike Test"], "specialist": "ENT"},
        {"condition": "Orthostatic Hypotension", "confidence": 0.50, "tests": ["Orthostatic Vitals", "CBC"], "specialist": ""},
        {"condition": "Vestibular Neuritis", "confidence": 0.40, "tests": ["MRI Brain", "Audiometry"], "specialist": "ENT"},
        {"condition": "Stroke", "confidence": 0.35, "tests": ["CT Head", "MRI Brain", "CT Angiography"], "specialist": "Neurologist"},
    ],
    "Nausea": [
        {"condition": "Gastroenteritis", "confidence": 0.65, "tests": ["Stool Culture", "CBC"], "specialist": "Gastroenterologist"},
        {"condition": "Gastroparesis", "confidence": 0.40, "tests": ["Gastric Emptying Study"], "specialist": "Gastroenterologist"},
        {"condition": "Appendicitis", "confidence": 0.35, "tests": ["CT Abdomen", "CBC", "Urinalysis"], "specialist": "Surgeon"},
    ],
    "Fatigue": [
        {"condition": "Anemia", "confidence": 0.60, "tests": ["CBC", "Iron Studies", "Reticulocyte Count"], "specialist": "Hematologist"},
        {"condition": "Hypothyroidism", "confidence": 0.55, "tests": ["TSH", "Free T4"], "specialist": "Endocrinologist"},
        {"condition": "Depression", "confidence": 0.45, "tests": ["PHQ-9 Screening"], "specialist": "Psychiatrist"},
        {"condition": "Diabetes", "confidence": 0.40, "tests": ["Fasting Glucose", "HbA1c"], "specialist": "Endocrinologist"},
    ],
    "Fever": [
        {"condition": "Upper Respiratory Infection", "confidence": 0.70, "tests": ["Rapid Strep", "Monospot"], "specialist": ""},
        {"condition": "Urinary Tract Infection", "confidence": 0.55, "tests": ["Urinalysis", "Urine Culture"], "specialist": ""},
        {"condition": "Pneumonia", "confidence": 0.50, "tests": ["Chest X-ray", "CBC", "Blood Culture"], "specialist": "Pulmonologist"},
        {"condition": "Sepsis", "confidence": 0.30, "tests": ["Blood Culture", "Lactate", "CBC", "CRP"], "specialist": "Intensivist"},
    ],
    "Cough": [
        {"condition": "Bronchitis", "confidence": 0.65, "tests": ["Chest X-ray"], "specialist": ""},
        {"condition": "Pneumonia", "confidence": 0.55, "tests": ["Chest X-ray", "CBC", "Sputum Culture"], "specialist": "Pulmonologist"},
        {"condition": "Tuberculosis", "confidence": 0.30, "tests": ["TB Skin Test", "Chest X-ray", "Sputum AFB"], "specialist": "Infectious Disease"},
        {"condition": "Lung Cancer", "confidence": 0.15, "tests": ["CT Chest", "Bronchoscopy"], "specialist": "Oncologist"},
    ],
    "Abdominal pain": [
        {"condition": "Appendicitis", "confidence": 0.55, "tests": ["CT Abdomen", "CBC", "Urinalysis"], "specialist": "Surgeon"},
        {"condition": "Cholecystitis", "confidence": 0.50, "tests": ["RUQ Ultrasound", "LFTs", "CBC"], "specialist": "Surgeon"},
        {"condition": "Peptic Ulcer Disease", "confidence": 0.45, "tests": ["H. pylori Test", "Endoscopy"], "specialist": "Gastroenterologist"},
        {"condition": "Pancreatitis", "confidence": 0.40, "tests": ["Lipase", "Amylase", "CT Abdomen"], "specialist": "Gastroenterologist"},
    ],
    "Back pain": [
        {"condition": "Lumbar Strain", "confidence": 0.70, "tests": ["Physical Exam", "X-ray Spine"], "specialist": ""},
        {"condition": "Herniated Disc", "confidence": 0.50, "tests": ["MRI Spine", "EMG"], "specialist": "Orthopedist"},
        {"condition": "Spinal Stenosis", "confidence": 0.35, "tests": ["MRI Spine", "CT Myelography"], "specialist": "Orthopedist"},
        {"condition": "Kidney Stones", "confidence": 0.30, "tests": ["CT Abdomen", "Urinalysis", "BMP"], "specialist": "Urologist"},
    ],
    "Joint pain": [
        {"condition": "Osteoarthritis", "confidence": 0.65, "tests": ["X-ray", "ESR", "CRP"], "specialist": "Rheumatologist"},
        {"condition": "Rheumatoid Arthritis", "confidence": 0.50, "tests": ["RF", "Anti-CCP", "ESR", "CRP"], "specialist": "Rheumatologist"},
        {"condition": "Gout", "confidence": 0.45, "tests": ["Uric Acid", "Joint Aspiration"], "specialist": "Rheumatologist"},
    ],
    "Swelling": [
        {"condition": "Deep Vein Thrombosis", "confidence": 0.55, "tests": ["D-Dimer", "Doppler Ultrasound"], "specialist": "Vascular Surgeon"},
        {"condition": "Heart Failure", "confidence": 0.45, "tests": ["BNP", "Echocardiogram"], "specialist": "Cardiologist"},
        {"condition": "Cellulitis", "confidence": 0.50, "tests": ["CBC", "Blood Culture"], "specialist": ""},
    ],
    "Blurred vision": [
        {"condition": "Diabetic Retinopathy", "confidence": 0.55, "tests": ["Fundoscopy", "HbA1c", "OCT"], "specialist": "Ophthalmologist"},
        {"condition": "Glaucoma", "confidence": 0.45, "tests": ["Tonometry", "Visual Field Test"], "specialist": "Ophthalmologist"},
        {"condition": "Stroke", "confidence": 0.30, "tests": ["CT Head", "MRI Brain"], "specialist": "Neurologist"},
    ],
    "Palpitations": [
        {"condition": "Atrial Fibrillation", "confidence": 0.60, "tests": ["ECG", "Holter Monitor", "Echocardiogram"], "specialist": "Cardiologist"},
        {"condition": "Supraventricular Tachycardia", "confidence": 0.50, "tests": ["ECG", "Electrophysiology Study"], "specialist": "Cardiologist"},
        {"condition": "Anxiety Disorder", "confidence": 0.40, "tests": ["TSH", "CBC", "ECG"], "specialist": "Psychiatrist"},
    ],
    "Numbness": [
        {"condition": "Peripheral Neuropathy", "confidence": 0.60, "tests": ["EMG", "NCS", "HbA1c", "B12 Level"], "specialist": "Neurologist"},
        {"condition": "Stroke/TIA", "confidence": 0.45, "tests": ["CT Head", "MRI Brain", "Carotid Doppler"], "specialist": "Neurologist"},
        {"condition": "Carpal Tunnel Syndrome", "confidence": 0.50, "tests": ["EMG", "NCS", "Phalen Test"], "specialist": "Orthopedist"},
    ],
    "Weight loss": [
        {"condition": "Hyperthyroidism", "confidence": 0.55, "tests": ["TSH", "Free T4", "Free T3"], "specialist": "Endocrinologist"},
        {"condition": "Malignancy", "confidence": 0.40, "tests": ["CT Chest/Abdomen", "CBC", "LDH"], "specialist": "Oncologist"},
        {"condition": "Diabetes", "confidence": 0.50, "tests": ["Fasting Glucose", "HbA1c"], "specialist": "Endocrinologist"},
    ],
    "Confusion": [
        {"condition": "Delirium", "confidence": 0.60, "tests": ["CBC", "BMP", "Urinalysis", "CT Head"], "specialist": "Neurologist"},
        {"condition": "Stroke", "confidence": 0.50, "tests": ["CT Head", "MRI Brain"], "specialist": "Neurologist"},
        {"condition": "Metabolic Encephalopathy", "confidence": 0.45, "tests": ["BMP", "Ammonia Level", "LFTs"], "specialist": "Neurologist"},
    ],
    "Seizures": [
        {"condition": "Epilepsy", "confidence": 0.65, "tests": ["EEG", "MRI Brain", "Basic Metabolic Panel"], "specialist": "Neurologist"},
        {"condition": "Metabolic Disturbance", "confidence": 0.40, "tests": ["BMP", "Blood Glucose", "Calcium"], "specialist": ""},
        {"condition": "Brain Tumor", "confidence": 0.25, "tests": ["MRI Brain with Contrast", "CT Head"], "specialist": "Neurosurgeon"},
    ],
}


def analyze_patient(symptoms: list, vitals: dict = None, history: list = None, lab_results: list = None) -> dict:
    """Analyze patient data and suggest possible diagnoses."""
    conditions = {}
    all_tests = set()
    all_specialists = set()

    for symptom in symptoms:
        if symptom in CONDITION_DB:
            for entry in CONDITION_DB[symptom]:
                cond = entry["condition"]
                if cond in conditions:
                    conditions[cond]["confidence"] = min(0.95, conditions[cond]["confidence"] + entry["confidence"] * 0.3)
                    conditions[cond]["supporting_symptoms"].append(symptom)
                else:
                    conditions[cond] = {
                        "confidence": entry["confidence"],
                        "supporting_symptoms": [symptom],
                    }
                all_tests.update(entry["tests"])
                if entry["specialist"]:
                    all_specialists.add(entry["specialist"])

    # Adjust confidence based on vitals
    if vitals:
        if vitals.get("oxygen_level", 100) < 92:
            for c in ["Pneumonia", "Heart Failure", "COPD Exacerbation", "Pulmonary Embolism"]:
                if c in conditions:
                    conditions[c]["confidence"] = min(0.95, conditions[c]["confidence"] + 0.15)
        if vitals.get("heart_rate", 72) > 110:
            for c in ["Atrial Fibrillation", "Supraventricular Tachycardia", "Sepsis"]:
                if c in conditions:
                    conditions[c]["confidence"] = min(0.95, conditions[c]["confidence"] + 0.10)
        if vitals.get("temperature", 98.6) > 101.0:
            for c in ["Sepsis", "Pneumonia", "Urinary Tract Infection", "Meningitis"]:
                if c in conditions:
                    conditions[c]["confidence"] = min(0.95, conditions[c]["confidence"] + 0.10)

    # Adjust based on medical history
    if history:
        history_str = " ".join(history).lower()
        if "diabetes" in history_str:
            for c in ["Diabetic Retinopathy", "Peripheral Neuropathy", "Diabetes"]:
                if c in conditions:
                    conditions[c]["confidence"] = min(0.95, conditions[c]["confidence"] + 0.15)
        if "hypertension" in history_str or "heart" in history_str:
            for c in ["Heart Failure", "Stroke", "Atrial Fibrillation", "Acute Coronary Syndrome"]:
                if c in conditions:
                    conditions[c]["confidence"] = min(0.95, conditions[c]["confidence"] + 0.10)

    # Sort conditions by confidence
    sorted_conditions = sorted(conditions.items(), key=lambda x: x[1]["confidence"], reverse=True)

    return {
        "possible_conditions": [
            {"name": name, "confidence": round(data["confidence"] * 100, 1), "supporting_symptoms": data["supporting_symptoms"]}
            for name, data in sorted_conditions[:6]
        ],
        "recommended_tests": sorted(list(all_tests))[:10],
        "specialist_referrals": sorted(list(all_specialists)),
        "clinical_notes": _generate_clinical_notes(symptoms, sorted_conditions),
    }


def _generate_clinical_notes(symptoms, conditions):
    notes = []
    if len(symptoms) > 3:
        notes.append("Multiple concurrent symptoms suggest complex presentation. Comprehensive workup recommended.")
    if conditions and conditions[0][1]["confidence"] > 0.7:
        notes.append(f"High-confidence preliminary diagnosis: {conditions[0][0]}. Confirmatory testing advised.")
    if any(c[0] in ("Sepsis", "Stroke", "Pulmonary Embolism", "Acute Coronary Syndrome", "Intracranial Hemorrhage") for c in conditions[:3]):
        notes.append("URGENT: Life-threatening condition in differential. Immediate evaluation required.")
    if not notes:
        notes.append("Standard evaluation recommended. Monitor for symptom progression.")
    return notes
