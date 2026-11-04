import re


URGENT_KEYWORDS = [
    "exposed wire",
    "live wire",
    "electrocution",
    "gas leak",
    "building collapse",
    "fire hazard",
    "immediate danger",
]

HIGH_KEYWORDS = [
    "accident",
    "accidents",
    "dangerous",
    "danger",
    "severe flooding",
    "major pothole",
    "huge pothole",
    "broken manhole",
    "open manhole",
    "electric shock",
    "blocked emergency exit",
]

MEDIUM_KEYWORDS = [
    "garbage",
    "waste",
    "water leakage",
    "streetlight",
    "street light",
    "drainage",
    "pothole",
    "waterlogging",
    "overflowing bin",
]


def predict_priority(title, description):
    """
    Estimate complaint priority using keyword rules.

    This is a baseline rule-based predictor,
    not a trained machine-learning model.
    """

    text = f"{title} {description}".lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    # Immediate safety hazards receive the highest priority.
    for keyword in URGENT_KEYWORDS:
        if keyword in text:
            return {
                "priority": "URGENT",
                "confidence": 0.95,
                "method": "keyword_baseline",
                "reason": f"Potential immediate safety hazard: {keyword}",
            }

    # Serious hazards and accident risks.
    for keyword in HIGH_KEYWORDS:
        if keyword in text:
            return {
                "priority": "HIGH",
                "confidence": 0.85,
                "method": "keyword_baseline",
                "reason": f"Potentially serious civic issue: {keyword}",
            }

    # Common civic maintenance issues.
    for keyword in MEDIUM_KEYWORDS:
        if keyword in text:
            return {
                "priority": "MEDIUM",
                "confidence": 0.70,
                "method": "keyword_baseline",
                "reason": f"Recognized civic maintenance issue: {keyword}",
            }

    return {
        "priority": "LOW",
        "confidence": 0.50,
        "method": "keyword_baseline",
        "reason": "No configured high-risk keywords were detected.",
    }