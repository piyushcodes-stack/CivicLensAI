import re
from difflib import SequenceMatcher


def normalize_text(text):
    """Normalize text for basic complaint similarity comparison."""
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def similarity_score(text1, text2):
    """Return a basic text similarity score between 0 and 1."""
    first = normalize_text(text1)
    second = normalize_text(text2)

    if not first or not second:
        return 0.0

    return round(SequenceMatcher(None, first, second).ratio(), 3)


def detect_duplicate(title, description, existing_complaints, threshold=0.75):
    """
    Compare a new complaint with existing complaints.

    existing_complaints should contain dictionaries with:
    id, title, description.

    Returns the closest match if similarity meets the threshold.
    This is a baseline text-matching method, not a trained ML model.
    """
    new_text = f"{title} {description}".strip()

    if not normalize_text(new_text):
        return {
            "duplicate_found": False,
            "message": "Provide a complaint title or description.",
            "match": None,
        }

    best_match = None
    best_score = 0.0

    for complaint in existing_complaints:
        existing_text = (
            f"{complaint.get('title', '')} "
            f"{complaint.get('description', '')}"
        ).strip()

        score = similarity_score(new_text, existing_text)

        if score > best_score:
            best_score = score
            best_match = complaint

    if best_match and best_score >= threshold:
        return {
            "duplicate_found": True,
            "similarity": best_score,
            "message": "A potentially similar complaint was found.",
            "match": {
                "id": best_match.get("id"),
                "title": best_match.get("title"),
                "similarity": best_score,
            },
        }

    return {
        "duplicate_found": False,
        "similarity": best_score,
        "message": "No sufficiently similar complaint was found.",
        "match": None,
    }