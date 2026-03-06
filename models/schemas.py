"""
Pydantic models for the Clinical Decision Support Platform.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Patient(BaseModel):
    patient_id: str = ""
    first_name: str
    last_name: str
    age: int
    gender: str
    blood_type: str = ""
    date_of_birth: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    emergency_contact: str = ""
    insurance_id: str = ""
    allergies: List[str] = []
    medical_history: List[str] = []
    current_medications: List[str] = []
    symptoms: List[str] = []
    status: str = "active"
    assigned_doctor: str = ""
    assigned_nurse: str = ""
    room_number: str = ""


class VitalSigns(BaseModel):
    patient_id: str
    blood_pressure_sys: int
    blood_pressure_dia: int
    heart_rate: int
    oxygen_level: float
    temperature: float
    respiratory_rate: int
    blood_glucose: float = 0.0
    weight: float = 0.0


class LabResult(BaseModel):
    patient_id: str
    test_name: str
    test_type: str = ""
    result_value: str
    unit: str = ""
    reference_range: str = ""
    status: str = "normal"


class Medication(BaseModel):
    patient_id: str
    drug_name: str
    dosage: str = ""
    frequency: str = ""
    route: str = "oral"
    start_date: str = ""
    end_date: str = ""
    prescribed_by: str = ""


class TriageResult(BaseModel):
    severity_score: int
    priority_level: str
    suggested_action: str
    risk_factors: List[str] = []


class RiskPrediction(BaseModel):
    deterioration_risk: float
    icu_risk: float
    complication_risk: float
    monitoring_frequency: str
    risk_factors: List[str] = []


class DrugInteraction(BaseModel):
    drug_a: str
    drug_b: str
    severity: str
    description: str
    recommendation: str


class ClinicalRecommendation(BaseModel):
    recommended_treatments: List[str] = []
    diagnostic_tests: List[str] = []
    specialist_referrals: List[str] = []
    urgency: str = "routine"


class TreatmentOutcome(BaseModel):
    treatment_name: str
    recovery_probability: float
    time_to_recovery: str = ""
    side_effects_risk: float = 0.0
