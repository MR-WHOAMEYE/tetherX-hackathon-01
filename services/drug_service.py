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
    """Check a list of drugs for known and ML-inferred (GNN) interactions."""
    # 1. First Pass: Base SQL Rules
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

    # 2. Second Pass: Deep Graph Features (GNN)
    from services.ml_engine import ml_registry
    import itertools

    # Iterate over all possible pairs in the prescription
    for drug_a, drug_b in itertools.combinations(drug_names, 2):
        score = ml_registry.drug_gnn.check_interaction(drug_a, [drug_b])
        if score > 0.85: # Require higher threshold for bulk lists
            found.append({
                "drug_a": drug_a.capitalize(),
                "drug_b": drug_b.capitalize(),
                "severity": "moderate" if score < 0.95 else "severe",
                "description": f"[GNN Latent Match] Network detected a {round(score*100, 1)}% latent interference.",
                "action": "Requires physician sign-off against GNN-flagged topology."
            })

    return found


def check_new_drug(existing_drugs: list, new_drug: str) -> list:
    """Check if a new drug interacts using Hybrid: SQL (Known) + GNN (Latent)."""
    # 1. First Pass: Hardcoded Known Rules (High Confidence SQL Lookups)
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

    # 2. Second Pass: Relational GNN Inference for unmapped structural interactions
    from services.ml_engine import ml_registry
    gnn_score = ml_registry.drug_gnn.check_interaction(new_name, existing_drugs)
    
    # If the GNN finds a strong latent topological overlap, synthesize an alert
    if gnn_score > 0.8:
        # Check if we already flagged it via rules
        already_flagged = any("GNN-detected" in f.get("description", "") for f in found)
        if not already_flagged:
            found.append({
                "drug_a": new_name.capitalize(),
                "drug_b": "Existing Routine",
                "severity": "moderate" if gnn_score < 0.9 else "severe",
                "description": f"[GNN Latent Match] AI flagged a {round(gnn_score*100, 1)}% compositional interference risk.",
                "action": "Needs clinical review; graph neural network detected structural interaction."
            })

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
