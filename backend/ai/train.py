from pathlib import Path
import json
import random
import hashlib
from collections import Counter, defaultdict

import numpy as np
import tensorflow as tf

from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix


# ============================================================
# PlantCare AI
# ROBUST MULTI-DATASET PLANT DISEASE TRAINING
#
# DATASETS
#   1. PlantVillage
#   2. Mendeley
#   3. PlantDoc TRAIN
#
# EXTERNAL TEST
#   PlantDoc TEST
#
# MODEL
#   MobileNetV2 + Transfer Learning + Fine Tuning
#
# IMPORTANT
#   PlantDoc TEST is NEVER used for training.
# ============================================================


# ============================================================
# 1. CONFIGURATION
# ============================================================

SEED = 42

random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)


BASE = Path(__file__).resolve().parents[1]

DATASET_DIR = BASE / "dataset"

# ------------------------------------------------------------
# Dataset locations
# ------------------------------------------------------------

PLANTVILLAGE_DIR = DATASET_DIR / "PlantVillage" / "PlantVillage"

MENDELEY_DIR = DATASET_DIR / "Mendeley"

PLANTDOC_DIR = DATASET_DIR / "PlantDoc-Dataset"

PLANTDOC_TRAIN_DIR = PLANTDOC_DIR / "train"

PLANTDOC_TEST_DIR = PLANTDOC_DIR / "test"


# ============================================================
# 2. MODEL OUTPUT LOCATIONS
# ============================================================

MODEL_DIR = BASE / "ai" / "model"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_PATH = MODEL_DIR / "plant_disease_model.keras"

CLASS_PATH = MODEL_DIR / "class_names.json"

METRICS_PATH = MODEL_DIR / "metrics.json"

REPORT_PATH = MODEL_DIR / "classification_report.txt"

CM_PATH = MODEL_DIR / "confusion_matrix.json"

PLANTDOC_REPORT_PATH = (
    MODEL_DIR / "plantdoc_test_report.txt"
)

PLANTDOC_CM_PATH = (
    MODEL_DIR / "plantdoc_confusion_matrix.json"
)

MANIFEST_PATH = (
    MODEL_DIR / "dataset_manifest.json"
)


# ============================================================
# 3. TRAINING SETTINGS
# ============================================================

IMG_SIZE = (224, 224)

BATCH_SIZE = 32

INITIAL_EPOCHS = 15

FINE_TUNE_EPOCHS = 15

# Minimum images required for a class.
#
# 50 gives a reasonable balance between:
#   - number of classes
#   - training reliability
#
MIN_IMAGES_PER_CLASS = 50

# None = use all available images
MAX_IMAGES_PER_CLASS = None

VALID_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
}


# ============================================================
# 4. START
# ============================================================

print("=" * 80)
print("             PlantCare AI - Robust Training Pipeline")
print("=" * 80)

print("\nDatasets:")
print("PlantVillage      :", PLANTVILLAGE_DIR)
print("Mendeley          :", MENDELEY_DIR)
print("PlantDoc TRAIN    :", PLANTDOC_TRAIN_DIR)
print("PlantDoc TEST     :", PLANTDOC_TEST_DIR)

print("\nModel:")
print(MODEL_PATH)


# ============================================================
# 5. DATASET VALIDATION
# ============================================================

print("\n" + "=" * 80)
print("DATASET VALIDATION")
print("=" * 80)


dataset_locations = [
    ("PlantVillage", PLANTVILLAGE_DIR),
    ("Mendeley", MENDELEY_DIR),
    ("PlantDoc Train", PLANTDOC_TRAIN_DIR),
    ("PlantDoc Test", PLANTDOC_TEST_DIR),
]


for name, path in dataset_locations:

    if path.exists():

        print(f"[OK] {name}")

    else:

        print(f"[WARNING] {name} NOT FOUND")
        print(f"        {path}")


if not PLANTVILLAGE_DIR.exists():
    raise SystemExit(
        "\nERROR: PlantVillage dataset not found."
    )

if not MENDELEY_DIR.exists():
    raise SystemExit(
        "\nERROR: Mendeley dataset not found."
    )

if not PLANTDOC_TRAIN_DIR.exists():
    raise SystemExit(
        "\nERROR: PlantDoc train dataset not found."
    )

if not PLANTDOC_TEST_DIR.exists():
    raise SystemExit(
        "\nERROR: PlantDoc test dataset not found."
    )


