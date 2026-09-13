reminder_scheduler.py
reminder.py 
 some edit in main.py



# 🌱 PlantCare AI

Major Project: **AI-Powered Plant Disease Detection and Personalized Plant Care System Using RAG**

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + JWT
- Database: MongoDB
- AI: TensorFlow/Keras + MobileNetV2
- RAG: Sentence Transformers + FAISS
- Optional LLM: OpenAI Responses API
- Dataset: PlantVillage

## Important
This repository is intentionally beginner-friendly. The app works in **DEMO AI mode** until a trained model is placed in `backend/ai/model/plant_disease_model.keras`.

For the presentation, first get the web app running, then train the model.

## 1. Requirements
- Node.js 18+
- Python 3.10/3.11 recommended
- MongoDB Community Server running locally OR MongoDB Atlas connection string
- Git

## 2. Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

API: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

## 3. Frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173

## 4. RAG knowledge base
The backend contains starter plant-care documents in `backend/rag/documents`.
After installing requirements:
```powershell
cd backend
python rag/ingest.py
```

This creates `backend/rag/index.faiss` and metadata.

## 5. PlantVillage dataset
Use PlantVillage from Kaggle:
https://www.kaggle.com/datasets/emmarex/plantdisease

Extract it so class folders are under:
`ai/dataset/PlantVillage/`

For the first training run, keep these 10 folders:
- Apple___Apple_scab
- Apple___Black_rot
- Apple___healthy
- Potato___Early_blight
- Potato___Late_blight
- Potato___healthy
- Tomato___Early_blight
- Tomato___Late_blight
- Tomato___Leaf_Mold
- Tomato___healthy

Then:
```powershell
cd backend
python ai/train.py
```

The trained model will be saved to:
`backend/ai/model/plant_disease_model.keras`

## 6. Optional real LLM
Copy `.env.example` to `.env` and set:
`OPENAI_API_KEY=your_key`
and optionally:
`OPENAI_MODEL=gpt-5.6-luna`

Without an API key, the RAG chatbot still retrieves relevant documents and returns a grounded local answer.

## 7. Project flow
Login → Dashboard → Add Plant → Plant Doctor → AI/RAG Assistant → Care reminders/history.

## 8. Presentation
Explain the system as:
1. React frontend
2. FastAPI REST API
3. MongoDB persistence
4. MobileNetV2 disease classifier
5. RAG retrieval with FAISS
6. LLM response generation (when API key is enabled)
7. Personalized plant-care recommendations



 1. for start venv

.\venv\Scripts\Activate.ps1  
.\venv\Scripts\Activate.ps1  

2. for run backend server

uvicorn main:app --reload


3. install tensorflow kerus  

python -m pip install tf_keras

4. for check installation of kerus 

python -c "import tensorflow as tf; print('TensorFlow:', tf.__version__); import tf_keras; print('tf_keras: OK')"







# 🌱 PlantCare AI

### AI-Powered Plant Disease Detection and Personalized Plant Care System Using RAG

PlantCare AI is a full-stack Artificial Intelligence based plant-care system that detects plant diseases from leaf images and provides personalized plant-care recommendations using Deep Learning and Retrieval-Augmented Generation (RAG).

---

## 📌 About the Project

PlantCare AI helps users identify plant diseases using an AI-powered image classification model.

The system combines:

- Deep Learning for plant disease detection
- MobileNetV2 for image classification
- RAG for knowledge retrieval
- Sentence Transformers for text embeddings
- FAISS for similarity search
- FastAPI for backend APIs
- React + Vite for frontend
- MongoDB for data storage
- JWT for user authentication

The main goal of the project is to provide an easy-to-use AI system that can detect supported plant diseases and provide useful, disease-specific plant-care guidance.

---

## ✨ Features

### 🔐 Authentication
- User Registration
- User Login
- JWT Authentication
- Protected APIs

### 🌿 Plant Management
- Add plants
- View plants
- Update plants
- Delete plants
- Manage personal plant collection

### 🩺 AI Plant Disease Detection
- Upload plant leaf image
- Detect supported plant/disease
- Show prediction confidence
- Provide disease-specific recommendations
- Handle uncertain predictions

