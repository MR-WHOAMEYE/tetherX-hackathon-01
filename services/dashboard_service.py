"""
Hospital Intelligence Dashboard Service
Provides aggregated hospital metrics for administrators.
"""
import json
import random
from database.db import get_connection


def get_hospital_metrics() -> dict:
    conn = get_connection()
    cursor = conn.cursor()

    # Patient counts by status
    cursor.execute("SELECT status, COUNT(*) as count FROM patients GROUP BY status")
    status_counts = {r["status"]: r["count"] for r in cursor.fetchall()}

    # Total patients
    cursor.execute("SELECT COUNT(*) FROM patients")
    total_patients = cursor.fetchone()[0]

    # Department distribution (approximated from assigned doctors)
    cursor.execute("""SELECT assigned_doctor, COUNT(*) as count FROM patients
                      WHERE status != 'discharged' GROUP BY assigned_doctor""")
    doctor_load = {r["assigned_doctor"]: r["count"] for r in cursor.fetchall()}

    # Appointment stats
    cursor.execute("SELECT status, COUNT(*) as count FROM appointments GROUP BY status")
    apt_stats = {r["status"]: r["count"] for r in cursor.fetchall()}

    # Critical labs
    cursor.execute("SELECT COUNT(*) FROM lab_results WHERE status='critical'")
    critical_labs = cursor.fetchone()[0]

    # Average age
    cursor.execute("SELECT AVG(age) FROM patients")
    avg_age = round(cursor.fetchone()[0] or 0, 1)

    conn.close()

    active = status_counts.get("active", 0) + status_counts.get("monitoring", 0) + status_counts.get("critical", 0)

    return {
        "total_patients": total_patients,
        "active_patients": active,
        "critical_patients": status_counts.get("critical", 0),
        "monitoring_patients": status_counts.get("monitoring", 0),
        "discharged_patients": status_counts.get("discharged", 0),
        "status_distribution": status_counts,
        "doctor_workload": doctor_load,
        "appointment_stats": apt_stats,
        "critical_labs": critical_labs,
        "average_age": avg_age,
        "icu_capacity": random.randint(60, 95),
        "er_load": random.randint(70, 130),
        "bed_occupancy": random.randint(65, 98),
        "avg_wait_time": random.randint(12, 45),
        "staff_available": random.randint(20, 50),
    }


def get_department_stats() -> list:
    departments = [
        {"name": "Emergency", "patients": random.randint(15, 35), "capacity": 40, "staff": random.randint(8, 15)},
        {"name": "ICU", "patients": random.randint(8, 18), "capacity": 20, "staff": random.randint(10, 20)},
        {"name": "Cardiology", "patients": random.randint(10, 25), "capacity": 30, "staff": random.randint(6, 12)},
        {"name": "Neurology", "patients": random.randint(8, 20), "capacity": 25, "staff": random.randint(5, 10)},
        {"name": "Pulmonology", "patients": random.randint(6, 18), "capacity": 22, "staff": random.randint(4, 9)},
        {"name": "Orthopedics", "patients": random.randint(5, 15), "capacity": 20, "staff": random.randint(4, 8)},
        {"name": "General Medicine", "patients": random.randint(12, 30), "capacity": 35, "staff": random.randint(8, 15)},
        {"name": "Oncology", "patients": random.randint(5, 15), "capacity": 18, "staff": random.randint(5, 10)},
    ]
    for d in departments:
        d["occupancy"] = round(d["patients"] / d["capacity"] * 100, 1)
    return departments


def get_hourly_admissions() -> list:
    data = []
    for h in range(24):
        data.append({
            "hour": f"{h:02d}:00",
            "admissions": random.randint(0, 8) if 6 <= h <= 22 else random.randint(0, 3),
            "discharges": random.randint(0, 5) if 8 <= h <= 18 else random.randint(0, 2),
        })
    return data
