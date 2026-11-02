
import React from "react";
import * as Icons from "../icons";

const {
  ArrowLeft,
  Leaf,
  Brain,
  Database,
  ShieldCheck,
  CheckCircle2,
  User,
  Cpu,
  Search,
  MessageCircle,
} = Icons;

function SafeIcon({ icon: Icon, size = 20, className = "" }) {
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

function ProjectInfo({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8">

      {/* HEADER */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 transition"
        >
          <SafeIcon icon={ArrowLeft} size={17} />
          Back to Dashboard
        </button>

        <div className="mt-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
            <SafeIcon icon={Leaf} size={24} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider font-black text-emerald-700">
              Project Information
            </p>

            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              PlantCare AI
            </h1>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              AI-Powered Plant Disease Detection and Personalized Plant Care
              System Using RAG.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl font-black">
          About the Project
        </h2>

        <p className="text-sm text-slate-600 leading-7 mt-3">
          PlantCare AI is an AI-based plant health assistance system that
          analyzes plant leaf images to identify supported plant diseases
          and provides personalized plant-care guidance.
        </p>

        <p className="text-sm text-slate-600 leading-7 mt-3">
          The system combines Deep Learning, Retrieval-Augmented Generation
          (RAG) and plant-care knowledge to provide disease information,
          symptoms, prevention and care recommendations.
        </p>

        <p className="text-sm text-slate-600 leading-7 mt-3">
          Users can create an account, manage their plants, upload leaf
          images for AI diagnosis and ask plant-care questions through the
          AI Assistant.
        </p>
      </section>

      {/* DEVELOPER */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-4">

          {/* PROFESSIONAL DP / AVATAR */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-700 to-teal-500 text-white grid place-items-center shadow-md ring-4 ring-emerald-50 shrink-0">
            <span className="text-xl font-black">
              KB
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider font-black text-emerald-700">
              Developed By
            </p>

            <h2 className="text-xl font-black mt-0.5">
              Kritika Bunkar
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              B.Tech AI & Data Science • AKS University, Satna
            </p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500 leading-6">
            Major Project focused on Artificial Intelligence, Deep Learning,
            plant disease detection and Retrieval-Augmented Generation.
          </p>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl font-black">
          Technology Used
        </h2>

        <div className="mt-4 space-y-3">

          <TechRow
            icon={Brain}
            title="Deep Learning"
            text="TensorFlow/Keras with MobileNetV2 for plant disease image classification."
          />

          <TechRow
            icon={Database}
            title="RAG Knowledge System"
            text="Sentence Transformers and FAISS retrieve relevant plant-care information."
          />

          <TechRow
            icon={ShieldCheck}
            title="Backend & Database"
            text="FastAPI, JWT authentication and MongoDB for application data."
          />

          <TechRow
            icon={CheckCircle2}
            title="Frontend"
            text="React, Vite and Tailwind CSS for the responsive web interface."
          />

        </div>
      </section>

      {/* AI COMPONENTS */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl font-black">
          AI Components
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Main AI and intelligent components used in the system
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mt-5">

          <ModelCard
            icon={Cpu}
            title="MobileNetV2"
            subtitle="Disease Detection"
            text="Analyzes leaf images and predicts the supported plant/disease class with confidence."
          />

          <ModelCard
            icon={Search}
            title="Sentence Transformer"
            subtitle="Knowledge Retrieval"
            text="Creates text embeddings to find relevant plant-care information from the RAG knowledge base."
          />

          <ModelCard
            icon={MessageCircle}
            title="AI Assistant"
            subtitle="Care Guidance"
            text="Uses retrieved plant-care information to provide contextual answers to user questions."
          />

        </div>

        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-600">
              Current trained disease model
            </span>

            <span className="text-sm font-black text-emerald-700">
              39 Classes
            </span>
          </div>
        </div>
      </section>

      {/* DATASETS */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl font-black">
          Datasets Used
        </h2>

        <p className="text-sm text-slate-600 leading-6 mt-2">
          Multiple agricultural image datasets were used during model
          development to provide plant and disease image diversity.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mt-5">

          <DatasetCard
            title="PlantVillage"
            text="Plant and plant-disease images used for image classification."
          />

          <DatasetCard
            title="Mendeley Data"
            text="Additional agricultural image data used during model development."
          />

          <DatasetCard
            title="PlantDoc"
            text="Plant disease image data used to improve dataset diversity."
          />

        </div>
         
          {/* SUPPORTED PLANTS */}
          <section className="bg-white border border-emerald-100  mt-5 rounded-2xl p-5 sm:p-7 shadow-sm">

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-emerald-700">
                  AI Detection
                </p>

                <h2 className="text-xl font-black mt-1">
                  Supported Plants
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Plants and conditions currently supported by the trained AI model
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-center">
                <p className="text-lg font-black text-emerald-700">
                  14
                </p>

                <p className="text-[9px] font-bold text-slate-500 uppercase">
                  Plants
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 mt-5">

              <PlantSupport
                plant="Apple"
                conditions="Scab, Black Rot, Healthy, Rust"
              />

              <PlantSupport
                plant="Blueberry"
                conditions="Healthy"
              />

              <PlantSupport
                plant="Cherry"
                conditions="Healthy, Powdery Mildew"
              />

              <PlantSupport
                plant="Corn"
                conditions="Common Rust, Gray Leaf Spot, Healthy, Leaf Blight, Northern Leaf Blight"
              />

              <PlantSupport
                plant="Grape"
                conditions="Black Rot, Esca, Healthy, Leaf Blight"
              />

              <PlantSupport
                plant="Orange"
                conditions="Citrus Greening"
              />

              <PlantSupport
                plant="Peach"
                conditions="Bacterial Spot, Healthy"
              />

              <PlantSupport
                plant="Pepper Bell"
                conditions="Bacterial Spot, Healthy"
              />

              <PlantSupport
                plant="Potato"
                conditions="Early Blight, Healthy, Late Blight"
              />

              <PlantSupport
                plant="Raspberry"
                conditions="Healthy"
              />

              <PlantSupport
                plant="Soybean"
                conditions="Healthy"
              />

              <PlantSupport
                plant="Squash"
                conditions="Powdery Mildew"
              />

              <PlantSupport
                plant="Strawberry"
                conditions="Healthy, Leaf Scorch"
              />

              <PlantSupport
                plant="Tomato"
                conditions="Bacterial Spot, Early Blight, Healthy, Late Blight, Leaf Mold, Mosaic Virus, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus"
              />

            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 leading-5">
                The AI model currently contains 39 plant/disease classes.
                Predictions are limited to these supported classes and may vary
                depending on image quality.
              </p>
            </div>

          </section>


        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-5">
            The trained model currently contains 39 supported plant/disease
            classes. Actual prediction availability depends on the classes
            included in the trained model.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl font-black">
          Main Features
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mt-4">

          <Feature text="User Registration & Login" />
          <Feature text="Personal Plant Management" />
          <Feature text="AI Plant Disease Detection" />
          <Feature text="Prediction Confidence" />
          <Feature text="Disease Care Recommendations" />
          <Feature text="RAG-based AI Assistant" />
          <Feature text="Diagnosis History" />
          <Feature text="Responsive Web Interface" />

        </div>
      </section>

      {/* SYSTEM FLOW */}
      <section className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl font-black">
          System Flow
        </h2>

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-sm text-slate-600 leading-7">
            User → React Frontend → FastAPI → AI Model → Plant/Disease
            Prediction → Care Recommendation → RAG Retrieval → AI Assistant
          </p>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-xs text-slate-500 leading-6">
          <span className="font-bold text-slate-700">
            Note:
          </span>{" "}
          PlantCare AI provides AI-based information for educational and
          plant-care assistance purposes. Results depend on image quality,
          supported classes and model performance.
        </p>
      </section>

    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function TechRow({ icon, title, text }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-9 h-9 rounded-lg bg-white text-emerald-700 grid place-items-center shrink-0">
        <SafeIcon icon={icon} size={17} />
      </div>

      <div>
        <h3 className="font-bold text-sm">
          {title}
        </h3>

        <p className="text-xs text-slate-500 leading-5 mt-0.5">
          {text}
        </p>
      </div>
    </div>
  );
}

function ModelCard({ icon, title, subtitle, text }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
      <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 grid place-items-center shadow-sm">
        <SafeIcon icon={icon} size={18} />
      </div>

      <h3 className="font-black text-sm mt-4">
        {title}
      </h3>

      <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 mt-1">
        {subtitle}
      </p>

      <p className="text-xs text-slate-500 leading-5 mt-2">
        {text}
      </p>
    </div>
  );
}

function DatasetCard({ title, text }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
      <h3 className="font-black text-sm">
        {title}
      </h3>

      <p className="text-xs text-slate-500 leading-5 mt-1.5">
        {text}
      </p>
    </div>
  );
}

function PlantSupport({ plant, conditions }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
          <SafeIcon icon={Leaf} size={14} />
        </div>

        <h3 className="font-black text-sm text-slate-800">
          {plant}
        </h3>
      </div>

      <p className="text-[11px] text-slate-500 leading-5 mt-2">
        {conditions}
      </p>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <SafeIcon
        icon={CheckCircle2}
        size={16}
        className="text-emerald-600"
      />

      <span>{text}</span>
    </div>
  );
}

export default ProjectInfo;