# ============================================================
# 6. SAFE CLASS NORMALIZATION
# ============================================================
#
# We DO NOT blindly convert:
#
#   Apple leaf -> Apple Healthy
#   Tomato leaf -> Tomato Healthy
#
# because that would create scientifically incorrect labels.
#
# Only clearly identifiable disease/healthy classes are mapped.
# ============================================================


def clean_name(name):

    name = name.strip()

    name = name.replace("___", " ")

    name = name.replace("__", " ")

    name = name.replace("_", " ")

    name = name.replace(",", " ")

    name = name.replace("(", " ")

    name = name.replace(")", " ")

    name = " ".join(name.split())

    return name.lower()


def normalize_class_name(raw_name):

    name = clean_name(raw_name)

    # --------------------------------------------------------
    # Ignore non-disease / ambiguous classes
    # --------------------------------------------------------

    ambiguous_classes = {

        "apple leaf",
        "bell pepper leaf",
        "blueberry leaf",
        "cherry leaf",
        "grape leaf",
        "peach leaf",
        "raspberry leaf",
        "soyabean leaf",
        "soybean leaf",
        "strawberry leaf",
        "tomato leaf",

        "background without leaves",
    }

    if name in ambiguous_classes:
        return None


    # ========================================================
    # APPLE
    # ========================================================

    if "apple" in name:

        if "scab" in name:
            return "Apple / Apple Scab"

        if "black rot" in name:
            return "Apple / Black Rot"

        if "cedar apple rust" in name:
            return "Apple / Rust"

        if "rust" in name:
            return "Apple / Rust"

        if "healthy" in name:
            return "Apple / Healthy"


    # ========================================================
    # BLUEBERRY
    # ========================================================

    if "blueberry" in name:

        if "healthy" in name:
            return "Blueberry / Healthy"


    # ========================================================
    # CHERRY
    # ========================================================

    if "cherry" in name:

        if "powdery mildew" in name:
            return "Cherry / Powdery Mildew"

        if "healthy" in name:
            return "Cherry / Healthy"


    # ========================================================
    # CORN / MAIZE
    # ========================================================

    if "corn" in name or "maize" in name:

        if (
            "cercospora" in name
            or "gray leaf spot" in name
        ):
            return "Corn / Gray Leaf Spot"

        if "common rust" in name:
            return "Corn / Common Rust"

        if (
            "corn rust" in name
            or "rust leaf" in name
        ):
            return "Corn / Common Rust"

        if "northern leaf blight" in name:
            return "Corn / Northern Leaf Blight"

        if "healthy" in name:
            return "Corn / Healthy"

        # PlantDoc has a more generic "Corn leaf blight".
        # Keep it separate rather than falsely calling it
        # Northern Leaf Blight.
        if "leaf blight" in name:
            return "Corn / Leaf Blight"


    # ========================================================
    # GRAPE
    # ========================================================

    if "grape" in name:

        if "black rot" in name:
            return "Grape / Black Rot"

        if "esca" in name or "black measles" in name:
            return "Grape / Esca"

        if (
            "leaf blight" in name
            or "isariopsis" in name
        ):
            return "Grape / Leaf Blight"

        if "healthy" in name:
            return "Grape / Healthy"


    # ========================================================
    # ORANGE
    # ========================================================

    if "orange" in name:

        if (
            "haunglongbing" in name
            or "huanglongbing" in name
            or "citrus greening" in name
        ):
            return "Orange / Citrus Greening"


    # ========================================================
    # PEACH
    # ========================================================

    if "peach" in name:

        if "bacterial spot" in name:
            return "Peach / Bacterial Spot"

        if "healthy" in name:
            return "Peach / Healthy"


    # ========================================================
    # PEPPER / BELL PEPPER
    # ========================================================

    if "pepper" in name:

        if (
            "bacterial spot" in name
            or "leaf spot" in name
        ):
            return "Pepper Bell / Bacterial Spot"

        if "healthy" in name:
            return "Pepper Bell / Healthy"


    # ========================================================
    # POTATO
    # ========================================================

    if "potato" in name:

        if "early blight" in name:
            return "Potato / Early Blight"

        if "late blight" in name:
            return "Potato / Late Blight"

        if "healthy" in name:
            return "Potato / Healthy"


    # ========================================================
    # RASPBERRY
    # ========================================================

    if "raspberry" in name:

        if "healthy" in name:
            return "Raspberry / Healthy"


    # ========================================================
    # SOYBEAN
    # ========================================================

    if (
        "soybean" in name
        or "soyabean" in name
    ):

        if "healthy" in name:
            return "Soybean / Healthy"


    # ========================================================
    # SQUASH
    # ========================================================

    if "squash" in name:

        if "powdery mildew" in name:
            return "Squash / Powdery Mildew"


    # ========================================================
    # STRAWBERRY
    # ========================================================

    if "strawberry" in name:

        if "leaf scorch" in name:
            return "Strawberry / Leaf Scorch"

        if "healthy" in name:
            return "Strawberry / Healthy"


    # ========================================================
    # TOMATO
    # ========================================================

    if "tomato" in name:

        if "bacterial spot" in name:
            return "Tomato / Bacterial Spot"

        if "early blight" in name:
            return "Tomato / Early Blight"

        if "late blight" in name:
            return "Tomato / Late Blight"

        if (
            "leaf mold" in name
            or "mold leaf" in name
        ):
            return "Tomato / Leaf Mold"

        if "septoria" in name:
            return "Tomato / Septoria Leaf Spot"

        if "spider mite" in name:
            return "Tomato / Spider Mites"

        if "target spot" in name:
            return "Tomato / Target Spot"

        if "mosaic virus" in name:
            return "Tomato / Mosaic Virus"

        if (
            "yellow leaf curl" in name
            or "yellow virus" in name
        ):
            return "Tomato / Yellow Leaf Curl Virus"

        if "healthy" in name:
            return "Tomato / Healthy"


    # ========================================================
    # UNKNOWN
    # ========================================================

    return None


