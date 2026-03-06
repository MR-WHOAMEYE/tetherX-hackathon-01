"""
Dashboard Page — Main landing page with hero banner, KPIs, and overview.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from styles.theme import hero_banner, stat_card, section_header
from services.patient_service import get_patients_by_status, get_patient_count, get_all_patients
from services.dashboard_service import get_hospital_metrics
from services.auth_service import get_current_user


def render():
    user = get_current_user()
    metrics = get_hospital_metrics()

    # Hero Banner
    hero_banner(
        f"Welcome back, {user['full_name']}",
        "AI-powered clinical intelligence at your fingertips. Monitor patients, analyze risks, and make data-driven decisions with confidence.",
        f'<div style="margin-top:20px; display:flex; gap:24px; position:relative; z-index:1;">'
        f'<div style="background:rgba(255,255,255,0.12); border-radius:12px; padding:12px 20px;">'
        f'<div style="font-size:1.8rem; font-weight:700;">{metrics["total_patients"]}</div>'
        f'<div style="font-size:0.78rem; opacity:0.8;">Total Patients</div></div>'
        f'<div style="background:rgba(255,255,255,0.12); border-radius:12px; padding:12px 20px;">'
        f'<div style="font-size:1.8rem; font-weight:700;">{metrics["critical_patients"]}</div>'
        f'<div style="font-size:0.78rem; opacity:0.8;">Critical Cases</div></div>'
        f'<div style="background:rgba(255,255,255,0.12); border-radius:12px; padding:12px 20px;">'
        f'<div style="font-size:1.8rem; font-weight:700;">{metrics["bed_occupancy"]}%</div>'
        f'<div style="font-size:0.78rem; opacity:0.8;">Bed Occupancy</div></div>'
        f'<div style="background:rgba(255,255,255,0.12); border-radius:12px; padding:12px 20px;">'
        f'<div style="font-size:1.8rem; font-weight:700;">{metrics["staff_available"]}</div>'
        f'<div style="font-size:0.78rem; opacity:0.8;">Staff On Duty</div></div>'
        f'</div>'
    )

    # KPI Row
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(stat_card("fa-users", str(metrics["active_patients"]), "Active Patients", "#0A5EB5", "#EBF4FF"), unsafe_allow_html=True)
    with c2:
        st.markdown(stat_card("fa-triangle-exclamation", str(metrics["critical_patients"]), "Critical Alerts", "#DC2626", "#FEE2E2"), unsafe_allow_html=True)
    with c3:
        st.markdown(stat_card("fa-bed", f'{metrics["icu_capacity"]}%', "ICU Capacity", "#7C3AED", "#F3E8FF"), unsafe_allow_html=True)
    with c4:
        st.markdown(stat_card("fa-clock", f'{metrics["avg_wait_time"]}m', "Avg Wait Time", "#059669", "#D1FAE5"), unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Charts Row
    col1, col2 = st.columns(2)

    with col1:
        section_header("fa-chart-pie", "Patient Status Distribution")
        status = get_patients_by_status()
        colors = {"active": "#3B82F6", "monitoring": "#F59E0B", "critical": "#EF4444", "discharged": "#10B981"}
        fig = go.Figure(data=[go.Pie(
            labels=[k.title() for k in status.keys()],
            values=list(status.values()),
            hole=0.55,
            marker=dict(colors=[colors.get(k, "#94A3B8") for k in status.keys()]),
            textinfo="label+percent",
            textfont=dict(size=13, family="DM Sans"),
        )])
        fig.update_layout(
            height=340,
            margin=dict(t=20, b=20, l=20, r=20),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            showlegend=False,
            font=dict(family="DM Sans"),
        )
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        section_header("fa-user-doctor", "Doctor Workload")
        doc_load = metrics["doctor_workload"]
        if doc_load:
            names = [n.replace("Dr. ", "") for n in doc_load.keys()]
            vals = list(doc_load.values())
            fig = go.Figure(data=[go.Bar(
                x=vals, y=names,
                orientation='h',
                marker=dict(
                    color=vals,
                    colorscale=[[0, '#93C5FD'], [1, '#1D4ED8']],
                    cornerradius=6,
                ),
                text=vals, textposition='outside',
                textfont=dict(size=12, family="Space Grotesk", color="#334155"),
            )])
            fig.update_layout(
                height=340,
                margin=dict(t=20, b=20, l=10, r=40),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                xaxis=dict(showgrid=False, showticklabels=False, zeroline=False),
                yaxis=dict(showgrid=False, autorange="reversed"),
                font=dict(family="DM Sans", size=12),
            )
            st.plotly_chart(fig, use_container_width=True)

    # Recent Patients
    st.markdown("<br>", unsafe_allow_html=True)
    section_header("fa-clipboard-list", "Recent Patient Activity")

    patients = get_all_patients(limit=8)
    if patients:
        import json
        for i in range(0, len(patients), 4):
            cols = st.columns(4)
            for j, col in enumerate(cols):
                if i + j < len(patients):
                    p = patients[i + j]
                    symptoms = json.loads(p["symptoms"]) if isinstance(p["symptoms"], str) else p["symptoms"]
                    status_class = {"active": "active", "critical": "critical", "monitoring": "medium", "discharged": "low"}.get(p["status"], "active")
                    with col:
                        st.markdown(f"""
                        <div class="info-card animate-in" style="animation-delay:{j*0.1}s;">
                            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                                <div>
                                    <div style="font-weight:600; font-size:0.95rem;">{p['first_name']} {p['last_name']}</div>
                                    <div style="font-size:0.78rem; color:var(--text-muted);">{p['patient_id']} · Age {p['age']}</div>
                                </div>
                                <span class="badge badge-{status_class}">{p['status'].upper()}</span>
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px;">
                                <i class="fa-solid fa-stethoscope" style="color:var(--primary); margin-right:6px;"></i>
                                {', '.join(symptoms[:2]) if symptoms else 'No symptoms'}</div>
                            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:6px;">
                                <i class="fa-solid fa-user-doctor" style="margin-right:6px;"></i>{p.get('assigned_doctor', 'N/A')}</div>
                        </div>
                        """, unsafe_allow_html=True)
