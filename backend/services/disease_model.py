from pathlib import Path
import json

import numpy as np
import tensorflow as tf
from PIL import Image


# ============================================================
# PATHS
# ============================================================

BASE = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE / "ai" / "model" / "plant_disease_model.keras"
CLASS_NAMES_PATH = BASE / "ai" / "model" / "class_names.json"

IMAGE_SIZE = (224, 224)

# Initial safety threshold.
# We will tune this later using validation/calibration results.
LOW_CONFIDENCE_THRESHOLD = 0.60

_model = None
_classes = []


# ============================================================
# LOAD MODEL + CLASS NAMES
# ============================================================

def load():
    global _model, _classes

    # --------------------------------------------------------
    # MODEL
    # --------------------------------------------------------

    if not MODEL_PATH.exists():
        print("ERROR: Plant disease model not found.")
        print(f"Expected model: {MODEL_PATH}")

        _model = None
        _classes = []
        return

    print(f"Loading model: {MODEL_PATH}")

    try:
        _model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully.")

    except Exception as e:
        print("ERROR loading model:", e)

        _model = None
        _classes = []
        return

    # --------------------------------------------------------
    # CLASS NAMES
    # --------------------------------------------------------

    if not CLASS_NAMES_PATH.exists():
        print("ERROR: class_names.json not found.")
        print(f"Expected classes: {CLASS_NAMES_PATH}")

        _classes = []
        return

    print(f"Loading classes: {CLASS_NAMES_PATH}")

    try:
        _classes = json.loads(
            CLASS_NAMES_PATH.read_text(
                encoding="utf-8"
            )
        )

        if not isinstance(_classes, list):
            raise ValueError(
                "class_names.json must contain a JSON list."
            )

        _classes = [
            str(x).strip()
            for x in _classes
            if str(x).strip()
        ]

    except Exception as e:
        print("ERROR loading class_names.json:", e)

        _classes = []
        return

    print(f"Loaded {len(_classes)} classes.")

    # --------------------------------------------------------
    # VERIFY MODEL OUTPUT
    # --------------------------------------------------------

    try:
        print(
            f"Model output shape: {_model.output_shape}"
        )

        model_classes = int(
            _model.output_shape[-1]
        )

        if model_classes != len(_classes):

            print(
                "WARNING: Model output classes "
                f"({model_classes}) != "
                f"class_names.json ({len(_classes)})"
            )

        else:

            print(
                f"[OK] Model and class names match: "
                f"{model_classes} classes"
            )

    except Exception as e:
        print(
            "WARNING: Could not verify model output:",
            e
        )


# ============================================================
# LABEL PARSER
# ============================================================

def _split_label(label):
    """
    Supports the new training format:

        Apple / Apple Scab
        Tomato / Late Blight
        Potato / Healthy

    Also supports the older format if encountered.
    """

    label = str(label).strip()

    # New format
    if " / " in label:

        plant, disease = label.split(
            " / ",
            1
        )

        return (
            plant.strip(),
            disease.strip()
        )

    # Older PlantVillage-style format
    if "___" in label:

        plant, disease = label.split(
            "___",
            1
        )

        plant = (
            plant
            .replace("__", " ")
            .replace("_", " ")
            .strip()
        )

        disease = (
            disease
            .replace("_", " ")
            .strip()
        )

        return plant, disease

    # Fallback
    return "Unknown", label


# ============================================================
# HEALTH CHECK
# ============================================================

def model_ready():

    if _model is None or not _classes:
        load()

    return (
        _model is not None
        and len(_classes) > 0
    )


# ============================================================
# PREDICT IMAGE
# ============================================================

