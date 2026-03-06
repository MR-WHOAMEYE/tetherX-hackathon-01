"""
Seed Data Generator
Populates the database with realistic sample patient data.
"""
import json
import random
import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database.db import get_connection, init_db

FIRST_NAMES_M = ["James","Robert","Michael","William","David","Richard","Joseph","Thomas","Christopher","Daniel",
                 "Matthew","Anthony","Mark","Donald","Steven","Andrew","Paul","Joshua","Kenneth","Kevin"]
FIRST_NAMES_F = ["Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Sarah","Karen",
                 "Lisa","Nancy","Betty","Margaret","Sandra","Ashley","Dorothy","Kimberly","Emily","Donna"]
LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
              "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin"]

BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"]
GENDERS = ["Male","Female"]
DEPARTMENTS = ["Cardiology","Neurology","Orthopedics","Pulmonology","General Medicine","Emergency","ICU","Oncology","Pediatrics","Gastroenterology"]
STATUSES = ["active","monitoring","critical","discharged"]

ALLERGY_OPTIONS = ["Penicillin","Aspirin","Sulfa drugs","Codeine","NSAIDs","Latex","Contrast dye","Ibuprofen","Morphine","Amoxicillin","None"]
HISTORY_OPTIONS = ["Hypertension","Diabetes Type 2","Asthma","Heart Disease","COPD","Stroke","Cancer","Arthritis","Chronic Kidney Disease",
                   "Depression","Anxiety","Epilepsy","Migraine","Hepatitis","HIV","None"]
MED_OPTIONS = ["Metformin 500mg","Lisinopril 10mg","Atorvastatin 20mg","Amlodipine 5mg","Metoprolol 25mg","Omeprazole 20mg",
               "Losartan 50mg","Albuterol inhaler","Levothyroxine 50mcg","Gabapentin 300mg","Prednisone 10mg","Aspirin 81mg",
               "Warfarin 5mg","Insulin Glargine","Furosemide 40mg","Clopidogrel 75mg","Hydrochlorothiazide 25mg","Sertraline 50mg"]
SYMPTOM_OPTIONS = ["Chest pain","Shortness of breath","Headache","Dizziness","Nausea","Fatigue","Fever","Cough","Abdominal pain",
                   "Back pain","Joint pain","Swelling","Blurred vision","Numbness","Palpitations","Weight loss","Confusion","Seizures"]

DOCTORS = ["Dr. Sarah Chen","Dr. James Wilson","Dr. Maria Garcia","Dr. Robert Kim","Dr. Emily Brown","Dr. Michael Lee",
           "Dr. Jennifer Taylor","Dr. David Patel","Dr. Lisa Anderson","Dr. Kevin Thompson"]
NURSES = ["Nurse Amanda Scott","Nurse Brian Clark","Nurse Carol White","Nurse Derek Hall","Nurse Elena Young","Nurse Frank Adams"]

DRUG_INTERACTIONS_DATA = [
    ("Warfarin","Aspirin","severe","Increased risk of bleeding when taken together.","Avoid combination or monitor INR closely. Consider alternative antiplatelet."),
    ("Metformin","Contrast dye","severe","Risk of lactic acidosis with iodinated contrast agents.","Discontinue metformin 48 hours before and after contrast procedures."),
    ("Lisinopril","Potassium supplements","moderate","ACE inhibitors increase potassium retention; supplements may cause hyperkalemia.","Monitor serum potassium levels regularly."),
    ("Warfarin","NSAIDs","severe","NSAIDs increase bleeding risk and may affect warfarin metabolism.","Avoid combination. Use acetaminophen for pain if needed."),
    ("Metoprolol","Albuterol","moderate","Beta-blockers may reduce the effectiveness of beta-agonist bronchodilators.","Monitor respiratory response. Consider cardioselective beta-blocker."),
    ("Sertraline","Tramadol","severe","Increased risk of serotonin syndrome when SSRIs combined with tramadol.","Avoid combination or use with extreme caution under monitoring."),
    ("Amlodipine","Simvastatin","moderate","Amlodipine may increase simvastatin levels, raising risk of myopathy.","Limit simvastatin dose to 20mg daily when used with amlodipine."),
    ("Clopidogrel","Omeprazole","moderate","Omeprazole may reduce the antiplatelet effect of clopidogrel.","Consider pantoprazole as an alternative PPI."),
    ("Furosemide","Gentamicin","severe","Additive ototoxicity and nephrotoxicity risk.","Monitor renal function and hearing. Adjust doses accordingly."),
    ("Gabapentin","Morphine","moderate","CNS depression may be enhanced when combined.","Reduce gabapentin dose; monitor for excessive sedation."),
    ("Insulin Glargine","Prednisone","moderate","Corticosteroids may increase blood glucose, counteracting insulin.","Monitor blood glucose closely. Insulin dose adjustment may be needed."),
    ("Losartan","Potassium supplements","moderate","ARBs increase potassium retention; supplements risk hyperkalemia.","Monitor serum potassium. Avoid potassium-sparing diuretics."),
    ("Levothyroxine","Calcium supplements","mild","Calcium can reduce thyroid hormone absorption.","Take levothyroxine 4 hours apart from calcium supplements."),
    ("Atorvastatin","Grapefruit juice","mild","Grapefruit inhibits CYP3A4, increasing statin levels.","Avoid large quantities of grapefruit. Monitor for muscle pain."),
    ("Hydrochlorothiazide","Lithium","severe","Thiazides reduce lithium clearance, increasing toxicity risk.","Monitor lithium levels closely. Dose reduction may be necessary."),
]


