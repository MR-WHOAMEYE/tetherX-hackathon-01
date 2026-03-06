"""
Premium Theme System — CSS injection for Clinical Decision Support Platform.
Design: Clean medical blue, glassmorphism, smooth animations, premium healthcare aesthetic.
Font: DM Sans + Space Grotesk (distinctive, not generic)
"""

GOOGLE_FONTS = """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
"""

THEME_CSS = """
<style>
:root {
    --primary: #0A5EB5;
    --primary-dark: #084A8E;
    --primary-light: #3B82F6;
    --primary-bg: #EBF4FF;
    --accent: #06B6D4;
    --accent-warm: #F59E0B;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --danger-light: #FEE2E2;
    --bg-main: #F0F5FA;
    --bg-card: #FFFFFF;
    --bg-card-hover: #F8FBFE;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-muted: #64748B;
    --border: #E2E8F0;
    --border-light: #F1F5F9;
    --shadow-sm: 0 1px 3px rgba(10,94,181,0.06);
    --shadow-md: 0 4px 16px rgba(10,94,181,0.08);
    --shadow-lg: 0 8px 32px rgba(10,94,181,0.12);
    --shadow-xl: 0 16px 48px rgba(10,94,181,0.15);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Global Resets ── */
html, body, [data-testid="stAppViewContainer"], .main, [data-testid="stApp"] {
    background: var(--bg-main) !important;
    font-family: 'DM Sans', -apple-system, sans-serif !important;
    color: var(--text-primary) !important;
}

[data-testid="stHeader"] {
    background: transparent !important;
}

/* ── Sidebar ── */
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0A3D6B 0%, #0A5EB5 40%, #1472CC 100%) !important;
    border-right: none !important;
    box-shadow: 4px 0 24px rgba(10,61,107,0.15) !important;
}

section[data-testid="stSidebar"] * {
    color: #E8F4FF !important;
}

section[data-testid="stSidebar"] .stRadio label {
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: var(--radius-md) !important;
    padding: 10px 16px !important;
    margin: 3px 0 !important;
    transition: var(--transition) !important;
    font-weight: 500 !important;
    font-size: 0.88rem !important;
    cursor: pointer !important;
}

section[data-testid="stSidebar"] .stRadio label:hover {
    background: rgba(255,255,255,0.14) !important;
    border-color: rgba(255,255,255,0.2) !important;
    transform: translateX(4px) !important;
}

section[data-testid="stSidebar"] .stRadio label[data-checked="true"],
section[data-testid="stSidebar"] .stRadio [aria-checked="true"] + label {
    background: rgba(255,255,255,0.18) !important;
    border-color: rgba(255,255,255,0.3) !important;
    font-weight: 600 !important;
}

section[data-testid="stSidebar"] .stRadio > div[role="radiogroup"] > label > div:first-child {
    display: none !important;
}

section[data-testid="stSidebar"] hr {
    border-color: rgba(255,255,255,0.12) !important;
    margin: 16px 0 !important;
}

section[data-testid="stSidebar"] h1, section[data-testid="stSidebar"] h2,
section[data-testid="stSidebar"] h3 {
    font-family: 'Space Grotesk', sans-serif !important;
    letter-spacing: -0.02em !important;
}

/* ── Main Content ── */
.main .block-container {
    padding: 2rem 2.5rem !important;
    max-width: 1400px !important;
}

/* ── Headings ── */
h1, h2, h3 {
    font-family: 'Space Grotesk', sans-serif !important;
    letter-spacing: -0.025em !important;
    color: var(--text-primary) !important;
}

h1 { font-weight: 700 !important; }
h2 { font-weight: 600 !important; }
h3 { font-weight: 600 !important; }

/* ── KPI / Metric Cards ── */
[data-testid="stMetric"] {
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-lg) !important;
    padding: 20px 24px !important;
    box-shadow: var(--shadow-sm) !important;
    transition: var(--transition) !important;
}

[data-testid="stMetric"]:hover {
    box-shadow: var(--shadow-md) !important;
    transform: translateY(-2px) !important;
    border-color: var(--primary-light) !important;
}

[data-testid="stMetricLabel"] {
    font-size: 0.78rem !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.06em !important;
    color: var(--text-muted) !important;
}

[data-testid="stMetricValue"] {
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 1.85rem !important;
    font-weight: 700 !important;
    color: var(--text-primary) !important;
}

[data-testid="stMetricDelta"] {
    font-weight: 600 !important;
    font-size: 0.82rem !important;
}

/* ── Buttons ── */
.stButton > button {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: var(--radius-md) !important;
    padding: 10px 24px !important;
    font-weight: 600 !important;
    font-size: 0.88rem !important;
    letter-spacing: 0.01em !important;
    box-shadow: 0 2px 8px rgba(10,94,181,0.25) !important;
    transition: var(--transition) !important;
    cursor: pointer !important;
}

.stButton > button:hover {
    box-shadow: 0 4px 16px rgba(10,94,181,0.35) !important;
    transform: translateY(-1px) !important;
}

.stButton > button:active {
    transform: translateY(0) !important;
    box-shadow: 0 1px 4px rgba(10,94,181,0.2) !important;
}

/* ── Tabs ── */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px !important;
    background: var(--border-light) !important;
    padding: 4px !important;
    border-radius: var(--radius-md) !important;
}

.stTabs [data-baseweb="tab"] {
    border-radius: var(--radius-sm) !important;
    padding: 10px 20px !important;
    font-weight: 500 !important;
    font-size: 0.88rem !important;
    color: var(--text-muted) !important;
    background: transparent !important;
    border: none !important;
    transition: var(--transition) !important;
}

.stTabs [aria-selected="true"] {
    background: var(--bg-card) !important;
    color: var(--primary) !important;
    font-weight: 600 !important;
    box-shadow: var(--shadow-sm) !important;
}

.stTabs [data-baseweb="tab-highlight"] {
    display: none !important;
}

/* ── Expander ── */
.streamlit-expanderHeader {
    font-weight: 600 !important;
    font-size: 0.92rem !important;
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-md) !important;
}

/* ── Selectbox / Inputs ── */
.stSelectbox > div > div, .stTextInput > div > div > input,
.stNumberInput > div > div > input, .stTextArea > div > div > textarea {
    border-radius: var(--radius-md) !important;
    border: 1.5px solid var(--border) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.9rem !important;
    transition: var(--transition) !important;
}

.stSelectbox > div > div:focus-within, .stTextInput > div > div > input:focus,
.stNumberInput > div > div > input:focus, .stTextArea > div > div > textarea:focus {
    border-color: var(--primary-light) !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
}

/* ── Dataframes ── */
.stDataFrame {
    border-radius: var(--radius-lg) !important;
    overflow: hidden !important;
    border: 1px solid var(--border) !important;
}

/* ── Progress bars ── */
.stProgress > div > div > div {
    background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%) !important;
    border-radius: 100px !important;
}

/* ── Alerts ── */
.stAlert {
    border-radius: var(--radius-md) !important;
    border: none !important;
    font-size: 0.88rem !important;
}

/* ── Plotly charts ── */
.js-plotly-plot {
    border-radius: var(--radius-lg) !important;
    overflow: hidden !important;
}

/* ── Custom card classes ── */
.hero-banner {
    background: linear-gradient(135deg, #0A3D6B 0%, #0A5EB5 50%, #1E88E5 100%);
    border-radius: var(--radius-xl);
    padding: 40px 48px;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-xl);
    margin-bottom: 32px;
}

.hero-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
}

.hero-banner::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%);
    border-radius: 50%;
}

.hero-banner h1 {
    color: white !important;
    font-size: 2.2rem !important;
    margin-bottom: 8px !important;
    position: relative;
    z-index: 1;
}

.hero-banner p {
    color: rgba(255,255,255,0.85) !important;
    font-size: 1.05rem !important;
    position: relative;
    z-index: 1;
    line-height: 1.6;
}

.stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.stat-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
    border-color: var(--primary-light);
}

.stat-card .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    margin-bottom: 14px;
}

.stat-card .stat-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.1;
}

.stat-card .stat-label {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-top: 4px;
}

.info-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
}

.info-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.section-header i {
    color: var(--primary);
    font-size: 1.1rem;
}

.section-header h3 {
    margin: 0 !important;
    font-size: 1.15rem !important;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.03em;
}

.badge-critical { background: #FEE2E2; color: #991B1B; }
.badge-high { background: #FFF7ED; color: #9A3412; }
.badge-medium { background: #FEFCE8; color: #854D0E; }
.badge-low { background: #F0FDF4; color: #166534; }
.badge-active { background: #EBF4FF; color: #1E40AF; }

.timeline-item {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-left: 2px solid var(--primary-light);
    margin-left: 16px;
    padding-left: 24px;
    position: relative;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: -7px;
    top: 20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--primary);
    border: 3px solid var(--primary-bg);
}

.risk-bar {
    height: 8px;
    border-radius: 100px;
    background: var(--border-light);
    overflow: hidden;
    margin-top: 6px;
}

.risk-bar-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Animations ── */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.animate-in {
    animation: fadeInUp 0.5s ease-out forwards;
}

.animate-slide {
    animation: slideInLeft 0.4s ease-out forwards;
}

.animate-pulse {
    animation: pulse 2s ease-in-out infinite;
}

/* ── Login Page ── */
.login-container {
    max-width: 420px;
    margin: 60px auto;
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 48px 40px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
}

.login-logo {
    text-align: center;
    margin-bottom: 32px;
}

.login-logo i {
    font-size: 3rem;
    color: var(--primary);
    margin-bottom: 16px;
    display: block;
}

.login-logo h2 {
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 1.5rem !important;
    margin: 0 !important;
    color: var(--text-primary) !important;
}

.login-logo p {
    color: var(--text-muted);
    font-size: 0.88rem;
    margin-top: 8px;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--border-light); }
::-webkit-scrollbar-thumb { background: #94A3B8; border-radius: 100px; }
::-webkit-scrollbar-thumb:hover { background: #64748B; }

/* ── Responsive ── */
@media (max-width: 768px) {
    .main .block-container {
        padding: 1rem 1rem !important;
    }
    .hero-banner {
        padding: 28px 24px;
    }
    .hero-banner h1 {
        font-size: 1.6rem !important;
    }
}
</style>
"""


