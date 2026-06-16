import { ArrowLeft, Save, Shield, Briefcase, Loader2 } from "lucide-react";

export default function SidebarProfile({
  profileForm,
  onChange,
  onSave,
  onBack,
  isSaving,
  user,
  profile,
}) {
  return (
    <div className="sidebar-view">
      <button className="sidebar-back-btn" onClick={onBack} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Mi Cuenta</span>
      </button>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Información Personal</span>

        <div className="sidebar-field">
          <label htmlFor="sidebar-name">Nombre completo</label>
          <input
            id="sidebar-name"
            type="text"
            value={profileForm.full_name}
            onChange={(e) => onChange("full_name", e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        <div className="sidebar-field">
          <label htmlFor="sidebar-doc">Número de documento</label>
          <input
            id="sidebar-doc"
            type="text"
            value={profileForm.document_number}
            onChange={(e) => onChange("document_number", e.target.value)}
            placeholder="Tu documento"
          />
        </div>

        <div className="sidebar-field">
          <label htmlFor="sidebar-email">Email</label>
          <input id="sidebar-email" type="email" value={user?.email || ""} disabled />
        </div>

        <div className="sidebar-badges">
          <span className="sidebar-badge">
            <Briefcase size={13} aria-hidden="true" />
            {profile?.dependencies?.name || "Sin dependencia"}
          </span>
          <span className="sidebar-badge sidebar-badge-role">
            <Shield size={13} aria-hidden="true" />
            {profile?.roles?.name}
          </span>
        </div>
      </div>

      <button
        className="btn btn-primary btn--block"
        onClick={onSave}
        disabled={isSaving}
        type="button"
        aria-busy={isSaving}
      >
        <span className="btn__label">
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </span>
      </button>
    </div>
  );
}
