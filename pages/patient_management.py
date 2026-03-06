"""
Patient Management Page — CRUD operations for patient records.
"""
import streamlit as st
import json
import pandas as pd
from styles.theme import section_header, hero_banner
from services.patient_service import (
    get_all_patients, get_patient, create_patient, update_patient,
    get_patient_vitals, add_vitals, get_patient_labs
)


def render():
    hero_banner(
        "👥 Patient Management",
        "Comprehensive patient record management. Register new patients, view medical histories, update records, and monitor clinical data."
    )

    tab1, tab2, tab3 = st.tabs(["📋 Patient Records", "➕ Register Patient", "📊 Vitals Entry"])

    with tab1:
        col1, col2, col3 = st.columns([2, 1, 1])
        with col1:
            search = st.text_input("🔍 Search patients", placeholder="Name or Patient ID...", key="pm_search")
        with col2:
            status_filter = st.selectbox("Status", ["all", "active", "monitoring", "critical", "discharged"], key="pm_status")
        with col3:
            st.markdown("<br>", unsafe_allow_html=True)
            refresh = st.button("🔄 Refresh", key="pm_refresh")

        patients = get_all_patients(status_filter=status_filter, search_query=search if search else None)

        if patients:
            for p in patients:
                symptoms = json.loads(p["symptoms"]) if isinstance(p["symptoms"], str) else p["symptoms"]
                medications = json.loads(p["current_medications"]) if isinstance(p["current_medications"], str) else p["current_medications"]
                allergies = json.loads(p["allergies"]) if isinstance(p["allergies"], str) else p["allergies"]
                history = json.loads(p["medical_history"]) if isinstance(p["medical_history"], str) else p["medical_history"]

                status_colors = {"active": "#3B82F6", "critical": "#EF4444", "monitoring": "#F59E0B", "discharged": "#10B981"}
                sc = status_colors.get(p["status"], "#6B7280")

                with st.expander(f"**{p['first_name']} {p['last_name']}** — {p['patient_id']} · Age {p['age']} · {p['gender']}", expanded=False):
                    c1, c2, c3 = st.columns(3)
                    with c1:
                        st.markdown(f"""
                        <div style="font-size:0.88rem;">
                            <div style="margin-bottom:12px;">
                                <span style="font-weight:600; color:var(--text-muted); text-transform:uppercase; font-size:0.72rem; letter-spacing:0.05em;">Status</span><br>
                                <span style="color:{sc}; font-weight:700; font-size:1rem;">{p['status'].upper()}</span>
                            </div>
                            <div><strong>Blood Type:</strong> {p.get('blood_type','N/A')}</div>
                            <div><strong>Room:</strong> {p.get('room_number','N/A')}</div>
                            <div><strong>Doctor:</strong> {p.get('assigned_doctor','N/A')}</div>
                            <div><strong>Nurse:</strong> {p.get('assigned_nurse','N/A')}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    with c2:
                        st.markdown("**Symptoms:**")
                        if symptoms:
                            for s in symptoms:
                                st.markdown(f"• {s}")
                        else:
                            st.caption("No symptoms recorded")
                        st.markdown("**Allergies:**")
                        if allergies and allergies[0] != "None":
                            for a in allergies:
                                st.markdown(f"• {a}")
                        else:
                            st.caption("No known allergies")
                    with c3:
                        st.markdown("**Medical History:**")
                        if history and history[0] != "None":
                            for h in history:
                                st.markdown(f"• {h}")
                        else:
                            st.caption("No significant history")
                        st.markdown("**Current Medications:**")
                        if medications:
                            for m in medications:
                                st.markdown(f"• {m}")
                        else:
                            st.caption("No active medications")

                    # Vitals section
                    vitals = get_patient_vitals(p["patient_id"], limit=3)
                    if vitals:
                        st.markdown("---")
                        st.markdown("**Latest Vitals:**")
                        df = pd.DataFrame(vitals)
                        cols_show = ["blood_pressure_sys", "blood_pressure_dia", "heart_rate", "oxygen_level", "temperature", "respiratory_rate", "recorded_at"]
                        cols_available = [c for c in cols_show if c in df.columns]
                        st.dataframe(df[cols_available], use_container_width=True, hide_index=True)
        else:
            st.info("No patients found matching your criteria.")

    with tab2:
        st.markdown("### Register New Patient")
        with st.form("register_patient", clear_on_submit=True):
            c1, c2, c3 = st.columns(3)
            with c1:
                first_name = st.text_input("First Name*")
                age = st.number_input("Age*", 0, 120, 30)
                blood_type = st.selectbox("Blood Type", ["A+","A-","B+","B-","AB+","AB-","O+","O-"])
            with c2:
                last_name = st.text_input("Last Name*")
                gender = st.selectbox("Gender*", ["Male", "Female"])
                phone = st.text_input("Phone")
            with c3:
                email = st.text_input("Email")
                insurance = st.text_input("Insurance ID")
                emergency = st.text_input("Emergency Contact")

            symptoms_input = st.multiselect("Current Symptoms", [
                "Chest pain","Shortness of breath","Headache","Dizziness","Nausea","Fatigue",
                "Fever","Cough","Abdominal pain","Back pain","Joint pain","Swelling",
                "Blurred vision","Numbness","Palpitations","Weight loss","Confusion","Seizures"
            ])
            allergies_input = st.multiselect("Known Allergies", [
                "Penicillin","Aspirin","Sulfa drugs","Codeine","NSAIDs","Latex","Ibuprofen","None"
            ])
            history_input = st.multiselect("Medical History", [
                "Hypertension","Diabetes Type 2","Asthma","Heart Disease","COPD","Stroke",
                "Cancer","Arthritis","Chronic Kidney Disease","Depression","None"
            ])

            submitted = st.form_submit_button("Register Patient", type="primary", use_container_width=True)
            if submitted:
                if first_name and last_name:
                    pid = create_patient({
                        "first_name": first_name, "last_name": last_name, "age": age,
                        "gender": gender, "blood_type": blood_type, "phone": phone,
                        "email": email, "insurance_id": insurance, "emergency_contact": emergency,
                        "symptoms": symptoms_input, "allergies": allergies_input,
                        "medical_history": history_input,
                    })
                    st.success(f"Patient registered successfully! ID: **{pid}**")
                else:
                    st.error("First name and last name are required.")

    with tab3:
        st.markdown("### Record Vital Signs")
        patients = get_all_patients(limit=100)
        patient_options = {f"{p['patient_id']} — {p['first_name']} {p['last_name']}": p['patient_id'] for p in patients}
        sel = st.selectbox("Select Patient", list(patient_options.keys()), key="vitals_patient")

        if sel:
            with st.form("add_vitals", clear_on_submit=True):
                c1, c2, c3, c4 = st.columns(4)
                with c1:
                    bp_sys = st.number_input("Systolic BP", 60, 250, 120)
                    bp_dia = st.number_input("Diastolic BP", 30, 150, 80)
                with c2:
                    hr = st.number_input("Heart Rate (bpm)", 30, 200, 72)
                    o2 = st.number_input("O2 Saturation (%)", 50.0, 100.0, 98.0, step=0.1)
                with c3:
                    temp = st.number_input("Temperature (°F)", 90.0, 110.0, 98.6, step=0.1)
                    rr = st.number_input("Respiratory Rate", 5, 50, 16)
                with c4:
                    bg = st.number_input("Blood Glucose", 30.0, 600.0, 100.0, step=1.0)
                    wt = st.number_input("Weight (lbs)", 50.0, 500.0, 150.0, step=0.5)

                if st.form_submit_button("Save Vitals", type="primary", use_container_width=True):
                    add_vitals({
                        "patient_id": patient_options[sel],
                        "blood_pressure_sys": bp_sys, "blood_pressure_dia": bp_dia,
                        "heart_rate": hr, "oxygen_level": o2, "temperature": temp,
                        "respiratory_rate": rr, "blood_glucose": bg, "weight": wt,
                        "recorded_by": st.session_state.get("user", {}).get("full_name", ""),
                    })
                    st.success("Vital signs recorded successfully!")