def inject_theme():
    """Inject the premium CSS theme into Streamlit."""
    import streamlit as st
    st.markdown(GOOGLE_FONTS, unsafe_allow_html=True)
    st.markdown(THEME_CSS, unsafe_allow_html=True)


def hero_banner(title: str, subtitle: str, extra_html: str = ""):
    """Render the hero banner section."""
    import streamlit as st
    st.markdown(f"""
    <div class="hero-banner animate-in">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {extra_html}
    </div>
    """, unsafe_allow_html=True)


def stat_card(icon: str, value: str, label: str, color: str = "#0A5EB5", icon_bg: str = "#EBF4FF"):
    """Render a stat card with icon."""
    return f"""
    <div class="stat-card animate-in">
        <div class="stat-icon" style="background:{icon_bg}; color:{color};">
            <i class="fa-solid {icon}"></i>
        </div>
        <div class="stat-value" style="color:{color};">{value}</div>
        <div class="stat-label">{label}</div>
    </div>
    """


def section_header(icon: str, title: str):
    """Render a section header with icon."""
    import streamlit as st
    st.markdown(f"""
    <div class="section-header">
        <i class="fa-solid {icon}"></i>
        <h3>{title}</h3>
    </div>
    """, unsafe_allow_html=True)


def info_card(title: str, icon: str, content_html: str):
    """Render an info card."""
    import streamlit as st
    st.markdown(f"""
    <div class="info-card animate-in">
        <div class="info-card-header">
            <i class="fa-solid {icon}" style="color:var(--primary); font-size:1.1rem;"></i>
            <h4 style="margin:0; font-family:'Space Grotesk',sans-serif; font-weight:600;">{title}</h4>
        </div>
        {content_html}
    </div>
    """, unsafe_allow_html=True)


def badge(text: str, level: str = "active"):
    """Return badge HTML."""
    return f'<span class="badge badge-{level}">{text}</span>'


def risk_bar(value: float, color: str = "#0A5EB5"):
    """Render a risk/progress bar."""
    return f"""
    <div class="risk-bar">
        <div class="risk-bar-fill" style="width:{value}%; background:{color};"></div>
    </div>
    """
