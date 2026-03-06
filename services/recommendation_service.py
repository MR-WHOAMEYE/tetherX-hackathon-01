"""
Clinical Recommendation Engine
Provides treatment recommendations based on diagnosis and patient data.
"""
import json

TREATMENT_DB = {
    "Acute Coronary Syndrome": {
        "treatments": ["Dual antiplatelet therapy (Aspirin + Clopidogrel)", "Anticoagulation with Heparin", "Beta-blocker therapy", "Statin therapy", "PCI or CABG if indicated"],
        "tests": ["Serial Troponins (q6h)", "ECG (serial)", "Echocardiogram", "Cardiac Catheterization"],
        "specialists": ["Cardiologist", "Interventional Cardiologist"],
        "urgency": "emergent",
    },
    "Pneumonia": {
        "treatments": ["Empiric antibiotics (Azithromycin + Ceftriaxone)", "Supplemental oxygen if O2 < 94%", "IV fluids for dehydration", "Antipyretics for fever management"],
        "tests": ["Chest X-ray (serial)", "Sputum Culture", "Blood Culture", "Procalcitonin"],
        "specialists": ["Pulmonologist"],
        "urgency": "urgent",
    },
    "Heart Failure": {
        "treatments": ["Loop diuretic (Furosemide)", "ACE inhibitor or ARB", "Beta-blocker (Carvedilol/Metoprolol)", "Sodium restriction", "Fluid restriction"],
        "tests": ["BNP/NT-proBNP", "Echocardiogram", "Chest X-ray", "Basic Metabolic Panel"],
        "specialists": ["Cardiologist", "Heart Failure Specialist"],
        "urgency": "urgent",
    },
    "Migraine": {
        "treatments": ["Triptans (Sumatriptan) for acute relief", "NSAIDs for mild episodes", "Prophylactic therapy if frequent", "Lifestyle modifications"],
        "tests": ["Neurological Exam", "MRI Brain if atypical features"],
        "specialists": ["Neurologist"],
        "urgency": "routine",
    },
    "Diabetes": {
        "treatments": ["Metformin first-line therapy", "Lifestyle modifications (diet + exercise)", "Blood glucose monitoring", "Insulin therapy if uncontrolled", "Statin for cardiovascular risk"],
        "tests": ["HbA1c (quarterly)", "Fasting Glucose", "Lipid Panel", "Renal Function", "Annual Eye Exam"],
        "specialists": ["Endocrinologist", "Ophthalmologist", "Podiatrist"],
        "urgency": "routine",
    },
    "Atrial Fibrillation": {
        "treatments": ["Rate control (Beta-blocker or Ca-channel blocker)", "Rhythm control (Amiodarone/Flecainide)", "Anticoagulation (DOACs preferred)", "Cardioversion if hemodynamically unstable"],
        "tests": ["ECG", "Echocardiogram", "TSH", "Holter Monitor"],
        "specialists": ["Cardiologist", "Electrophysiologist"],
        "urgency": "urgent",
    },
    "Stroke/TIA": {
        "treatments": ["tPA within 4.5 hours of onset", "Antiplatelet therapy", "Statin therapy", "Blood pressure management", "Neurosurgical intervention if needed"],
        "tests": ["CT Head (immediate)", "MRI Brain", "CT Angiography", "Carotid Doppler"],
        "specialists": ["Neurologist", "Interventional Neuroradiologist"],
        "urgency": "emergent",
    },
    "Sepsis": {
        "treatments": ["Broad-spectrum antibiotics (within 1 hour)", "IV fluid resuscitation (30 mL/kg)", "Vasopressors if needed", "Source control", "Corticosteroids if refractory shock"],
        "tests": ["Blood Culture (x2)", "Lactate Levels (serial)", "CBC", "Procalcitonin", "CRP"],
        "specialists": ["Intensivist", "Infectious Disease"],
        "urgency": "emergent",
    },
    "Appendicitis": {
        "treatments": ["Surgical appendectomy (laparoscopic preferred)", "Preoperative antibiotics", "NPO status", "IV fluid resuscitation"],
        "tests": ["CT Abdomen/Pelvis", "CBC", "CRP", "Urinalysis"],
        "specialists": ["General Surgeon"],
        "urgency": "urgent",
    },
    "Anemia": {
        "treatments": ["Iron supplementation (oral or IV)", "B12 injections if deficient", "Treat underlying cause", "Blood transfusion if severe (Hgb < 7)"],
        "tests": ["CBC w/ Differential", "Iron Studies", "Reticulocyte Count", "B12/Folate", "Peripheral Smear"],
        "specialists": ["Hematologist"],
        "urgency": "routine",
    },
}


def get_recommendations(diagnosis: str = None, symptoms: list = None, history: list = None) -> dict:
    """Generate clinical recommendations based on diagnosis or symptoms."""
    if diagnosis and diagnosis in TREATMENT_DB:
        rec = TREATMENT_DB[diagnosis]
        return {
            "diagnosis": diagnosis,
            "recommended_treatments": rec["treatments"],
            "diagnostic_tests": rec["tests"],
            "specialist_referrals": rec["specialists"],
            "urgency": rec["urgency"],
        }

    # Fallback: generate recommendations from symptoms
    treatments = set()
    tests = set()
    specialists = set()
    urgency = "routine"

    if symptoms:
        from services.copilot_service import CONDITION_DB
        for s in symptoms:
            if s in CONDITION_DB:
                for entry in CONDITION_DB[s][:2]:
                    cond_name = entry["condition"]
                    if cond_name in TREATMENT_DB:
                        rec = TREATMENT_DB[cond_name]
                        treatments.update(rec["treatments"][:2])
                        tests.update(rec["tests"][:2])
                        specialists.update(rec["specialists"])
                        if rec["urgency"] == "emergent":
                            urgency = "emergent"
                        elif rec["urgency"] == "urgent" and urgency != "emergent":
                            urgency = "urgent"
                    tests.update(entry["tests"][:2])
                    if entry["specialist"]:
                        specialists.add(entry["specialist"])

    if not treatments:
        treatments = {"General assessment and monitoring", "Symptomatic treatment as needed"}
    if not tests:
        tests = {"CBC", "BMP", "Urinalysis"}

    return {
        "diagnosis": diagnosis or "Pending diagnosis",
        "recommended_treatments": sorted(list(treatments))[:8],
        "diagnostic_tests": sorted(list(tests))[:8],
        "specialist_referrals": sorted(list(specialists)),
        "urgency": urgency,
    }
