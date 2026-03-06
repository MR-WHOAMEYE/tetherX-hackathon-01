"""
SQLite Database Connection & Initialization
Clinical Decision Support Platform
"""
import sqlite3
import os

# Vercel serverless: filesystem is read-only except /tmp
if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/clinical_platform.db"
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "clinical_platform.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('doctor','nurse','patient')),
        full_name TEXT NOT NULL,
        email TEXT,
        department TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        blood_type TEXT,
        date_of_birth TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        emergency_contact TEXT,
        insurance_id TEXT,
        allergies TEXT DEFAULT '[]',
        medical_history TEXT DEFAULT '[]',
        current_medications TEXT DEFAULT '[]',
        symptoms TEXT DEFAULT '[]',
        status TEXT DEFAULT 'active' CHECK(status IN ('active','discharged','critical','monitoring','deceased')),
        admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        discharge_date TIMESTAMP,
        assigned_doctor TEXT,
        assigned_nurse TEXT,
        room_number TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        blood_pressure_sys INTEGER,
        blood_pressure_dia INTEGER,
        heart_rate INTEGER,
        oxygen_level REAL,
        temperature REAL,
        respiratory_rate INTEGER,
        blood_glucose REAL,
        weight REAL,
        recorded_by TEXT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS lab_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        test_name TEXT NOT NULL,
        test_type TEXT,
        result_value TEXT,
        unit TEXT,
        reference_range TEXT,
        status TEXT DEFAULT 'normal' CHECK(status IN ('normal','abnormal','critical')),
        ordered_by TEXT,
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        result_at TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        drug_name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        route TEXT,
        start_date TEXT,
        end_date TEXT,
        prescribed_by TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','discontinued')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        doctor_name TEXT,
        appointment_type TEXT,
        scheduled_date TEXT,
        scheduled_time TEXT,
        status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled','no_show')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_title TEXT NOT NULL,
        event_description TEXT,
        event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS drug_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_a TEXT NOT NULL,
        drug_b TEXT NOT NULL,
        severity TEXT CHECK(severity IN ('mild','moderate','severe','contraindicated')),
        description TEXT,
        recommendation TEXT
    );

    CREATE TABLE IF NOT EXISTS diagnoses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        icd_code TEXT,
        severity TEXT,
        diagnosed_by TEXT,
        diagnosed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        notes TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS treatment_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        diagnosis_id INTEGER,
        treatment_name TEXT NOT NULL,
        treatment_type TEXT,
        description TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'active',
        outcome TEXT,
        success_rate REAL,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS clinical_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        severity TEXT DEFAULT 'info' CHECK(severity IN ('info','warning','critical')),
        patient_id TEXT,
        staff_name TEXT,
        title TEXT NOT NULL,
        description TEXT,
        metadata TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL CHECK(severity IN ('warning','critical','emergency')),
        title TEXT NOT NULL,
        description TEXT,
        threshold_value REAL,
        actual_value REAL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active','acknowledged','resolved')),
        acknowledged_by TEXT,
        acknowledged_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );

    CREATE TABLE IF NOT EXISTS staff_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_name TEXT NOT NULL,
        staff_role TEXT NOT NULL,
        action_type TEXT NOT NULL,
        patient_id TEXT,
        description TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risk_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        risk_score REAL NOT NULL,
        severity_score REAL,
        deterioration_risk REAL,
        triage_priority TEXT,
        factors TEXT DEFAULT '{}',
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    );
    """)

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