# ============================================================
# 7. IMAGE HELPERS
# ============================================================


def is_valid_image(path):

    try:

        from PIL import Image

        with Image.open(path) as image:

            image.verify()

        return True

    except Exception:

        return False


def file_hash(path):

    try:

        hasher = hashlib.md5()

        with open(path, "rb") as file:

            while True:

                chunk = file.read(1024 * 1024)

                if not chunk:
                    break

                hasher.update(chunk)

        return hasher.hexdigest()

    except Exception:

        return None


# ============================================================
# 8. COLLECT DATASET
# ============================================================


def collect_dataset(
    dataset_path,
    dataset_name,
    allow_nested=True
):

    samples = []

    skipped_unknown = Counter()

    invalid_images = 0

    if not dataset_path.exists():

        return (
            samples,
            skipped_unknown,
            invalid_images
        )


    if allow_nested:

        files = dataset_path.rglob("*")

    else:

        files = dataset_path.glob("*")


    for image_path in files:

        if not image_path.is_file():
            continue

        if image_path.suffix.lower() not in VALID_EXTENSIONS:
            continue


        # Class folder is immediate parent
        raw_class = image_path.parent.name


        canonical_class = normalize_class_name(
            raw_class
        )


        if canonical_class is None:

            skipped_unknown[raw_class] += 1

            continue


        # Validate image
        if not is_valid_image(image_path):

            invalid_images += 1

            continue


        samples.append(
            {
                "path": str(image_path),
                "class_name": canonical_class,
                "source": dataset_name,
            }
        )


    return (
        samples,
        skipped_unknown,
        invalid_images
    )


# ============================================================
# 9. COLLECT TRAINING DATA
# ============================================================

print("\n" + "=" * 80)
print("COLLECTING TRAINING DATA")
print("=" * 80)


all_training_samples = []

dataset_statistics = {}


# ------------------------------------------------------------
# PlantVillage
# ------------------------------------------------------------

print("\n[1/3] Reading PlantVillage...")

pv_samples, pv_skipped, pv_invalid = collect_dataset(
    PLANTVILLAGE_DIR,
    "PlantVillage"
)

all_training_samples.extend(pv_samples)

dataset_statistics["PlantVillage"] = {
    "images": len(pv_samples),
    "invalid": pv_invalid,
    "skipped_classes": dict(pv_skipped),
}

print(
    f"PlantVillage usable images: {len(pv_samples)}"
)


# ------------------------------------------------------------
# Mendeley
# ------------------------------------------------------------

print("\n[2/3] Reading Mendeley...")

m_samples, m_skipped, m_invalid = collect_dataset(
    MENDELEY_DIR,
    "Mendeley"
)

