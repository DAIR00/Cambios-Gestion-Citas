import { useState } from "react";
import { ArrowLeft, Save, Mail, Bell, Calendar, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function SidebarConfig({
  prefs,
  onToggle,
  onChangeDays,
  onSave,
  onBack,
  isSaving,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteText !== "ELIMINAR") return;
    setIsDeleting(true);

    const { supabase } = await import("../../../lib/supabase");
    const { toast } = await import("sonner");

    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      toast.success("Cuenta eliminada correctamente");
      window.location.reload();
    } catch {
      toast.error("Error al eliminar cuenta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="sidebar-view">
      <button className="sidebar-back-btn" onClick={onBack} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Mi Cuenta</span>
      </button>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Notificaciones</span>

        <div className="sidebar-toggle-row">
          <div className="sidebar-toggle-info">
            <Mail size={16} aria-hidden="true" />
            <div>
              <span className="sidebar-toggle-label">Recordatorio de citas</span>
              <span className="sidebar-toggle-desc">Recibe un email antes de tu cita</span>
            </div>
          </div>
          <button
            className={`sidebar-toggle ${prefs.email_reminders ? "active" : ""}`}
            onClick={() => onToggle("email_reminders")}
            type="button"
            role="switch"
            aria-checked={prefs.email_reminders}
          >
            <span className="sidebar-toggle-thumb" />
          </button>
        </div>

        <div className="sidebar-toggle-row">
          <div className="sidebar-toggle-info">
            <Bell size={16} aria-hidden="true" />
            <div>
              <span className="sidebar-toggle-label">Alertas de estado</span>
              <span className="sidebar-toggle-desc">Notificar cuando cambia el estado de tu cita</span>
            </div>
          </div>
          <button
            className={`sidebar-toggle ${prefs.status_alerts ? "active" : ""}`}
            onClick={() => onToggle("status_alerts")}
            type="button"
            role="switch"
            aria-checked={prefs.status_alerts}
          >
            <span className="sidebar-toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Visualización</span>

        <div className="sidebar-toggle-row">
          <div className="sidebar-toggle-info">
            <Calendar size={16} aria-hidden="true" />
            <div>
              <span className="sidebar-toggle-label">Días de anticipación</span>
              <span className="sidebar-toggle-desc">Mostrar citas próximas con antelación</span>
            </div>
          </div>
          <select
            className="sidebar-select"
            value={prefs.advance_days}
            onChange={(e) => onChangeDays(e.target.value)}
          >
            <option value="1">1 día</option>
            <option value="3">3 días</option>
            <option value="5">5 días</option>
            <option value="7">7 días</option>
          </select>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Cuenta</span>

        {!showDeleteConfirm ? (
          <button
            className="sidebar-danger-btn"
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
          >
            <Trash2 size={18} aria-hidden="true" />
            <span>Eliminar mi cuenta</span>
          </button>
        ) : (
          <div className="sidebar-delete-confirm">
            <div className="sidebar-delete-warning">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>Esta acción es irreversible. Se eliminarán tus datos permanentemente.</span>
            </div>
            <div className="sidebar-field">
              <label htmlFor="delete-confirm">
                Escribe <strong>ELIMINAR</strong> para confirmar
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="ELIMINAR"
              />
            </div>
            <div className="sidebar-delete-actions">
              <button
                className="btn btn-secondary"
                onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                type="button"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                type="button"
                disabled={isDeleting || deleteText !== "ELIMINAR"}
                aria-busy={isDeleting}
              >
                <span className="btn__label">
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn--block"
        onClick={onSave}
        disabled={isSaving}
        type="button"
        aria-busy={isSaving}
      >
        <span className="btn__label">
          {isSaving ? "Guardando..." : "Guardar Preferencias"}
        </span>
      </button>
    </div>
  );
}
