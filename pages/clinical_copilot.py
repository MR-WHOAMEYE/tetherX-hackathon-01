"""
AI Clinical Copilot Page — AI-assisted diagnosis and clinical suggestions.
"""
import streamlit as st
import json
import plotly.graph_objects as go
from styles.theme import section_header, hero_banner
from services.copilot_service import analyze_patient
from services.patient_service import get_all_patients, get_patient, get_patient_vitals


def render():
    hero_banner(
        "🤖 AI Clinical Copilot",
        "AI-powered diagnostic assistant. Input patient symptoms and clinical data to receive intelligent analysis, possible diagnoses, and recommended tests."
    )

    tab1, tab2 = st.tabs(["📋 Patient Analysis", "🔍 Quick Assessment"])

    with tab1:
        patients = get_all_patients(limit=100)
        patient_options = {f"{p['patient_id']} — {p['first_name']} {p['last_name']}": p['patient_id'] for p in patients}

        selected = st.selectbox("Select Patient", options=list(patient_options.keys()), key="copilot_patient")
        if selected:
            pid = patient_options[selected]
            patient = get_patient(pid)
            if patient:
                symptoms = json.loads(patient["symptoms"]) if isinstance(patient["symptoms"], str) else patient["symptoms"]
                history = json.loads(patient["medical_history"]) if isinstance(patient["medical_history"], str) else patient["medical_history"]

                col1, col2 = st.columns(2)
                with col1:
                    st.markdown(f"""
                    <div class="info-card">
                        <div class="info-card-header">
                            <i class="fa-solid fa-user" style="color:var(--primary);"></i>
                            <h4 style="margin:0; font-family:'Space Grotesk',sans-serif;">Patient Information</h4>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.88rem;">
                            <div><strong>Name:</strong> {patient['first_name']} {patient['last_name']}</div>
                            <div><strong>Age:</strong> {patient['age']} · {patient['gender']}</div>
                            <div><strong>Blood Type:</strong> {patient.get('blood_type','N/A')}</div>
                            <div><strong>Status:</strong> {patient['status'].upper()}</div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                with col2:
                    st.markdown(f"""
                    <div class="info-card">
                        <div class="info-card-header">
                            <i class="fa-solid fa-notes-medical" style="color:var(--primary);"></i>
                            <h4 style="margin:0; font-family:'Space Grotesk',sans-serif;">Current Symptoms</h4>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            {''.join(f'<span class="badge badge-high">{s}</span>' for s in symptoms) if symptoms else '<span style="color:var(--text-muted);">No symptoms recorded</span>'}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                st.markdown("<br>", unsafe_allow_html=True)

                if st.button("🧠 Run AI Analysis", use_container_width=True, type="primary"):
                    vitals_list = get_patient_vitals(pid, limit=1)
                    vitals = dict(vitals_list[0]) if vitals_list else None

                    with st.spinner("AI Clinical Copilot analyzing patient data..."):
                        import time
                        time.sleep(1)
                        result = analyze_patient(symptoms, vitals, history)

                    st.success("Analysis complete!")
                    st.markdown("<br>", unsafe_allow_html=True)

                    # Clinical Notes
                    for note in result.get("clinical_notes", []):
                        if "URGENT" in note:
                            st.error(f"⚠️ {note}")
                        elif "High-confidence" in note:
                            st.warning(f"💡 {note}")
                        else:
                            st.info(f"📝 {note}")

                    col1, col2, col3 = st.columns(3)

                    with col1:
                        section_header("fa-stethoscope", "Possible Conditions")
                        for cond in result.get("possible_conditions", []):
                            conf = cond["confidence"]
                            color = "#DC2626" if conf > 70 else "#EA580C" if conf > 50 else "#CA8A04" if conf > 30 else "#16A34A"
                            st.markdown(f"""
                            <div class="info-card" style="margin-bottom:10px; padding:14px 18px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div style="font-weight:600; font-size:0.92rem;">{cond['name']}</div>
                                    <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; color:{color}; font-size:1.1rem;">{conf}%</div>
                                </div>
                                <div class="risk-bar" style="margin-top:8px;">
                                    <div class="risk-bar-fill" style="width:{conf}%; background:{color};"></div>
                                </div>
                                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">
                                    Based on: {', '.join(cond['supporting_symptoms'])}
                                </div>
                            </div>
                            """, unsafe_allow_html=True)

                    with col2:
                        section_header("fa-vial", "Recommended Tests")
                        for test in result.get("recommended_tests", []):
                            st.markdown(f"""
                            <div style="display:flex; align-items:center; gap:10px; padding:10px 14px;
                                 background:var(--bg-card); border:1px solid var(--border); border-radius:10px; margin-bottom:6px;">
                                <i class="fa-solid fa-flask" style="color:var(--accent); font-size:0.85rem;"></i>
                                <span style="font-size:0.88rem; font-weight:500;">{test}</span>
                            </div>
                            """, unsafe_allow_html=True)

                    with col3:
                        section_header("fa-user-doctor", "Specialist Referrals")
                        for spec in result.get("specialist_referrals", []):
                            st.markdown(f"""
                            <div style="display:flex; align-items:center; gap:10px; padding:10px 14px;
                                 background:var(--bg-card); border:1px solid var(--border); border-radius:10px; margin-bottom:6px;">
                                <i class="fa-solid fa-hospital-user" style="color:var(--primary); font-size:0.85rem;"></i>
                                <span style="font-size:0.88rem; font-weight:500;">{spec}</span>
                            </div>
                            """, unsafe_allow_html=True)

    with tab2:
        st.markdown("### Quick Symptom Assessment")
        all_symptoms = ["Chest pain","Shortness of breath","Headache","Dizziness","Nausea","Fatigue",
                       "Fever","Cough","Abdominal pain","Back pain","Joint pain","Swelling",
                       "Blurred vision","Numbness","Palpitations","Weight loss","Confusion","Seizures"]
        selected_symptoms = st.multiselect("Select symptoms", all_symptoms, key="quick_symptoms")

        col1, col2 = st.columns(2)
        with col1:
            age = st.number_input("Patient Age", 0, 120, 50, key="quick_age")
        with col2:
            gender = st.selectbox("Gender", ["Male", "Female"], key="quick_gender")

        if selected_symptoms and st.button("⚡ Quick Analyze", type="primary"):
            result = analyze_patient(selected_symptoms)
            st.markdown("<br>", unsafe_allow_html=True)

            for cond in result.get("possible_conditions", [])[:5]:
                conf = cond["confidence"]
                color = "#DC2626" if conf > 70 else "#EA580C" if conf > 50 else "#CA8A04"
                st.markdown(f"""
                <div class="info-card" style="margin-bottom:8px; padding:14px 18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:600;">{cond['name']}</span>
                        <span style="font-family:'Space Grotesk',sans-serif; font-weight:700; color:{color};">{conf}%</span>
                    </div>
                    <div class="risk-bar" style="margin-top:6px;">
                        <div class="risk-bar-fill" style="width:{conf}%; background:{color};"></div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown("**Recommended Tests:**")
            st.write(", ".join(result.get("recommended_tests", [])))