all_training_samples.extend(m_samples)

dataset_statistics["Mendeley"] = {
    "images": len(m_samples),
    "invalid": m_invalid,
    "skipped_classes": dict(m_skipped),
}

print(
    f"Mendeley usable images: {len(m_samples)}"
)


# ------------------------------------------------------------
# PlantDoc TRAIN ONLY
# ------------------------------------------------------------

print("\n[3/3] Reading PlantDoc TRAIN...")

pd_train_samples, pd_train_skipped, pd_train_invalid = (
    collect_dataset(
        PLANTDOC_TRAIN_DIR,
        "PlantDoc"
    )
)

all_training_samples.extend(
    pd_train_samples
)

dataset_statistics["PlantDoc_Train"] = {
    "images": len(pd_train_samples),
    "invalid": pd_train_invalid,
    "skipped_classes": dict(pd_train_skipped),
}

print(
    f"PlantDoc train usable images: "
    f"{len(pd_train_samples)}"
)


if not all_training_samples:

    raise SystemExit(
        "\nERROR: No usable training images found."
    )


print(
    "\nRaw usable training images:",
    len(all_training_samples)
)


# ============================================================
# 10. COLLECT PLANTDOC EXTERNAL TEST
# ============================================================

print("\n" + "=" * 80)
print("COLLECTING PLANTDOC EXTERNAL TEST")
print("=" * 80)


plantdoc_test_samples, pd_test_skipped, pd_test_invalid = (
    collect_dataset(
        PLANTDOC_TEST_DIR,
        "PlantDoc_Test"
    )
)


dataset_statistics["PlantDoc_Test"] = {
    "images": len(plantdoc_test_samples),
    "invalid": pd_test_invalid,
    "skipped_classes": dict(pd_test_skipped),
}


print(
    "PlantDoc external test images:",
    len(plantdoc_test_samples)
)


# ============================================================
# 11. REMOVE DUPLICATES
# ============================================================
#
# IMPORTANT:
#
# If an exact same image exists in:
#
# PlantVillage
# Mendeley
# PlantDoc
#
# it should not appear in both training and testing.
#
# We therefore hash PlantDoc TEST first and remove any
# matching image from training.
# ============================================================

print("\n" + "=" * 80)
print("DUPLICATE / DATA LEAKAGE CHECK")
print("=" * 80)


print("\nHashing PlantDoc external test images...")


plantdoc_test_hashes = set()

for sample in plantdoc_test_samples:

    h = file_hash(sample["path"])

    if h is not None:

        plantdoc_test_hashes.add(h)


print(
    "PlantDoc test unique hashes:",
    len(plantdoc_test_hashes)
)


seen_training_hashes = set()

unique_training_samples = []

duplicate_training = 0

test_leakage_removed = 0


for sample in all_training_samples:

    h = file_hash(sample["path"])

    if h is None:
        continue


    # Exact image exists in PlantDoc TEST
    if h in plantdoc_test_hashes:

        test_leakage_removed += 1

        continue


    # Duplicate inside training datasets
    if h in seen_training_hashes:

        duplicate_training += 1

        continue


    seen_training_hashes.add(h)

    unique_training_samples.append(
        sample
    )


print(
    "\nTraining duplicates removed:",
    duplicate_training
)

print(
    "Potential PlantDoc test leakage removed:",
    test_leakage_removed
)

print(
    "Final unique training images:",
    len(unique_training_samples)
)


# ============================================================
# 12. CLASS DISTRIBUTION
# ============================================================

print("\n" + "=" * 80)
print("CLASS DISTRIBUTION")
print("=" * 80)


class_counts = Counter(
    sample["class_name"]
    for sample in unique_training_samples
)


for class_name in sorted(class_counts):

    print(
        f"{class_name:<50}"
        f"{class_counts[class_name]:>7}"
    )


# ============================================================
# 13. REMOVE LOW-SAMPLE CLASSES
# ============================================================

valid_classes = {

    class_name

    for class_name, count
    in class_counts.items()

    if count >= MIN_IMAGES_PER_CLASS
}


removed_classes = {

    class_name

    for class_name in class_counts

    if class_name not in valid_classes
}


if removed_classes:

    print("\n" + "-" * 80)

    print(
        f"Classes removed (< {MIN_IMAGES_PER_CLASS} images):"
    )

    print("-" * 80)

    for class_name in sorted(removed_classes):

        print(
            f"{class_name:<50}"
            f"{class_counts[class_name]:>7}"
        )


