"""
Smart Patient Timeline Service
Manages patient lifecycle events.
"""
from database.db import get_connection


STAGE_ORDER = {
    "registration": 1, "diagnosis": 2, "treatment": 3,
    "monitoring": 4, "lab_result": 4, "medication": 3,
    "consultation": 3, "discharge": 6,
}

STAGE_LABELS = {
    "registration": "Patient Registration",
    "diagnosis": "Diagnosis",
    "treatment": "Treatment Planning",
    "monitoring": "Monitoring",
    "lab_result": "Lab Results",
    "medication": "Medication",
    "consultation": "Consultation",
    "discharge": "Discharge",
}

STAGE_ICONS = {
    "registration": "📋", "diagnosis": "🔬", "treatment": "💊",
    "monitoring": "📡", "lab_result": "🧪", "medication": "💉",
    "consultation": "👨‍⚕️", "discharge": "🏠",
}


def get_timeline(patient_id: str) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""SELECT * FROM timeline_events WHERE patient_id=?
                      ORDER BY event_date ASC""", (patient_id,))
    rows = cursor.fetchall()
    conn.close()

    events = []
    for r in rows:
        d = dict(r)
        d["stage_label"] = STAGE_LABELS.get(d["event_type"], d["event_type"])
        d["stage_icon"] = STAGE_ICONS.get(d["event_type"], "📌")
        d["stage_order"] = STAGE_ORDER.get(d["event_type"], 99)
        events.append(d)
    return events


def get_current_stage(patient_id: str) -> dict:
    events = get_timeline(patient_id)
    if not events:
        return {"stage": "registration", "label": "Patient Registration", "progress": 10}

    latest = max(events, key=lambda x: x["stage_order"])
    total_stages = 6
    progress = min(100, int((latest["stage_order"] / total_stages) * 100))
    return {
        "stage": latest["event_type"],
        "label": latest["stage_label"],
        "progress": progress,
        "total_events": len(events),
    }


def add_event(patient_id: str, event_type: str, title: str, description: str = "", created_by: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO timeline_events (patient_id,event_type,event_title,event_description,created_by)
                      VALUES (?,?,?,?,?)""", (patient_id, event_type, title, description, created_by))
    conn.commit()
    conn.close()
