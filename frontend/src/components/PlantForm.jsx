import React, { useRef, useState } from "react";
import * as Icons from "../icons";
import { api, apiJson, assetUrl } from "../api";
import { compressImage, checkImageFile } from "../imageUtils";
import { inputCls, labelCls, overlayCls, sheetCls } from "../ui";

const { X, Camera, Leaf, Trash2, RefreshCw, Plus, Check } = Icons;

/* ---------------------------------------------------------
   PlantForm: plant ADD ya EDIT karne ka popup (photo ke saath)

   Props:
     plant     -> null = naya plant, object = edit
     onClose   -> popup band
     onSaved   -> save ke baad plants reload
     setToast  -> message
--------------------------------------------------------- */
function PlantForm({ plant, onClose, onSaved, setToast }) {
  const isEdit = Boolean(plant);

  const [form, setForm] = useState({
    name: plant?.name || "",
    species: plant?.species || "",
    location: plant?.location || "Indoor",
    watering_days: plant?.watering_days || 3,
    notes: plant?.notes || "",
  });

  // photo state
  const fileRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);       // naya chuna hua photo
  const [preview, setPreview] = useState(plant?.photo ? assetUrl(plant.photo) : "");
  const [removePhoto, setRemovePhoto] = useState(false);

  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const problem = checkImageFile(file);
    if (problem) {
      setToast(problem);
      return;
    }

    const small = await compressImage(file);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPhotoFile(small);
    setPreview(URL.createObjectURL(small));
    setRemovePhoto(false);
  }

  function dropPhoto() {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPhotoFile(null);
    setPreview("");
    setRemovePhoto(true);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form, watering_days: Number(form.watering_days) };

      // 1) plant ki details save
      const saved = isEdit
        ? await apiJson(`/plants/${plant._id}`, "PUT", payload)
        : await apiJson("/plants", "POST", payload);

      // 2) photo (alag request; fail ho to bhi plant save rehta hai)
      let photoProblem = "";
      try {
        if (photoFile) {
          const fd = new FormData();
          fd.append("file", photoFile);
          await api(`/plants/${saved._id}/photo`, { method: "POST", body: fd });
        } else if (removePhoto && plant?.photo) {
          await api(`/plants/${saved._id}/photo`, { method: "DELETE" });
        }
      } catch (err) {
        photoProblem = err.message;
      }

      await onSaved();
      setToast(
        photoProblem
          ? `Plant saved, but the photo failed: ${photoProblem}`
          : isEdit
          ? "Plant updated."
          : "Plant added successfully."
      );
      onClose();
    } catch (err) {
      setToast(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={overlayCls} onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className={sheetCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold">{isEdit ? "Edit plant" : "Add a plant"}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-sage-100 text-forest-600 grid place-items-center">
            <X size={16} />
          </button>
        </div>

        {/* photo */}
        <div className="mt-5 flex items-center gap-4">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-mint-100 to-sage-100 grid place-items-center text-forest-400 shrink-0 border border-white shadow-soft">
            {preview ? (
              <img src={preview} alt="Plant preview" className="w-full h-full object-cover" />
            ) : (
              <Leaf size={34} />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-sage-200 text-sm font-bold text-forest-700 hover:bg-sage-50"
            >
              <Camera size={16} /> {preview ? "Change photo" : "Add photo"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={dropPhoto}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-coral-600 hover:bg-coral-50"
              >
                <Trash2 size={14} /> Remove photo
              </button>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className={labelCls}>Plant name</label>
            <input required className={inputCls} placeholder="e.g. My Tomato" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className={labelCls}>Species</label>
            <input required className={inputCls} placeholder="e.g. Tomato" value={form.species} onChange={set("species")} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelCls}>Location</label>
            <select className={inputCls} value={form.location} onChange={set("location")}>
              <option>Indoor</option>
              <option>Outdoor</option>
              <option>Balcony</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Water every (days)</label>
            <input type="number" min="1" max="60" required className={inputCls} value={form.watering_days} onChange={set("watering_days")} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Notes</label>
          <textarea rows="3" className={inputCls + " resize-none"} placeholder="Optional notes about your plant" value={form.notes} onChange={set("notes")} />
        </div>

        <button disabled={saving} className="btn-primary w-full mt-6 py-3.5 rounded-full text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Saving...
            </>
          ) : isEdit ? (
            <>
              <Check size={16} /> Save changes
            </>
          ) : (
            <>
              <Plus size={16} /> Add plant
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default PlantForm;