unique_training_samples = [

    sample

    for sample in unique_training_samples

    if sample["class_name"] in valid_classes
]


# ============================================================
# 14. FINAL CLASS LIST
# ============================================================

class_names = sorted(valid_classes)


if len(class_names) < 2:

    raise SystemExit(
        "\nERROR: Less than 2 usable classes."
    )


class_to_index = {

    class_name: index

    for index, class_name
    in enumerate(class_names)
}


print("\n" + "=" * 80)

print(
    f"FINAL NUMBER OF CLASSES: {len(class_names)}"
)

print("=" * 80)


for index, class_name in enumerate(class_names):

    print(
        f"{index:02d}. {class_name}"
    )


# ============================================================
# 15. BUILD PATH / LABEL ARRAYS
# ============================================================

all_paths = np.array(
    [
        sample["path"]
        for sample in unique_training_samples
    ]
)


all_labels = np.array(
    [
        class_to_index[sample["class_name"]]
        for sample in unique_training_samples
    ]
)


print("\nFinal training pool:")
print("Images :", len(all_paths))
print("Classes:", len(class_names))


# ============================================================
# 16. TRAIN / VALIDATION / INTERNAL TEST
# ============================================================

print("\n" + "=" * 80)
print("DATASET SPLIT")
print("=" * 80)


# 70% train
# 15% validation
# 15% internal test

train_paths, temp_paths, train_labels, temp_labels = (
    train_test_split(
        all_paths,
        all_labels,
        test_size=0.30,
        random_state=SEED,
        stratify=all_labels
    )
)


val_paths, test_paths, val_labels, test_labels = (
    train_test_split(
        temp_paths,
        temp_labels,
        test_size=0.50,
        random_state=SEED,
        stratify=temp_labels
    )
)


print(
    "Train      :",
    len(train_paths)
)

print(
    "Validation :",
    len(val_paths)
)

print(
    "Internal Test:",
    len(test_paths)
)


# ============================================================
# 17. TENSORFLOW DATA PIPELINE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE


def load_image(path, label):

    image = tf.io.read_file(path)

    image = tf.image.decode_image(
        image,
        channels=3,
        expand_animations=False
    )

    image.set_shape(
        [None, None, 3]
    )

    image = tf.image.resize(
        image,
        IMG_SIZE
    )

    image = tf.cast(
        image,
        tf.float32
    )

    return image, label


def create_dataset(
    paths,
    labels,
    shuffle=False
):

    dataset = tf.data.Dataset.from_tensor_slices(
        (
            paths,
            labels
        )
    )

    if shuffle:

        dataset = dataset.shuffle(
            min(len(paths), 10000),
            seed=SEED,
            reshuffle_each_iteration=True
        )


    dataset = dataset.map(
        load_image,
        num_parallel_calls=AUTOTUNE
    )


    dataset = dataset.batch(
        BATCH_SIZE
    )


    dataset = dataset.prefetch(
        AUTOTUNE
    )


    return dataset


train_ds = create_dataset(
    train_paths,
    train_labels,
    shuffle=True
)


val_ds = create_dataset(
    val_paths,
    val_labels,
    shuffle=False
)


test_ds = create_dataset(
    test_paths,
    test_labels,
    shuffle=False
)


# ============================================================
# 18. CLASS WEIGHTS
# ============================================================

print("\n" + "=" * 80)
print("CALCULATING CLASS WEIGHTS")
print("=" * 80)


unique_train_classes = np.unique(
    train_labels
)


weights = compute_class_weight(
    class_weight="balanced",
    classes=unique_train_classes,
    y=train_labels
)


class_weights = {

    int(class_index): float(weight)

    for class_index, weight
    in zip(
        unique_train_classes,
        weights
    )
}


for index in sorted(class_weights):

    print(
        f"{class_names[index]:<50}"
        f"{class_weights[index]:.3f}"
    )


# ============================================================
# 19. DATA AUGMENTATION
# ============================================================

augmentation = tf.keras.Sequential(
    [

        layers.RandomFlip(
            "horizontal"
        ),

        layers.RandomRotation(
            0.10
        ),

        layers.RandomZoom(
            0.15
        ),

        layers.RandomContrast(
            0.10
        ),

    ],
    name="data_augmentation"
)


