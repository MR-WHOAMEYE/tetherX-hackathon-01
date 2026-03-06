"""
Drug Interaction Detection Service
Checks for medication conflicts before prescription.
"""
from database.db import get_connection


def get_known_interactions():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM drug_interactions ORDER BY severity DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def check_interactions(drug_list: list) -> list:
    """Check a list of drugs for known interactions."""
    interactions = get_known_interactions()
    found = []
    drug_names = [d.split(" ")[0].lower() for d in drug_list]  # Normalize

    for interaction in interactions:
        a = interaction["drug_a"].split(" ")[0].lower()
        b = interaction["drug_b"].split(" ")[0].lower()
        if a in drug_names and b in drug_names:
            found.append(interaction)
        elif any(a in d.lower() for d in drug_list) and any(b in d.lower() for d in drug_list):
            found.append(interaction)

    return found


def check_new_drug(existing_drugs: list, new_drug: str) -> list:
    """Check if a new drug interacts with existing medications."""
    interactions = get_known_interactions()
    found = []
    new_name = new_drug.split(" ")[0].lower()

    for interaction in interactions:
        a = interaction["drug_a"].split(" ")[0].lower()
        b = interaction["drug_b"].split(" ")[0].lower()
        matched_existing = False
        for ed in existing_drugs:
            ed_lower = ed.lower()
            if (a == new_name and (b in ed_lower or ed_lower.startswith(b))) or \
               (b == new_name and (a in ed_lower or ed_lower.startswith(a))):
                matched_existing = True
                break
        if matched_existing:
            found.append(interaction)

    return found


def get_severity_color(severity: str) -> str:
    return {
        "contraindicated": "#991B1B",
        "severe": "#DC2626",
        "moderate": "#EA580C",
        "mild": "#CA8A04",
    }.get(severity, "#6B7280")


def get_severity_icon(severity: str) -> str:
    return {
        "contraindicated": "🚫",
        "severe": "🔴",
        "moderate": "🟠",
        "mild": "🟡",
    }.get(severity, "⚪")
