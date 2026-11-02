import React from "react";
import { Sprout, Stethoscope, Info, LogOut, X, Mail, Pencil, BellRing } from "../icons";
import { InitialAvatar } from "./Helpers";

/* ---------------------------------------------------------
   ProfileMenu: profile ka popup.
   - Mobile par neeche se bottom-sheet ki tarah khulta hai
   - Desktop par header ke neeche card ki tarah

   Props:
     open          -> true/false
     onClose       -> band karne ke liye
     user          -> { name, email }
     plantsCount   -> kitne plants hain
     scansCount    -> kitne AI scans hue
     onNavigate    -> page badalne ke liye (setPage)
     onLogout      -> logout function
     onEdit        -> "Edit profile" popup kholne ke liye
--------------------------------------------------------- */
function ProfileMenu({ open, onClose, user, plantsCount = 0, scansCount = 0, onNavigate, onLogout, onEdit }) {
  if (!open) return null;

  const go = (page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90]">
      {/* dark overlay: bahar dabane par band */}
      <div className="absolute inset-0 bg-forest-950/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* panel */}
      <div
        className="absolute bottom-0 inset-x-0 md:inset-x-auto md:bottom-auto md:top-24 md:right-8 md:w-80
                   glass bg-white/95 rounded-t-[2rem] md:rounded-[2rem] shadow-card p-5 pb-safe animate-sheet-up"
        role="dialog"
        aria-label="Profile"
      >
        <button
          onClick={onClose}
          aria-label="Close profile"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-sage-100 text-forest-600 grid place-items-center hover:bg-sage-200 transition"
        >
          <X size={16} />
        </button>

        {/* name + email */}
        <div className="flex flex-col items-center text-center pt-2">
          <InitialAvatar name={user.name} src={user.avatar} large />
          <h3 className="mt-3 text-lg font-extrabold text-forest-900">{user.name}</h3>
          {user.email && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Mail size={12} /> {user.email}
            </p>
          )}
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-2xl bg-mint-50 p-3 text-center">
            <div className="text-2xl font-extrabold text-forest-800">{plantsCount}</div>
            <div className="text-[11px] font-semibold text-forest-500">My Plants</div>
          </div>
          <div className="rounded-2xl bg-mint-50 p-3 text-center">
            <div className="text-2xl font-extrabold text-forest-800">{scansCount}</div>
            <div className="text-[11px] font-semibold text-forest-500">AI Scans</div>
          </div>
        </div>

        {/* links */}
        <div className="mt-4 space-y-1.5">
          <MenuRow icon={Pencil} label="Edit profile" onClick={() => { onClose(); onEdit(); }} />
          <MenuRow icon={Sprout} label="My Plants" onClick={() => go("plants")} />
          <MenuRow icon={BellRing} label="Reminders" onClick={() => go("reminders")} />
          <MenuRow icon={Stethoscope} label="Plant Doctor" onClick={() => go("doctor")} />
          <MenuRow icon={Info} label="About PlantCare AI" onClick={() => go("project-info")} />
        </div>

        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-coral-50 text-coral-600 font-bold text-sm hover:bg-coral-100 transition"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left text-forest-800 hover:bg-sage-100 transition"
    >
      <span className="w-9 h-9 rounded-full bg-sage-100 text-forest-600 grid place-items-center">
        <Icon size={17} />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

export default ProfileMenu;