# ============================================================
# 20. MOBILENETV2
# ============================================================

print("\n" + "=" * 80)
print("LOADING MOBILENETV2")
print("=" * 80)


base_model = tf.keras.applications.MobileNetV2(

    input_shape=(
        IMG_SIZE[0],
        IMG_SIZE[1],
        3
    ),

    include_top=False,

    weights="imagenet"
)


# Initially frozen
base_model.trainable = False


# ============================================================
# 21. BUILD MODEL
# ============================================================

inputs = layers.Input(
    shape=(
        IMG_SIZE[0],
        IMG_SIZE[1],
        3
    ),
    name="image"
)


x = augmentation(
    inputs
)


x = tf.keras.applications.mobilenet_v2.preprocess_input(
    x
)


x = base_model(
    x,
    training=False
)


x = layers.GlobalAveragePooling2D()(x)


x = layers.Dropout(
    0.35
)(x)


x = layers.Dense(
    256,
    activation="relu",
    name="feature_layer"
)(x)


x = layers.Dropout(
    0.25
)(x)


outputs = layers.Dense(
    len(class_names),
    activation="softmax",
    name="prediction"
)(x)


model = models.Model(
    inputs,
    outputs,
    name="PlantCare_MobileNetV2"
)


# ============================================================
# 22. COMPILE PHASE 1
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-3
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]
)


print("\nModel created successfully.")

model.summary()


# ============================================================
# 23. CALLBACKS
# ============================================================

checkpoint = tf.keras.callbacks.ModelCheckpoint(
    str(MODEL_PATH),
    monitor="val_accuracy",
    mode="max",
    save_best_only=True,
    verbose=1
)


early_stopping = tf.keras.callbacks.EarlyStopping(
 

    monitor="val_accuracy",


    patience=5,

    mode="max",

    restore_best_weights=True,

    verbose=1
)


reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(

    monitor="val_loss",

    factor=0.3,

    patience=2,

    min_lr=1e-7,

    verbose=1
)


csv_logger = tf.keras.callbacks.CSVLogger(

    MODEL_DIR / "training_history.csv",

    append=False
)


callbacks = [

    checkpoint,

    early_stopping,

    reduce_lr,

    csv_logger
]


# ============================================================
# 24. PHASE 1 - TRANSFER LEARNING
# ============================================================

print("\n" + "=" * 80)
print("PHASE 1 - TRANSFER LEARNING")
print("=" * 80)


history1 = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=INITIAL_EPOCHS,

    class_weight=class_weights,

    callbacks=callbacks,

    verbose=1
)


# ============================================================
# 25. PHASE 2 - FINE TUNING
# ============================================================

print("\n" + "=" * 80)
print("PHASE 2 - FINE TUNING")
print("=" * 80)


base_model.trainable = True


# MobileNetV2 has many layers.
# Keep early generic ImageNet features frozen.
fine_tune_from = 100


for layer in base_model.layers[:fine_tune_from]:

    layer.trainable = False


# Keep BatchNormalization layers frozen
# for stable transfer learning.

for layer in base_model.layers:

    if isinstance(
        layer,
        layers.BatchNormalization
    ):

        layer.trainable = False


model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]
)


history2 = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=FINE_TUNE_EPOCHS,

    class_weight=class_weights,

    callbacks=callbacks,

    verbose=1
)


# ============================================================
# 26. LOAD BEST MODEL
# ============================================================

print("\n" + "=" * 80)
print("LOADING BEST MODEL")
print("=" * 80)


model = tf.keras.models.load_model(
    MODEL_PATH
)


print(
    "Best model loaded successfully."
)


# ============================================================
# 27. INTERNAL TEST EVALUATION
# ============================================================

print("\n" + "=" * 80)
print("INTERNAL TEST EVALUATION")
print("=" * 80)


test_loss, test_accuracy = model.evaluate(

    test_ds,

    verbose=1
)


print(
    f"\nInternal Test Loss     : {test_loss:.4f}"
)

print(
    f"Internal Test Accuracy : {test_accuracy:.4f}"
)


# ============================================================
# 28. INTERNAL TEST PREDICTIONS
# ============================================================

print("\nGenerating internal test predictions...")


predictions = model.predict(
    test_ds,
    verbose=1
)


predicted_labels = np.argmax(
    predictions,
    axis=1
)


# ============================================================
# 29. INTERNAL CLASSIFICATION REPORT
# ============================================================