def seed_database():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM patients")
    if cursor.fetchone()[0] > 0:
        print("Database already seeded. Skipping.")
        conn.close()
        return

    # Seed users
    users = [
        ("dr.chen","password123","doctor","Dr. Sarah Chen","sarah.chen@hospital.com","Cardiology"),
        ("dr.wilson","password123","doctor","Dr. James Wilson","james.wilson@hospital.com","Neurology"),
        ("dr.garcia","password123","doctor","Dr. Maria Garcia","maria.garcia@hospital.com","Pulmonology"),
        ("nurse.scott","password123","nurse","Nurse Amanda Scott","amanda.scott@hospital.com","General"),
        ("nurse.clark","password123","nurse","Nurse Brian Clark","brian.clark@hospital.com","ICU"),
        ("patient.john","password123","patient","John Doe","john.doe@email.com",""),
        ("patient.jane","password123","patient","Jane Smith","jane.smith@email.com",""),
        ("admin","admin123","doctor","Admin User","admin@hospital.com","Administration"),
    ]
    cursor.executemany("INSERT INTO users (username,password,role,full_name,email,department) VALUES (?,?,?,?,?,?)", users)

    # Seed 60 patients
    patients = []
    for i in range(1, 61):
        gender = random.choice(GENDERS)
        fn = random.choice(FIRST_NAMES_M if gender == "Male" else FIRST_NAMES_F)
        ln = random.choice(LAST_NAMES)
        age = random.randint(18, 92)
        pid = f"PT-{10000 + i}"
        bt = random.choice(BLOOD_TYPES)
        status = random.choices(STATUSES, weights=[40, 25, 15, 20])[0]
        allergies = json.dumps(random.sample(ALLERGY_OPTIONS, random.randint(0, 3)))
        history = json.dumps(random.sample(HISTORY_OPTIONS, random.randint(0, 4)))
        meds = json.dumps(random.sample(MED_OPTIONS, random.randint(0, 4)))
        symptoms = json.dumps(random.sample(SYMPTOM_OPTIONS, random.randint(1, 5)))
        doctor = random.choice(DOCTORS)
        nurse = random.choice(NURSES)
        room = f"{random.choice(['A','B','C','D'])}{random.randint(100,450)}"

        patients.append((pid, fn, ln, age, gender, bt,
                         f"{1990 - age + random.randint(0,5)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                         f"+1-555-{random.randint(1000,9999)}", f"{fn.lower()}.{ln.lower()}@email.com",
                         f"{random.randint(100,999)} Main Street", f"+1-555-{random.randint(1000,9999)}",
                         f"INS-{random.randint(100000,999999)}", allergies, history, meds, symptoms,
                         status, doctor, nurse, room))

    cursor.executemany("""INSERT INTO patients (patient_id,first_name,last_name,age,gender,blood_type,
        date_of_birth,phone,email,address,emergency_contact,insurance_id,allergies,medical_history,
        current_medications,symptoms,status,assigned_doctor,assigned_nurse,room_number)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", patients)

    # Seed vitals for each patient (2-5 records)
    for i in range(1, 61):
        pid = f"PT-{10000 + i}"
        for _ in range(random.randint(2, 5)):
            sys_bp = random.randint(90, 180)
            dia_bp = random.randint(55, 110)
            hr = random.randint(55, 130)
            o2 = round(random.uniform(88.0, 100.0), 1)
            temp = round(random.uniform(96.0, 103.5), 1)
            rr = random.randint(12, 28)
            bg = round(random.uniform(70, 300), 1)
            wt = round(random.uniform(100, 280), 1)
            cursor.execute("""INSERT INTO vitals (patient_id,blood_pressure_sys,blood_pressure_dia,heart_rate,
                oxygen_level,temperature,respiratory_rate,blood_glucose,weight,recorded_by)
                VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (pid, sys_bp, dia_bp, hr, o2, temp, rr, bg, wt, random.choice(NURSES)))

    # Seed lab results
    lab_tests = [
        ("Complete Blood Count","Hematology","WBC","cells/mcL","4,500-11,000"),
        ("Basic Metabolic Panel","Chemistry","Glucose","mg/dL","70-100"),
        ("Lipid Panel","Chemistry","Total Cholesterol","mg/dL","<200"),
        ("Hemoglobin A1c","Hematology","HbA1c","%","<5.7"),
        ("Troponin","Cardiac","Troponin I","ng/mL","<0.04"),
        ("D-Dimer","Coagulation","D-Dimer","ng/mL","<500"),
        ("Creatinine","Renal","Creatinine","mg/dL","0.7-1.3"),
        ("TSH","Endocrine","TSH","mIU/L","0.4-4.0"),
        ("Liver Function Test","Hepatic","ALT","U/L","7-56"),
        ("Urinalysis","Urine","pH","","4.5-8.0"),
    ]
    for i in range(1, 61):
        pid = f"PT-{10000 + i}"
        for test in random.sample(lab_tests, random.randint(2, 5)):
            status = random.choices(["normal","abnormal","critical"], weights=[60,30,10])[0]
            val = str(round(random.uniform(50, 500), 1))
            cursor.execute("""INSERT INTO lab_results (patient_id,test_name,test_type,result_value,unit,reference_range,status,ordered_by)
                VALUES (?,?,?,?,?,?,?,?)""",
                (pid, test[0], test[1], val, test[3], test[4], status, random.choice(DOCTORS)))

    # Seed drug interactions
    cursor.executemany("""INSERT INTO drug_interactions (drug_a,drug_b,severity,description,recommendation)
        VALUES (?,?,?,?,?)""", DRUG_INTERACTIONS_DATA)

    # Seed timeline events
    event_types = ["registration","diagnosis","treatment","monitoring","lab_result","medication","consultation","discharge"]
    event_titles = {
        "registration": "Patient Registered",
        "diagnosis": "Diagnosis Recorded",
        "treatment": "Treatment Started",
        "monitoring": "Vitals Monitored",
        "lab_result": "Lab Results Available",
        "medication": "Medication Prescribed",
        "consultation": "Specialist Consultation",
        "discharge": "Patient Discharged",
    }
    for i in range(1, 61):
        pid = f"PT-{10000 + i}"
        for etype in random.sample(event_types, random.randint(3, 6)):
            cursor.execute("""INSERT INTO timeline_events (patient_id,event_type,event_title,event_description,created_by)
                VALUES (?,?,?,?,?)""",
                (pid, etype, event_titles[etype], f"Automated event for patient {pid}.", random.choice(DOCTORS + NURSES)))

    # Seed appointments
    apt_types = ["Follow-up","Initial Consultation","Lab Review","Specialist Referral","Routine Checkup","Post-Surgery Review"]
    for i in range(1, 61):
        pid = f"PT-{10000 + i}"
        for _ in range(random.randint(1, 3)):
            cursor.execute("""INSERT INTO appointments (patient_id,doctor_name,appointment_type,scheduled_date,scheduled_time,status)
                VALUES (?,?,?,?,?,?)""",
                (pid, random.choice(DOCTORS), random.choice(apt_types),
                 f"2026-{random.randint(3,6):02d}-{random.randint(1,28):02d}",
                 f"{random.randint(8,17):02d}:{random.choice(['00','15','30','45'])}",
                 random.choices(["scheduled","completed","cancelled"],weights=[50,40,10])[0]))

    conn.commit()
    conn.close()
    print("Database seeded successfully with 60 patients and related data.")


if __name__ == "__main__":
    seed_database()
