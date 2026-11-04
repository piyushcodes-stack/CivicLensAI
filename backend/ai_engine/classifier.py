import re

CATEGORIES = {
    "ROADS": [
        "pothole",
        "hole in road",
        "road damage",
        "broken road",
        "cracked road",
        "damaged road",
        "broken pavement",
    ],
    "GARBAGE": [
        "garbage",
        "rubbish",
        "trash",
        "waste",
        "dump",
        "overflowing bin",
        "litter",
    ],
    "WATER": [
        "water supply",
        "no water",
        "water shortage",
        "water leak",
        "leaking pipe",
        "pipe burst",
        "water wastage",
    ],
    "ELECTRICITY": [
        "streetlight",
        "street light",
        "lamp post",
        "dark street",
        "light not working",
        "power outage",
        "electricity",
        "broken street light",
    ],
    "DRAINAGE": [
        "drainage",
        "blocked drain",
        "open drain",
        "sewage",
        "waterlogging",
        "flooded street",
        "drain blocked",
    ],
    "PUBLIC_SAFETY": [
        "unsafe",
        "dangerous",
        "accident risk",
        "exposed wire",
        "broken manhole cover",
        "public safety",
    ],
}


def classify_complaint(title, description):
    """
    Suggest a complaint category using keyword matching.
    The returned category matches Django's Complaint.Category choices.
    """

    text = f"{title} {description}".lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    scores = {}

    for category, keywords in CATEGORIES.items():
        score = sum(
            1 for keyword in keywords
            if keyword in text
        )

        if score:
            scores[category] = score

    if not scores:
        return {
            "category": "OTHER",
            "confidence": 0.0,
            "method": "keyword_baseline",
        }

    best_category = max(
        scores,
        key=scores.get
    )

    total_matches = sum(scores.values())

    return {
        "category": best_category,
        "confidence": round(
            scores[best_category] / total_matches,
            2
        ),
        "method": "keyword_baseline",
    }