internal_report = classification_report(

    test_labels,

    predicted_labels,

    labels=np.arange(len(class_names)),

    target_names=class_names,

    digits=4,

    zero_division=0
)


print("\n" + internal_report)


REPORT_PATH.write_text(
    internal_report,
    encoding="utf-8"
)


# ============================================================
# 30. INTERNAL CONFUSION MATRIX
# ============================================================

internal_cm = confusion_matrix(

    test_labels,

    predicted_labels,

    labels=np.arange(len(class_names))
)


CM_PATH.write_text(

    json.dumps(
        internal_cm.tolist(),
        indent=2
    ),

    encoding="utf-8"
)


# ============================================================
# 31. PREPARE PLANTDOC EXTERNAL TEST
# ============================================================

print("\n" + "=" * 80)
print("PREPARING PLANTDOC EXTERNAL TEST")
print("=" * 80)


external_paths = []

external_labels = []

external_original_classes = []

skipped_external = Counter()


for sample in plantdoc_test_samples:

    canonical = sample["class_name"]


    # Only evaluate classes known by our model.
    if canonical not in class_to_index:

        skipped_external[canonical] += 1

        continue


    external_paths.append(
        sample["path"]
    )

    external_labels.append(
        class_to_index[canonical]
    )

    external_original_classes.append(
        canonical
    )


external_paths = np.array(
    external_paths
)


external_labels = np.array(
    external_labels
)


print(
    "\nPlantDoc test samples usable by model:",
    len(external_paths)
)


print(
    "PlantDoc test samples skipped:",
    sum(skipped_external.values())
)


if len(external_paths) > 0:

    external_ds = create_dataset(

        external_paths,

        external_labels,

        shuffle=False
    )


    # ========================================================
    # 32. PLANTDOC EXTERNAL EVALUATION
    # ========================================================

    print("\n" + "=" * 80)
    print("PLANTDOC EXTERNAL TEST EVALUATION")
    print("=" * 80)


    external_loss, external_accuracy = model.evaluate(

        external_ds,

        verbose=1
    )


    print(
        f"\nPlantDoc External Loss     : "
        f"{external_loss:.4f}"
    )

    print(
        f"PlantDoc External Accuracy : "
        f"{external_accuracy:.4f}"
    )


    # ========================================================
    # 33. PLANTDOC PREDICTIONS
    # ========================================================

    external_predictions = model.predict(

        external_ds,

        verbose=1
    )


    external_predicted_labels = np.argmax(

        external_predictions,

        axis=1
    )


    # ========================================================
    # 34. PLANTDOC REPORT
    # ========================================================

    external_report = classification_report(

        external_labels,

        external_predicted_labels,

        labels=np.arange(len(class_names)),

        target_names=class_names,

        digits=4,

        zero_division=0
    )


    print(
        "\n" + external_report
    )


    PLANTDOC_REPORT_PATH.write_text(

        external_report,

        encoding="utf-8"
    )


    # ========================================================
    # 35. PLANTDOC CONFUSION MATRIX
    # ========================================================

    external_cm = confusion_matrix(

        external_labels,

        external_predicted_labels,

        labels=np.arange(len(class_names))
    )


    PLANTDOC_CM_PATH.write_text(

        json.dumps(

            external_cm.tolist(),

            indent=2

        ),

        encoding="utf-8"
    )


else:

    external_loss = None

    external_accuracy = None

    external_report = (
        "No compatible PlantDoc external "
        "test samples were available."
    )

    PLANTDOC_REPORT_PATH.write_text(

        external_report,

        encoding="utf-8"
    )


# ============================================================
# 36. DATASET MANIFEST
# ============================================================

print("\n" + "=" * 80)
print("CREATING DATASET MANIFEST")
print("=" * 80)


source_class_counts = defaultdict(
    Counter
)


for sample in unique_training_samples:

    source_class_counts[
        sample["source"]
    ][
        sample["class_name"]
    ] += 1


