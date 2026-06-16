import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import SidebarBackdrop from "./SidebarBackdrop";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarProfile from "./SidebarProfile";
import SidebarPassword from "./SidebarPassword";
import SidebarConfig from "./SidebarConfig";
import "../../styles/user-sidebar.css";

const VIEWS = { MENU: "menu", PROFILE: "profile", PASSWORD: "password", CONFIG: "config" };
const STORAGE_KEY = "sena_user_prefs";
const DEFAULT_PREFS = { email_reminders: true, status_alerts: true, advance_days: "3" };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export default function Sidebar({ isOpen, onClose, appointments }) {
  const { user, profile, signOut } = useAuth();
  const [view, setView] = useState(VIEWS.MENU);
  const [profileForm, setProfileForm] = useState({ full_name: "", document_number: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setProfileForm({ full_name: profile.full_name || "", document_number: profile.document_number || "" });
      setView(VIEWS.MENU);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setPrefs(loadPrefs());
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleProfileField = useCallback((key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePasswordField = useCallback((key, value) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim()) { toast.error("El nombre es obligatorio"); return; }
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: profileForm.full_name.trim(),
        document_number: profileForm.document_number.trim(),
      }).eq("id", user.id);
      if (error) throw error;
      toast.success("Perfil actualizado correctamente");
      setView(VIEWS.MENU);
    } catch (err) {
      toast.error("Error al guardar: " + (err.message || err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = passwordForm;
    if (newPassword.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    setIsChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setView(VIEWS.MENU);
    } catch (err) {
      toast.error("Error al cambiar contraseña: " + (err.message || err));
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    await new Promise((r) => setTimeout(r, 400));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setIsSavingPrefs(false);
    toast.success("Preferencias guardadas");
    setView(VIEWS.MENU);
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      <SidebarBackdrop isOpen={isOpen} onClose={onClose} />
      <div className={`user-sidebar ${isOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Panel de usuario">
        <SidebarHeader profile={profile} user={user} onClose={onClose} />
        <div className="sidebar-content">
          {view === VIEWS.MENU && (
            <SidebarMenu
              onNavigate={setView}
              onLogout={handleLogout}
              appointments={appointments}
            />
          )}
          {view === VIEWS.PROFILE && (
            <SidebarProfile
              profileForm={profileForm}
              onChange={handleProfileField}
              onSave={handleSaveProfile}
              onBack={() => setView(VIEWS.MENU)}
              isSaving={isSavingProfile}
              user={user}
              profile={profile}
            />
          )}
          {view === VIEWS.PASSWORD && (
            <SidebarPassword
              passwordForm={passwordForm}
              onChange={handlePasswordField}
              onSave={handleChangePassword}
              onBack={() => setView(VIEWS.MENU)}
              isSaving={isChangingPw}
              showNewPassword={showNewPw}
              showConfirmPassword={showConfirmPw}
              onToggleNew={() => setShowNewPw((p) => !p)}
              onToggleConfirm={() => setShowConfirmPw((p) => !p)}
            />
          )}
          {view === VIEWS.CONFIG && (
            <SidebarConfig
              prefs={prefs}
              onToggle={(key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
              onChangeDays={(v) => setPrefs((p) => ({ ...p, advance_days: v }))}
              onSave={handleSavePrefs}
              onBack={() => setView(VIEWS.MENU)}
              isSaving={isSavingPrefs}
            />
          )}
        </div>
      </div>
    </>
  );
}