### 🤖 AI Plant Care Assistant
- Ask plant-care questions
- Get contextual answers
- RAG-based knowledge retrieval
- Plant and disease related guidance
- Chat history stored locally in the browser

### 📚 RAG Knowledge Base
- Plant-care documents
- Disease information
- Healthy plant information
- Sentence Transformers
- FAISS vector search

### 📊 Dashboard
- Total plants
- AI diagnosis activity
- Plant-care AI status
- User information

---

# 🧠 System Workflow

```text
User
  ↓
React + Vite Frontend
  ↓
FastAPI Backend
  ↓
JWT Authentication / MongoDB
  ↓
AI Diagnosis
  ↓
MobileNetV2 Model
  ↓
Plant + Disease + Confidence
  ↓
Disease-Specific Care Data
  ↓
RAG Retrieval
  ↓
Sentence Transformers + FAISS
  ↓
Personalized Plant-Care Response
🛠️ Tech Stack
Technology	Purpose
React	Frontend
Vite	Frontend Development
Tailwind CSS	UI Styling
Lucide React	Icons
FastAPI	Backend API
Python	Backend & AI
JWT	Authentication
MongoDB	Database
TensorFlow	Deep Learning
Keras	Model Framework
MobileNetV2	Image Classification
Sentence Transformers	Text Embeddings
FAISS	Vector Search
Pillow	Image Processing
NumPy	Numerical Processing
Uvicorn	Backend Server
🌱 Supported Classes

The current trained model supports 39 plant/disease classes:

Apple / Apple Scab
Apple / Black Rot
Apple / Healthy
Apple / Rust

Blueberry / Healthy

Cherry / Healthy
Cherry / Powdery Mildew

Corn / Common Rust
Corn / Gray Leaf Spot
Corn / Healthy
Corn / Leaf Blight
Corn / Northern Leaf Blight

Grape / Black Rot
Grape / Esca
Grape / Healthy
Grape / Leaf Blight

Orange / Citrus Greening

Peach / Bacterial Spot
Peach / Healthy

Pepper Bell / Bacterial Spot
Pepper Bell / Healthy

Potato / Early Blight
Potato / Healthy
Potato / Late Blight

Raspberry / Healthy

Soybean / Healthy

Squash / Powdery Mildew

Strawberry / Healthy
Strawberry / Leaf Scorch

Tomato / Bacterial Spot
Tomato / Early Blight
Tomato / Healthy
Tomato / Late Blight
Tomato / Leaf Mold
Tomato / Mosaic Virus
Tomato / Septoria Leaf Spot
Tomato / Spider Mites
Tomato / Target Spot
Tomato / Yellow Leaf Curl Virus
🤖 AI Disease Detection

The disease detection system uses a trained MobileNetV2 model.

Leaf Image
    ↓
Image Preprocessing
    ↓
MobileNetV2
    ↓
Prediction Probabilities
    ↓
Plant + Disease
    ↓
Confidence
    ↓
Care Recommendation

The trained model is stored in:

backend/ai/model/plant_disease_model.keras

Class names are stored in:

backend/ai/model/class_names.json
🌿 Plant Care Recommendations

PlantCare AI provides disease-specific care information instead of using the same generic recommendation for every disease.

Care information is maintained in:

backend/services/care_data.py

The system contains guidance for conditions such as:

Early Blight
Late Blight
Bacterial Spot
Leaf Mold
Apple Scab
Rust
Black Rot
Mosaic Virus
Yellow Leaf Curl Virus
Spider Mites
Septoria
Powdery Mildew
Healthy Plants
General Plant Care

Recommendations may include:

Water management
Sunlight requirements
Air circulation
Infected leaf removal
Plant hygiene
Disease prevention
Monitoring and maintenance

PlantCare AI provides general educational plant-care information and should not be considered a substitute for professional agricultural advice.

📚 RAG System

PlantCare AI uses Retrieval-Augmented Generation (RAG) to retrieve relevant plant-care information before generating an AI response.

RAG Pipeline
Plant Care Documents
        ↓
Text Processing
        ↓
Sentence Transformers
        ↓
Embeddings
        ↓
FAISS Vector Index
        ↓
Similarity Search
        ↓
Relevant Information
        ↓
AI Response
Embedding Model
all-MiniLM-L6-v2
Vector Database
FAISS

RAG files are located in:

backend/rag/

Important files:

backend/rag/ingest.py
backend/rag/index.faiss
backend/rag/metadata.json
backend/rag/documents/

Current knowledge base:

Documents: 43
Vectors:   43
Dimensions: 384
📖 Dataset

PlantCare AI uses multiple agricultural image datasets for model development.

Datasets Used
PlantVillage
Mendeley Data
PlantDoc
🍃 PlantVillage Dataset

PlantVillage is one of the main datasets used for plant disease image classification.

Dataset directory:

backend/dataset/PlantVillage/

The dataset contains labeled images of healthy and diseased plant leaves.

Example structure:

PlantVillage/
├── Apple___Apple_scab/
├── Apple___Black_rot/
├── Apple___healthy/
├── Apple___rust/
├── Potato___Early_blight/
├── Potato___Late_blight/
├── Potato___healthy/
├── Tomato___Early_blight/
├── Tomato___Late_blight/
├── Tomato___healthy/
└── ...

The final trained model supports 39 classes as listed above.

📊 Mendeley Data

Mendeley Data is used as an additional agricultural data/research source for the project.

It can provide additional plant disease images and research information useful for:

Dataset expansion
Research
Disease analysis
Model development

Add the exact Mendeley dataset used for your project here:

Mendeley Dataset:
PASTE-YOUR-MENDELEY-DATA-LINK-HERE
🌿 PlantDoc Dataset

PlantDoc is another plant disease image dataset used during model development.

Using multiple datasets helps provide more diversity in plant and disease images.

The datasets can be processed using:

Class normalization
Duplicate removal
Image validation
Minimum class filtering
Label standardization
📁 Project Structure
PlantCare-AI/
│
├── backend/
│   │
│   ├── ai/
│   │   └── model/
│   │       ├── plant_disease_model.keras
│   │       ├── class_names.json
│   │       ├── metrics.json
│   │       ├── classification_report.txt
│   │       └── confusion_matrix.json
│   │
│   ├── dataset/
│   │   └── PlantVillage/
│   │
│   ├── rag/
│   │   ├── documents/
│   │   │   ├── diseases/
│   │   │   ├── healthy/
│   │   │   └── plants/
│   │   ├── ingest.py
│   │   ├── index.faiss
│   │   └── metadata.json
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── plants.py
│   │   ├── ai.py
│   │   └── rag.py
│   │
│   ├── services/
│   │   ├── care_data.py
│   │   ├── disease_model.py
│   │   └── rag_service.py
│   │
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
💻 Requirements

Before running the project, install:

Python 3.10.x
Node.js 18+
MongoDB
Git
VS Code (Recommended)

Recommended development environment:

Python      3.10.0
TensorFlow  2.15.1
MongoDB     8.x
Node.js     18+
🚀 Installation
1. Clone the Project
git clone YOUR_GITHUB_REPOSITORY_URL
cd PlantCare-AI
🐍 Backend Setup

Open PowerShell:

cd PlantCare-AI\backend

Create Python virtual environment:

python -m venv venv

Activate the environment:

.\venv\Scripts\Activate.ps1

If PowerShell blocks activation:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then activate again:

.\venv\Scripts\Activate.ps1

Upgrade pip:

python -m pip install --upgrade pip

Install dependencies:

pip install -r requirements.txt
🧠 TensorFlow Check

Run:

python -c "import tensorflow as tf; print('TensorFlow:', tf.__version__); import tf_keras; print('tf_keras: OK')"

Expected:

TensorFlow: 2.15.1
tf_keras: OK

If required:

pip install tensorflow==2.15.1
python -m pip install tf_keras
🍃 MongoDB Setup

Make sure MongoDB is running.

For local MongoDB, the default connection is:

mongodb://127.0.0.1:27017

Database:

plantcare_ai
🔐 Environment Variables

Create this file:

backend/.env

Example:

MONGODB_URL=mongodb://127.0.0.1:27017
DB_NAME=plantcare_ai

JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET

OPENAI_API_KEY=
OPENAI_MODEL=

If another supported LLM provider is configured, add its required environment variables.

Important

Never upload real API keys or passwords to GitHub.

Add .env to .gitignore.

▶️ Run Backend

From:

PlantCare-AI/backend

Run:

python -m uvicorn main:app --reload

Backend:

http://127.0.0.1:8000
📖 FastAPI Documentation

Open:

http://127.0.0.1:8000/docs

FastAPI provides interactive Swagger API documentation.

⚛️ Frontend Setup

Open a new PowerShell terminal:

cd PlantCare-AI\frontend

Install dependencies:

npm install

Start frontend:

npm run dev

Frontend:

http://localhost:5173
🔗 API Configuration

The frontend uses:

http://127.0.0.1:8000/api

The API base URL is configured in:

frontend/src/main.jsx
📚 RAG Setup

If the FAISS index is missing or RAG documents are changed, rebuild the index.

Go to backend:

cd PlantCare-AI\backend

Activate environment:

.\venv\Scripts\Activate.ps1

Run:

python .\rag\ingest.py

Test RAG:

python .\test_rag.py
🔌 API Endpoints
Health
GET /api/health
Authentication
POST /api/auth/register
POST /api/auth/login
Plants
/api/plants
AI Diagnosis
POST /api/ai/diagnose
RAG Chat
POST /api/rag/chat
🧪 Testing
Backend

Start:

python -m uvicorn main:app --reload

Open:

http://127.0.0.1:8000/docs

Test:

Register
Login
Plants
AI Diagnosis
RAG Chat
🩺 Test AI Diagnosis
Start MongoDB.
Start FastAPI backend.
Start React frontend.
Open the application.
Register or login.
Open Plant Doctor.
Upload a clear plant-leaf image.
Run diagnosis.
Check the predicted plant, disease, confidence and care recommendations.

For better results:

Use a clear leaf image.
Use good lighting.
Avoid blurry images.
Keep the leaf visible.
Avoid heavily obstructed images.
Use a plant/disease supported by the model.
💬 Test AI Assistant

Open:

AI Assistant

Example questions:

How can I care for a tomato plant?
What should I do for potato late blight?
What are the symptoms of apple scab?
How can I prevent fungal diseases?
🔒 Security

For production use:

Never commit .env
Never expose API keys
Use a strong JWT secret
Use HTTPS
Validate uploaded files
Restrict file types
Restrict upload size
Protect database credentials
⚠️ Limitations
The model only supports the classes included in class_names.json.
Prediction quality depends on image quality.
Visually similar diseases may be difficult to distinguish.
Low-confidence predictions should not be treated as confirmed diagnoses.
RAG responses depend on the quality of the available knowledge base.
Plant-care recommendations are general educational guidance.
🔮 Future Enhancements

Possible future improvements include:

More plant species
More disease classes
Larger datasets
Improved model accuracy
Better uncertainty detection
More agricultural knowledge sources
Weather-based plant care
Soil/environment monitoring
Mobile application
Cloud deployment
Multilingual plant-care assistant
🎓 Academic Project
Project Name:
PlantCare AI

Full Title:
AI-Powered Plant Disease Detection and Personalized Plant Care System Using RAG

Project Type:
B.Tech Major Project

Domain:
Artificial Intelligence
Machine Learning
Deep Learning
Natural Language Processing
Retrieval-Augmented Generation
Agricultural Technology
Full-Stack Development
📚 References
PlantVillage
https://www.kaggle.com/datasets/emmarex/plantdisease
Mendeley Data
PASTE-YOUR-EXACT-MENDELEY-DATASET-LINK-HERE
PlantDoc
PASTE-YOUR-EXACT-PLANTDOC-SOURCE-LINK-HERE
TensorFlow
https://www.tensorflow.org/
FastAPI
https://fastapi.tiangolo.com/
React
https://react.dev/
Sentence Transformers
https://www.sbert.net/
FAISS
https://github.com/facebookresearch/faiss
MongoDB
https://www.mongodb.com/
🌱 PlantCare AI
Detect • Understand • Care
Deep Learning
      +
RAG
      +
Plant Care Knowledge
      +
Full-Stack Application
      ↓
Smarter Plant Care 🌿