manifest = {

    "datasets": dataset_statistics,

    "training_images_before_split":
        int(len(all_paths)),

    "train_images":
        int(len(train_paths)),

    "validation_images":
        int(len(val_paths)),

    "internal_test_images":
        int(len(test_paths)),

    "plantdoc_external_test_images":
        int(len(external_paths)),

    "classes":
        class_names,

    "number_of_classes":
        len(class_names),

    "class_counts":
        {
            name: int(count)
            for name, count
            in class_counts.items()
            if name in class_names
        },

    "source_class_counts":
        {
            source: {
                cls: int(count)
                for cls, count
                in counts.items()
            }

            for source, counts
            in source_class_counts.items()
        },

    "removed_low_sample_classes":
        {
            name: int(class_counts[name])
            for name in removed_classes
        },

    "duplicate_training_images_removed":
        int(duplicate_training),

    "plantdoc_test_leakage_removed":
        int(test_leakage_removed),

    "min_images_per_class":
        MIN_IMAGES_PER_CLASS,

    "seed":
        SEED,
}


MANIFEST_PATH.write_text(

    json.dumps(

        manifest,

        indent=2

    ),

    encoding="utf-8"
)


# ============================================================
# 37. SAVE CLASS NAMES
# ============================================================

CLASS_PATH.write_text(

    json.dumps(

        class_names,

        indent=2

    ),

    encoding="utf-8"
)


# ============================================================
# 38. SAVE METRICS
# ============================================================

metrics = {

    "model":
        "MobileNetV2",

    "architecture":
        "MobileNetV2 Transfer Learning + Fine Tuning",

    "datasets_used_for_training": [

        "PlantVillage",

        "Mendeley",

        "PlantDoc Train"
    ],

    "external_test_dataset":
        "PlantDoc Test",

    "number_of_classes":
        len(class_names),

    "class_names":
        class_names,

    "image_size":
        list(IMG_SIZE),

    "batch_size":
        BATCH_SIZE,

    "initial_epochs":
        INITIAL_EPOCHS,

    "fine_tune_epochs":
        FINE_TUNE_EPOCHS,

    "train_images":
        int(len(train_paths)),

    "validation_images":
        int(len(val_paths)),

    "internal_test_images":
        int(len(test_paths)),

    "plantdoc_external_test_images":
        int(len(external_paths)),

    "internal_test_loss":
        float(test_loss),

    "internal_test_accuracy":
        float(test_accuracy),

    "plantdoc_external_test_loss":
        (
            None
            if external_loss is None
            else float(external_loss)
        ),

    "plantdoc_external_test_accuracy":
        (
            None
            if external_accuracy is None
            else float(external_accuracy)
        ),

    "duplicates_removed":
        int(duplicate_training),

    "plantdoc_test_leakage_removed":
        int(test_leakage_removed),

    "min_images_per_class":
        MIN_IMAGES_PER_CLASS,

    "seed":
        SEED,
}


METRICS_PATH.write_text(

    json.dumps(

        metrics,

        indent=2

    ),

    encoding="utf-8"
)


# ============================================================
# 39. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 80)
print("                 TRAINING COMPLETE")
print("=" * 80)


print("\nMODEL")
print(
    MODEL_PATH
)


print("\nCLASSES")
print(
    CLASS_PATH
)


print("\nMETRICS")
print(
    METRICS_PATH
)


print("\nINTERNAL CLASSIFICATION REPORT")
print(
    REPORT_PATH
)


print("\nINTERNAL CONFUSION MATRIX")
print(
    CM_PATH
)


print("\nPLANTDOC EXTERNAL REPORT")
print(
    PLANTDOC_REPORT_PATH
)


print("\nPLANTDOC EXTERNAL CONFUSION MATRIX")
print(
    PLANTDOC_CM_PATH
)


print("\nDATASET MANIFEST")
print(
    MANIFEST_PATH
)


print("\n" + "-" * 80)

print(
    f"Final Classes              : {len(class_names)}"
)

print(
    f"Training Images            : {len(train_paths)}"
)

print(
    f"Validation Images          : {len(val_paths)}"
)

print(
    f"Internal Test Images       : {len(test_paths)}"
)

print(
    f"PlantDoc External Test     : {len(external_paths)}"
)

print(
    f"Internal Test Accuracy     : "
    f"{test_accuracy:.4f}"
)

if external_accuracy is not None:

    print(
        f"PlantDoc External Accuracy : "
        f"{external_accuracy:.4f}"
    )

print(
    f"Duplicates Removed         : "
    f"{duplicate_training}"
)

print(
    f"Test Leakage Removed       : "
    f"{test_leakage_removed}"
)

print("-" * 80)

print(
    "\nPlantCare AI disease model is ready."
)

print(
    "Next step: update disease_model.py"
)

print("=" * 80)