def predict_image(image: Image.Image):

    global _model

    # --------------------------------------------------------
    # LOAD MODEL IF NEEDED
    # --------------------------------------------------------

    if _model is None or not _classes:
        load()

    if _model is None or not _classes:

        return {
            "plant": "Unknown",
            "disease": "Unable to diagnose",
            "confidence": 0.0,
            "confidence_percent": 0.0,
            "is_healthy": False,
            "is_uncertain": True,
            "demo": False,
            "top_predictions": [],
            "message": (
                "AI model or class labels "
                "are not available."
            )
        }

    # --------------------------------------------------------
    # IMAGE VALIDATION
    # --------------------------------------------------------

    try:

        if image is None:

            return {
                "plant": "Unknown",
                "disease": "Invalid image",
                "confidence": 0.0,
                "confidence_percent": 0.0,
                "is_healthy": False,
                "is_uncertain": True,
                "demo": False,
                "top_predictions": [],
                "message": "No image was provided."
            }

        # Convert to RGB
        image = image.convert("RGB")

        # Resize to MobileNetV2 input size
        image = image.resize(
            IMAGE_SIZE,
            Image.Resampling.LANCZOS
        )

        # Convert image to numpy
        arr = np.asarray(
            image,
            dtype=np.float32
        )

        # IMPORTANT:
        #
        # DO NOT call:
        #
        # tf.keras.applications.mobilenet_v2.preprocess_input()
        #
        # here.
        #
        # The trained PlantCare model already contains
        # MobileNetV2 preprocessing inside the model.

        arr = np.expand_dims(
            arr,
            axis=0
        )

    except Exception as e:

        print(
            "ERROR preprocessing image:",
            e
        )

        return {
            "plant": "Unknown",
            "disease": "Invalid image",
            "confidence": 0.0,
            "confidence_percent": 0.0,
            "is_healthy": False,
            "is_uncertain": True,
            "demo": False,
            "top_predictions": [],
            "message": str(e)
        }

    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    try:

        pred = _model.predict(
            arr,
            verbose=0
        )[0]

    except Exception as e:

        print(
            "ERROR during prediction:",
            e
        )

        return {
            "plant": "Unknown",
            "disease": "Prediction failed",
            "confidence": 0.0,
            "confidence_percent": 0.0,
            "is_healthy": False,
            "is_uncertain": True,
            "demo": False,
            "top_predictions": [],
            "message": str(e)
        }

    # --------------------------------------------------------
    # OUTPUT VALIDATION
    # --------------------------------------------------------

    if len(pred) != len(_classes):

        return {
            "plant": "Unknown",
            "disease": "Model configuration error",
            "confidence": 0.0,
            "confidence_percent": 0.0,
            "is_healthy": False,
            "is_uncertain": True,
            "demo": False,
            "top_predictions": [],
            "message": (
                "Model output and class names "
                "do not match."
            )
        }

    # --------------------------------------------------------
    # SAFETY CHECK
    # --------------------------------------------------------

    if not np.all(np.isfinite(pred)):

        return {
            "plant": "Unknown",
            "disease": "Invalid model output",
            "confidence": 0.0,
            "confidence_percent": 0.0,
            "is_healthy": False,
            "is_uncertain": True,
            "demo": False,
            "top_predictions": [],
            "message": (
                "The model returned invalid "
                "prediction values."
            )
        }

    # --------------------------------------------------------
    # TOP PREDICTIONS
    # --------------------------------------------------------

    order = np.argsort(
        pred
    )[::-1]

    top_idx = int(
        order[0]
    )

    confidence = float(
        pred[top_idx]
    )

    label = _classes[top_idx]

    plant, disease = _split_label(
        label
    )

    # --------------------------------------------------------
    # TOP 5
    # --------------------------------------------------------

    top_predictions = []

    for idx in order[:5]:

        idx = int(idx)

        if idx >= len(_classes):
            continue

        prediction_label = _classes[idx]

        p_plant, p_disease = _split_label(
            prediction_label
        )

        prediction_confidence = float(
            pred[idx]
        )

        top_predictions.append({

            "plant": p_plant,

            "disease": p_disease,

            "confidence": round(
                prediction_confidence,
                4
            ),

            "confidence_percent": round(
                prediction_confidence * 100,
                2
            ),

            "label": prediction_label
        })

    # --------------------------------------------------------
    # CONFIDENCE CHECK
    # --------------------------------------------------------

    is_uncertain = (
        confidence
        < LOW_CONFIDENCE_THRESHOLD
    )

    # --------------------------------------------------------
    # HEALTH CHECK
    # --------------------------------------------------------

    is_healthy = (

        "healthy"
        in disease.lower()

        and not is_uncertain
    )

    # --------------------------------------------------------
    # UNCERTAIN RESPONSE
    # --------------------------------------------------------

    if is_uncertain:

        return {

            "plant": "Uncertain",

            "disease": "Uncertain diagnosis",

            "confidence": round(
                confidence,
                4
            ),

            "confidence_percent": round(
                confidence * 100,
                2
            ),

            "is_healthy": False,

            "is_uncertain": True,

            "demo": False,

            "top_predictions":
                top_predictions,

            "message": (
                "The AI could not identify "
                "the plant disease with "
                "sufficient confidence. "
                "Please upload a clear, "
                "well-lit image of the "
                "affected leaf."
            )
        }

    # --------------------------------------------------------
    # FINAL CONFIDENT RESPONSE
    # --------------------------------------------------------

    return {

        "plant": plant,

        "disease": disease,

        "confidence": round(
            confidence,
            4
        ),

        "confidence_percent": round(
            confidence * 100,
            2
        ),

        "is_healthy": is_healthy,

        "is_uncertain": False,

        "demo": False,

        "top_predictions":
            top_predictions,

        "message": (
            "Prediction generated "
            "successfully."
        )
    }


# ============================================================
# LOAD MODEL WHEN MODULE STARTS
# ============================================================

#try:

#    load()

#except Exception as e:

  #  print(
  #      "WARNING: Model initialization "
  #      f"failed: {e}"
  #  )