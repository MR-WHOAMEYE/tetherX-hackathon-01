"""
FastAPI Backend — Clinical Decision Support Platform
All API endpoints for the React frontend.
Real-Time Clinical Intelligence Platform v3.0
"""
import json
import sys
import os
import asyncio
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from database.db import init_db
from database.seed_data import seed_database
from services.auth_service import authenticate
from services.patient_service import (
    get_all_patients, get_patient, create_patient, update_patient,
    get_patient_vitals, add_vitals, get_patient_labs,
    get_patient_medications, get_patient_appointments,
    get_patients_by_status, get_patient_count
)
from services.copilot_service import analyze_patient
from services.triage_service import calculate_severity, triage_all_patients
from services.risk_service import predict_risk, get_risk_trend
from services.recommendation_service import get_recommendations
from services.drug_service import check_interactions, check_new_drug, get_known_interactions
from services.similarity_service import find_similar_cases
from services.outcome_service import predict_outcomes
from services.timeline_service import get_timeline, get_current_stage, add_event
from services.followup_service import (
    get_upcoming_followups, schedule_followup, complete_followup,
    cancel_followup, get_followup_stats, generate_medication_reminders
)
from services.dashboard_service import get_hospital_metrics, get_department_stats, get_hourly_admissions
from services.websocket_manager import manager as ws_manager
from services.event_stream_service import log_event, get_recent_events
from services.alert_engine import check_vitals_thresholds, check_risk_threshold, get_active_alerts, acknowledge_alert, get_alert_stats
from services.vitals_monitor_service import get_live_vitals, get_vitals_trend, get_all_patients_latest_vitals
from services.activity_tracker import log_activity, get_recent_activities
from services.risk_recalculation_service import (
    recalculate_risk, get_risk_history, get_patient_priority_queue,
    get_command_center_metrics, get_workload_analysis, get_ai_insights
)

# Initialize
init_db()
seed_database()

app = FastAPI(title="ClinIQ API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = authenticate(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user": user}


# ── Patients ────────────────────────────────────────────────────────────────
@app.get("/api/patients")
def list_patients(status: Optional[str] = None, search: Optional[str] = None, limit: int = 100):
    patients = get_all_patients(status_filter=status, search_query=search, limit=limit)
    # Parse JSON fields
    for p in patients:
        for field in ("symptoms", "allergies", "medical_history", "current_medications"):
            if isinstance(p.get(field), str):
                try:
                    p[field] = json.loads(p[field])
                except:
                    p[field] = []
    return patients

@app.get("/api/patients/count")
def patient_count():
    return {"count": get_patient_count()}

@app.get("/api/patients/status-distribution")
def patients_status():
    return get_patients_by_status()

