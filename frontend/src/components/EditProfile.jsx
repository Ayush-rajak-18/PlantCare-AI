import React, { useRef, useState } from "react";
import * as Icons from "../icons";
import { api, apiJson, assetUrl } from "../api";
import { compressImage, checkImageFile } from "../imageUtils";
import { InitialAvatar } from "./Helpers";
import { inputCls, labelCls, overlayCls, sheetCls } from "../ui";

const { X, Camera, Trash2, Lock, RefreshCw } = Icons;

/* ---------------------------------------------------------
   EditProfile: naam, profile photo aur password badalna

   Props:
     user        -> { name, email, avatar }
     onClose     -> 
     onUpdated   -> save (App usse state + localStorage update)
     setToast    -> message
--------------------------------------------------------- */
function EditProfile({ user, onClose, onUpdated, setToast }) {
  const fileRef = useRef(null);

  const [name, setName] = useState(user.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar ? assetUrl(user.avatar) : "");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const problem = checkImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }

    const small = await compressImage(file, 600);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setAvatarFile(small);
    setPreview(URL.createObjectURL(small));
    setRemoveAvatar(false);
    setError("");
  }

  function dropPhoto() {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setAvatarFile(null);
    setPreview("");
    setRemoveAvatar(true);
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name cannot be empty.");

    if (newPassword || confirm || currentPassword) {
      if (!currentPassword) return setError("Enter your current password to change it.");
      if (newPassword.length < 6) return setError("New password must be at least 6 characters.");
      if (newPassword !== confirm) return setError("New password and confirmation do not match.");
    }

    setSaving(true);
    try {
      const body = { name: name.trim() };
      if (newPassword) {
        body.current_password = currentPassword;
        body.new_password = newPassword;
      }

      let updated = await apiJson("/auth/profile", "PUT", body);

      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        updated = await api("/auth/avatar", { method: "POST", body: fd });
      } else if (removeAvatar && user.avatar) {
        updated = await api("/auth/avatar", { method: "DELETE" });
      }

      onUpdated(updated);
      setToast(newPassword ? "Profile and password updated." : "Profile updated.");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // preview InitialAvatar 
  return (
    <div className={overlayCls} onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className={sheetCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold">Edit profile</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-sage-100 text-forest-600 grid place-items-center">
            <X size={16} />
          </button>
        </div>

        {/* photo */}
        <div className="mt-5 flex items-center gap-4">
          <div className="scale-[1.6] origin-left mr-6">
            <InitialAvatar name={name || user.name} src={preview} large />
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
              <button type="button" onClick={dropPhoto} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-coral-600 hover:bg-coral-50">
                <Trash2 size={14} /> Remove photo
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
        </div>

        <div className="mt-5">
          <label className={labelCls}>Full name</label>
          <input required maxLength={60} className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className={labelCls}>Email</label>
          <input disabled className={inputCls + " opacity-60"} value={user.email || ""} readOnly />
        </div>

        {/* password */}
        <div className="mt-6 rounded-3xl bg-white/70 border border-white p-4">
          <p className="flex items-center gap-2 text-sm font-extrabold text-forest-800">
            <Lock size={15} /> Change password <span className="text-[11px] font-semibold text-slate-400">(optional)</span>
          </p>
          <input type="password" autoComplete="current-password" className={inputCls} placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <input type="password" autoComplete="new-password" className={inputCls} placeholder="New password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <input type="password" autoComplete="new-password" className={inputCls} placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-coral-50 border border-coral-100 px-4 py-3 text-coral-600 text-sm">{error}</div>
        )}

        <button disabled={saving} className="btn-primary w-full mt-6 py-3.5 rounded-full text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Saving... 
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
