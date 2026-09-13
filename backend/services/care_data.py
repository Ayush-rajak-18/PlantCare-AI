"""
Disease-aware plant care recommendations.

Instead of hardcoding one advice-list per exact class name (which breaks the
moment you add a new class to the dataset), this matches on keywords found in
the plant name and the disease name. That means it automatically produces
sensible, different advice for every disease your model is trained on -
Tomato Early Blight gets different tips than Tomato Leaf Mold, Potato Late
Blight, Apple Scab, etc. - with no extra code needed when you add classes.
"""

PLANT_BASICS = {
    "tomato": [
        "Water at soil level and keep foliage as dry as possible.",
        "Give tomatoes 6-8 hours of direct sunlight a day.",
        "Space plants for airflow and stake/cage them off the ground.",
    ],
    "potato": [
        "Keep soil consistently moist during tuber development, but avoid waterlogging.",
        "Hill soil around the base of the plant to protect developing tubers.",
        "Rotate potato beds each season to reduce soil-borne disease buildup.",
    ],
    "pepper": [
        "Water deeply but infrequently, letting the top inch of soil dry between waterings.",
        "Peppers like full sun and warm soil - avoid cold, wet conditions.",
        "Feed with a balanced fertilizer once fruit starts to set.",
    ],
    "apple": [
        "Water deeply during dry spells, especially for young trees.",
        "Prune every winter to keep an open canopy for airflow and light.",
        "Rake and remove fallen leaves/fruit at season end to cut disease carryover.",
    ],
    "corn": [
        "Corn is a heavy feeder - side-dress with nitrogen once plants are knee-high.",
        "Plant in blocks rather than single rows to improve pollination.",
        "Keep the base weed-free and water consistently during tasseling.",
    ],
    "grape": [
        "Water deeply but infrequently once vines are established.",
        "Prune and train vines for open canopy airflow.",
        "Remove leaf litter and mummified fruit after harvest.",
    ],
    "strawberry": [
        "Water at the base in the morning so leaves dry out during the day.",
        "Mulch under fruit to keep berries off damp soil.",
        "Thin runners so plants aren't overcrowded.",
    ],
}

GENERIC_PLANT_TIPS = [
    "Check the soil moisture with a finger before watering rather than following a fixed schedule.",
    "Make sure the plant is getting the light level it needs - too little light also causes weak, unhealthy growth.",
    "Use a pot or bed with good drainage so roots don't sit in water.",
]

