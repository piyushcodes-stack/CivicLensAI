from ai_engine.classifier import classify_complaint

examples = [
    (
        "Large pothole",
        "There is a huge pothole on the road near the bus stop."
    ),
    (
        "Garbage problem",
        "Garbage has been accumulating near our building for three days."
    ),
    (
        "Street light broken",
        "The streetlight is not working and the road is dark at night."
    ),
    (
        "Blocked drain",
        "The drainage is blocked and sewage water is overflowing."
    ),
]

for title, description in examples:
    result = classify_complaint(title, description)
    print(f"\nComplaint: {title}")
    print(f"AI suggestion: {result['category']}")
    print(f"Confidence: {result['confidence']}")