@app.get("/api/patients/{patient_id}")
def get_patient_detail(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field in ("symptoms", "allergies", "medical_history", "current_medications"):
        if isinstance(p.get(field), str):
            try:
                p[field] = json.loads(p[field])
            except:
                p[field] = []
    return p

class PatientCreate(BaseModel):
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
    assigned_doctor: str = ""
    assigned_nurse: str = ""
    room_number: str = ""

@app.post("/api/patients")
def create_new_patient(data: PatientCreate):
    pid = create_patient(data.model_dump())
    return {"patient_id": pid}

@app.put("/api/patients/{patient_id}")
def update_existing_patient(patient_id: str, data: dict):
    update_patient(patient_id, data)
    return {"status": "updated"}

# ── Vitals ──────────────────────────────────────────────────────────────────
@app.get("/api/patients/{patient_id}/vitals")
def get_vitals(patient_id: str, limit: int = 10):
    return get_patient_vitals(patient_id, limit)

class VitalsCreate(BaseModel):
    patient_id: str
    blood_pressure_sys: int = 120
    blood_pressure_dia: int = 80
    heart_rate: int = 72
    oxygen_level: float = 98.0
    temperature: float = 98.6
    respiratory_rate: int = 16
    blood_glucose: float = 100.0
    weight: float = 150.0
    recorded_by: str = ""

@app.post("/api/vitals")
async def create_vitals(data: VitalsCreate):
    vitals_dict = data.model_dump()
    add_vitals(vitals_dict)

    # Real-time processing pipeline
    try:
        # 1. Log clinical event
        event = log_event(
            event_type="vitals_update",
            title=f"Vitals recorded for patient {data.patient_id}",
            description=f"HR:{data.heart_rate} O2:{data.oxygen_level}% BP:{data.blood_pressure_sys}/{data.blood_pressure_dia}",
            patient_id=data.patient_id,
            staff_name=data.recorded_by or "System",
            severity="info"
        )

        # 2. Check alert thresholds
        alerts = check_vitals_thresholds(data.patient_id, vitals_dict)

        # 3. Recalculate risk
        risk = recalculate_risk(data.patient_id, vitals_dict)

        # 4. Check risk threshold for alerts
        if risk and risk["risk_score"] >= 70:
            risk_alert = check_risk_threshold(data.patient_id, risk["risk_score"])
            if risk_alert:
                alerts.append(risk_alert)

        # 5. Log staff activity
        if data.recorded_by:
            log_activity(
                staff_name=data.recorded_by,
                staff_role="nurse",
                action_type="vitals_recording",
                description=f"Recorded vitals for patient {data.patient_id}",
                patient_id=data.patient_id
            )

        # 6. Broadcast via WebSocket
        await ws_manager.broadcast({
            "type": "vitals_update",
            "data": {"patient_id": data.patient_id, "vitals": vitals_dict, "risk": risk, "alerts": alerts}
        })

        # Broadcast individual alerts
        for alert in alerts:
            alert_event = log_event(
                event_type="alert",
                title=alert["title"],
                description=alert["description"],
                patient_id=data.patient_id,
                severity="critical"
            )
            await ws_manager.broadcast({"type": "alert", "data": alert})

    except Exception as e:
        print(f"Real-time processing error: {e}")

    return {"status": "recorded"}

# ── Labs ────────────────────────────────────────────────────────────────────
@app.get("/api/patients/{patient_id}/labs")
def get_labs(patient_id: str):
    return get_patient_labs(patient_id)

# ── Medications ─────────────────────────────────────────────────────────────
@app.get("/api/patients/{patient_id}/medications")
def get_meds(patient_id: str):
    return get_patient_medications(patient_id)

# ── AI Copilot ──────────────────────────────────────────────────────────────
class CopilotRequest(BaseModel):
    symptoms: List[str]
    vitals: Optional[dict] = None
    medical_history: Optional[List[str]] = None
    lab_results: Optional[List[str]] = None

@app.post("/api/copilot/analyze")
def copilot_analyze(req: CopilotRequest):
    return analyze_patient(req.symptoms, req.vitals, req.medical_history, req.lab_results)

@app.get("/api/copilot/analyze-patient/{patient_id}")
def copilot_analyze_patient(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    symptoms = json.loads(p["symptoms"]) if isinstance(p["symptoms"], str) else p["symptoms"]
    history = json.loads(p["medical_history"]) if isinstance(p["medical_history"], str) else p["medical_history"]
    vitals_list = get_patient_vitals(patient_id, limit=1)
    vitals = dict(vitals_list[0]) if vitals_list else None
    result = analyze_patient(symptoms, vitals, history)
    result["patient"] = {
        "name": f"{p['first_name']} {p['last_name']}",
        "age": p["age"], "gender": p["gender"],
        "symptoms": symptoms, "medical_history": history,
        "status": p["status"],
    }
    return result

# ── Triage ──────────────────────────────────────────────────────────────────
class TriageRequest(BaseModel):
    symptoms: List[str]
    vitals: Optional[dict] = None
    age: int = 50
    medical_history: Optional[List[str]] = None

@app.post("/api/triage/calculate")
def triage_calculate(req: TriageRequest):
    return calculate_severity(req.symptoms, req.vitals, req.age, req.medical_history)

@app.get("/api/triage/all")
def triage_all():
    patients = get_all_patients(limit=200)
    return triage_all_patients(patients)

@app.get("/api/triage/patient/{patient_id}")
def triage_patient(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    symptoms = json.loads(p["symptoms"]) if isinstance(p["symptoms"], str) else p["symptoms"]
    history = json.loads(p["medical_history"]) if isinstance(p["medical_history"], str) else p["medical_history"]
    vitals_list = get_patient_vitals(patient_id, limit=1)
    vitals = dict(vitals_list[0]) if vitals_list else None
    result = calculate_severity(symptoms, vitals, p["age"], history)
    result["patient"] = {"name": f"{p['first_name']} {p['last_name']}", "patient_id": p["patient_id"], "age": p["age"]}
    return result

# ── Risk Prediction ─────────────────────────────────────────────────────────
@app.get("/api/risk/{patient_id}")
def risk_predict(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    vitals_list = get_patient_vitals(patient_id, limit=1)
    vitals = dict(vitals_list[0]) if vitals_list else None
    result = predict_risk(p, vitals)
    result["patient"] = {"name": f"{p['first_name']} {p['last_name']}", "patient_id": p["patient_id"], "age": p["age"]}
    return result

@app.get("/api/risk/{patient_id}/trend")
def risk_trend(patient_id: str, days: int = 7):
    return get_risk_trend(patient_id, days)

# ── Recommendations ─────────────────────────────────────────────────────────
class RecommendationRequest(BaseModel):
    diagnosis: Optional[str] = None
    symptoms: Optional[List[str]] = None
    medical_history: Optional[List[str]] = None

@app.post("/api/recommendations")
def get_recs(req: RecommendationRequest):
    return get_recommendations(req.diagnosis, req.symptoms, req.medical_history)

@app.get("/api/recommendations/patient/{patient_id}")
def get_patient_recs(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    symptoms = json.loads(p["symptoms"]) if isinstance(p["symptoms"], str) else p["symptoms"]
    history = json.loads(p["medical_history"]) if isinstance(p["medical_history"], str) else p["medical_history"]
    return get_recommendations(symptoms=symptoms, history=history)

# ── Drug Interactions ────────────────────────────────────────────────────────
@app.get("/api/drugs/interactions")
def list_interactions():
    return get_known_interactions()

class DrugCheckRequest(BaseModel):
    drugs: List[str]

@app.post("/api/drugs/check")
def check_drug_interactions(req: DrugCheckRequest):
    return check_interactions(req.drugs)

class NewDrugCheck(BaseModel):
    existing_drugs: List[str]
    new_drug: str

@app.post("/api/drugs/check-new")
def check_new_drug_interaction(req: NewDrugCheck):
    return check_new_drug(req.existing_drugs, req.new_drug)

@app.get("/api/drugs/check-patient/{patient_id}")
def check_patient_drugs(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    meds = json.loads(p["current_medications"]) if isinstance(p["current_medications"], str) else p["current_medications"]
    return {"medications": meds, "interactions": check_interactions(meds)}

# ── Case Similarity ──────────────────────────────────────────────────────────
@app.get("/api/similarity/{patient_id}")
def find_similar(patient_id: str, top_n: int = 10):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return find_similar_cases(p, top_n)

# ── Treatment Outcomes ───────────────────────────────────────────────────────
@app.get("/api/outcomes/{patient_id}")
def predict_treatment_outcomes(patient_id: str):
    p = get_patient(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return predict_outcomes(p)

# ── Timeline ─────────────────────────────────────────────────────────────────
@app.get("/api/timeline/{patient_id}")
def patient_timeline(patient_id: str):
    return {"events": get_timeline(patient_id), "current_stage": get_current_stage(patient_id)}

class TimelineEvent(BaseModel):
    patient_id: str
    event_type: str
    title: str
    description: str = ""
    created_by: str = ""

@app.post("/api/timeline")
def add_timeline_event(data: TimelineEvent):
    add_event(data.patient_id, data.event_type, data.title, data.description, data.created_by)
    return {"status": "added"}

# ── Follow-Up ────────────────────────────────────────────────────────────────
@app.get("/api/followups")
def list_followups(patient_id: Optional[str] = None, limit: int = 20):
    return get_upcoming_followups(patient_id, limit)

@app.get("/api/followups/stats")
def followup_statistics():
    return get_followup_stats()

class FollowupCreate(BaseModel):
    patient_id: str
    doctor: str
    appointment_type: str
    date: str
    time: str
    notes: str = ""

@app.post("/api/followups")
def create_followup(data: FollowupCreate):
    schedule_followup(data.patient_id, data.doctor, data.appointment_type, data.date, data.time, data.notes)
    return {"status": "scheduled"}

@app.put("/api/followups/{appointment_id}/complete")
def complete_apt(appointment_id: int):
    complete_followup(appointment_id)
    return {"status": "completed"}

@app.put("/api/followups/{appointment_id}/cancel")
def cancel_apt(appointment_id: int):
    cancel_followup(appointment_id)
    return {"status": "cancelled"}

@app.get("/api/followups/reminders/{patient_id}")
def get_reminders(patient_id: str):
    return generate_medication_reminders(patient_id)

# ── Appointments ─────────────────────────────────────────────────────────────
@app.get("/api/patients/{patient_id}/appointments")
def get_appointments(patient_id: str):
    return get_patient_appointments(patient_id)

# ── Hospital Intelligence ────────────────────────────────────────────────────
@app.get("/api/dashboard/metrics")
def dashboard_metrics():
    return get_hospital_metrics()

@app.get("/api/dashboard/departments")
def dashboard_departments():
    return get_department_stats()

@app.get("/api/dashboard/admissions")
def dashboard_admissions():
    return get_hourly_admissions()


# ── WebSocket ────────────────────────────────────────────────────────────────
@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for ping/pong keepalive
            await websocket.send_text(json.dumps({"type": "pong", "data": data}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# ── Real-Time Event Stream ──────────────────────────────────────────────────
@app.get("/api/events")
def list_events(limit: int = 50, event_type: Optional[str] = None):
    return get_recent_events(limit, event_type)


# ── Alerts ───────────────────────────────────────────────────────────────────
@app.get("/api/alerts")
def list_alerts(limit: int = 50):
    return get_active_alerts(limit)

@app.get("/api/alerts/stats")
def alert_stats():
    return get_alert_stats()

@app.put("/api/alerts/{alert_id}/acknowledge")
async def ack_alert(alert_id: int, acknowledged_by: str = "System"):
    result = acknowledge_alert(alert_id, acknowledged_by)
    await ws_manager.broadcast({"type": "alert_acknowledged", "data": result})
    return result


# ── Staff Activity ──────────────────────────────────────────────────────────
@app.get("/api/staff-activity")
def list_staff_activity(limit: int = 50, staff_role: Optional[str] = None):
    return get_recent_activities(limit, staff_role)


# ── Command Center ──────────────────────────────────────────────────────────
@app.get("/api/command-center/metrics")
def command_center_metrics():
    return get_command_center_metrics()

@app.get("/api/command-center/priority-queue")
def priority_queue(limit: int = 20):
    return get_patient_priority_queue(limit)

@app.get("/api/command-center/workload")
def workload():
    return get_workload_analysis()


# ── Live Vitals ─────────────────────────────────────────────────────────────
@app.get("/api/vitals/{patient_id}/live")
def live_vitals(patient_id: str):
    result = get_live_vitals(patient_id)
    if not result:
        raise HTTPException(status_code=404, detail="No vitals found")
    return result

@app.get("/api/vitals/{patient_id}/trend")
def vitals_trend(patient_id: str, limit: int = 30):
    return get_vitals_trend(patient_id, limit)

@app.get("/api/vitals/all/latest")
def all_latest_vitals():
    return get_all_patients_latest_vitals()


# ── Risk History ────────────────────────────────────────────────────────────
@app.get("/api/risk/{patient_id}/history")
def risk_history_endpoint(patient_id: str, limit: int = 20):
    return get_risk_history(patient_id, limit)


# ── AI Insights ─────────────────────────────────────────────────────────────
@app.get("/api/ai-insights")
def ai_insights(limit: int = 10):
    return get_ai_insights(limit)


# ── Seed initial risk calculations ──────────────────────────────────────────
@app.on_event("startup")
async def startup_seed_risks():
    """Seed risk calculations for existing patients on startup."""
    try:
        from database.db import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT patient_id FROM patients WHERE status IN ('active','critical','monitoring') LIMIT 50")
        patients = cursor.fetchall()
        conn.close()
        for p in patients:
            try:
                recalculate_risk(p["patient_id"])
            except Exception:
                pass
        # Seed some initial events
        log_event("system", "System Started", "ClinIQ Real-Time Intelligence Platform initialized", severity="info")
        log_event("system", "Risk Engine Active", f"Calculated risk scores for {len(patients)} patients", severity="info")
    except Exception as e:
        print(f"Startup seed error: {e}")


# ── Real-Time Metrics Broadcast Loop ─────────────────────────────────────────
@app.on_event("startup")
async def start_metrics_broadcast_loop():
    """Broadcast live hospital metrics every 30 seconds to all WS clients."""
    async def broadcaster():
        while True:
            await asyncio.sleep(30)
            try:
                metrics = get_hospital_metrics()
                active_alerts = get_active_alerts(50)
                status_dist = get_patients_by_status()
                await ws_manager.broadcast({
                    "type": "metrics_update",
                    "data": {
                        "metrics": metrics,
                        "alert_count": len(active_alerts),
                        "status_distribution": status_dist,
                    }
                })
            except Exception as e:
                print(f"Metrics broadcast error: {e}")
    asyncio.create_task(broadcaster())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
