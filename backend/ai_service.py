"""
AI/ML Health Prediction Service
Uses a rule-based clinical engine to predict health conditions from blood test values.
This simulates an external AI/ML Health API integration.
"""


def analyze_health(glucose, haemoglobin, cholesterol):
    """
    Analyze blood test values and predict possible health conditions.

    Args:
        glucose (float): Blood glucose level (mg/dL)
        haemoglobin (float): Haemoglobin level (g/dL)
        cholesterol (float): Total cholesterol level (mg/dL)

    Returns:
        str: AI-generated health prediction/remarks
    """
    predictions = []

    # Glucose analysis
    if glucose < 70:
        predictions.append("🔴 CRITICAL: Hypoglycemia detected (low blood sugar). "
                           "Immediate medical attention recommended.")
    elif 70 <= glucose <= 99:
        predictions.append("✅ Normal glucose levels. No diabetes risk detected.")
    elif 100 <= glucose <= 125:
        predictions.append("🟡 BORDERLINE: Prediabetes detected (Impaired Fasting Glucose). "
                           "Lifestyle changes and monitoring recommended.")
    else:
        predictions.append("🔴 HIGH RISK: Elevated glucose levels detected. "
                           "Possible Type 2 Diabetes. Consult a physician immediately.")

    # Haemoglobin analysis
    if haemoglobin < 12.0:
        predictions.append("🔴 LOW: Low haemoglobin levels detected. "
                           "Possible anemia. Iron supplementation and dietary changes recommended.")
    elif 12.0 <= haemoglobin <= 13.5:
        predictions.append("🟡 BORDERLINE: Haemoglobin levels are slightly below optimal. "
                           "Monitor and maintain a balanced diet.")
    elif 13.6 <= haemoglobin <= 17.5:
        predictions.append("✅ Normal haemoglobin levels. Healthy oxygen-carrying capacity.")
    else:
        predictions.append("🟡 ELEVATED: High haemoglobin levels detected. "
                           "May indicate dehydration or other conditions. Further testing advised.")

    # Cholesterol analysis
    if cholesterol < 125:
        predictions.append("✅ Optimal cholesterol levels. Low cardiovascular risk.")
    elif 125 <= cholesterol <= 199:
        predictions.append("✅ Normal cholesterol levels. Maintain healthy diet and exercise.")
    elif 200 <= cholesterol <= 239:
        predictions.append("🟡 BORDERLINE: Elevated cholesterol levels. "
                           "Risk of cardiovascular disease. Dietary changes recommended.")
    else:
        predictions.append("🔴 HIGH RISK: High cholesterol detected. "
                           "Significant risk of heart disease and stroke. "
                           "Medical consultation strongly advised.")

    # Overall health summary
    risk_count = sum(1 for p in predictions if p.startswith("🔴"))
    border_count = sum(1 for p in predictions if p.startswith("🟡"))

    if risk_count >= 2:
        summary = ("\n\n⚠️ OVERALL ASSESSMENT: Multiple critical markers detected. "
                   "Urgent medical consultation recommended.")
    elif risk_count == 1 or border_count >= 2:
        summary = ("\n\n📋 OVERALL ASSESSMENT: Some markers require attention. "
                   "Follow-up with healthcare provider advised.")
    else:
        summary = ("\n\n✅ OVERALL ASSESSMENT: Your blood test results appear generally healthy. "
                   "Continue regular check-ups and maintain a healthy lifestyle.")

    return " | ".join(predictions) + summary