# Keyword -> targeted treatment/prevention tips. Checked against the
# lower-cased disease name, so it matches regardless of exact class naming.
DISEASE_KEYWORD_TIPS = [
    ("early blight", [
        "Remove and destroy lower leaves showing dark concentric-ring spots.",
        "Apply a copper-based or chlorothalonil fungicide labelled for early blight, following the label instructions.",
        "Avoid overhead watering and increase spacing to reduce leaf wetness.",
    ]),
    ("late blight", [
        "Late blight spreads fast in cool, wet weather - remove infected leaves/plants promptly and don't compost them.",
        "Apply a fungicide labelled for late blight as soon as symptoms appear.",
        "Avoid working in the field/garden while foliage is wet to prevent spreading spores.",
    ]),
    ("bacterial spot", [
        "Bacterial spot cannot be cured with fungicides - remove severely affected leaves to slow spread.",
        "A copper-based bactericide can help protect new growth if applied early.",
        "Avoid overhead irrigation and don't handle plants when leaves are wet.",
    ]),
    ("leaf mold", [
        "Improve ventilation and reduce humidity around the plant - leaf mold thrives in still, damp air.",
        "Remove and dispose of affected leaves.",
        "Space plants further apart or prune to open up the canopy.",
    ]),
    ("scab", [
        "Rake and destroy fallen leaves in autumn to remove overwintering spores.",
        "Apply a preventive fungicide in spring before symptoms appear, per label instructions.",
        "Choose scab-resistant varieties for future planting where possible.",
    ]),
    ("rust", [
        "Remove and destroy infected leaves as soon as you see orange/rust-colored pustules.",
        "Improve airflow around the plant and avoid wetting foliage when watering.",
        "A sulfur or copper fungicide can help control spread if applied early.",
    ]),
    ("black rot", [
        "Prune out and destroy infected wood/fruit - black rot survives in dead plant material.",
        "Improve airflow through pruning and avoid injuring the bark.",
        "Apply a fungicide program starting at bud break if this has been a recurring problem.",
    ]),
    ("mosaic", [
        "Mosaic virus has no cure - remove and destroy infected plants to protect the rest of your crop.",
        "Control aphids and other sap-sucking insects, which spread the virus.",
        "Wash hands and tools between handling plants to avoid mechanical spread.",
    ]),
    ("yellow leaf curl", [
        "This is typically viral and spread by whiteflies - control whitefly populations with sticky traps or insecticidal soap.",
        "Remove and destroy severely infected plants so they don't act as a virus reservoir.",
        "Use reflective mulch or fine mesh netting to reduce whitefly landing.",
    ]),
    ("spider mite", [
        "Spray affected leaves (including undersides) with a strong jet of water to dislodge mites.",
        "Insecticidal soap or neem oil applied every 5-7 days can bring an infestation under control.",
        "Increase humidity around the plant - spider mites thrive in hot, dry conditions.",
    ]),
    ("septoria", [
        "Remove lower leaves with small dark spots as soon as they appear.",
        "Mulch around the base to stop soil-borne spores splashing onto leaves.",
        "Water at the base and avoid overhead irrigation.",
    ]),
    ("mildew", [
        "Improve airflow and avoid overcrowding - powdery/downy mildew thrives in humid, still air.",
        "Remove heavily affected leaves and avoid wetting foliage when watering.",
        "A sulfur-based or potassium bicarbonate fungicide can help control active infections.",
    ]),
    ("blight", [
        "Remove and destroy affected foliage promptly to slow spread.",
        "Apply an appropriate fungicide and avoid overhead watering.",
        "Rotate crops next season and avoid planting the same family in the same spot.",
    ]),
    ("spot", [
        "Remove leaves with spots to reduce the source of new spores.",
        "Water at the base of the plant and keep foliage dry where possible.",
        "Ensure good spacing and airflow between plants.",
    ]),
]

HEALTHY_TIPS = [
    "The plant looks healthy - keep up the current watering and light routine.",
    "Keep monitoring the underside of leaves weekly for early signs of pests or spots.",
    "Feed on a normal schedule for this plant type; no treatment is needed right now.",
]

UNCERTAIN_TIPS = [
    "The model isn't confident enough to give a reliable diagnosis from this photo.",
    "Try a clearer, well-lit close-up of the affected leaf, filling most of the frame.",
    "If symptoms are severe or spreading, it's worth checking with a local agricultural extension office.",
]


def get_care_recommendations(plant: str, disease: str, confidence: float, is_uncertain: bool = False) -> list:
    if is_uncertain:
        return UNCERTAIN_TIPS

    disease_lower = (disease or "").lower()
    plant_lower = (plant or "").lower()

    if "healthy" in disease_lower:
        base = PLANT_BASICS.get(plant_lower, GENERIC_PLANT_TIPS)
        return HEALTHY_TIPS + [base[0]] if base else HEALTHY_TIPS

    tips = []
    for keyword, keyword_tips in DISEASE_KEYWORD_TIPS:
        if keyword in disease_lower:
            tips = keyword_tips
            break

    if not tips:
        tips = [
            f"Isolate the plant if possible so {disease.lower()} doesn't spread to nearby plants.",
            "Remove and dispose of the most affected leaves rather than composting them.",
            "If symptoms worsen, a local nursery or extension office can confirm the exact treatment.",
        ]

    plant_tip = (PLANT_BASICS.get(plant_lower) or GENERIC_PLANT_TIPS)[0]
    return tips + [plant_tip]