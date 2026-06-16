import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, User, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Pendiente",   className: "badge--pending" },
  confirmed: { label: "Confirmada",  className: "badge--confirmed" },
  completed: { label: "Completada",  className: "badge--completed" },
  cancelled: { label: "Cancelada",   className: "badge--cancelled" },
  no_show:   { label: "No asistió",  className: "badge--no-show" },
};

export function AppointmentCard({ appointment, onCancel, isAprendiz }) {
  const { dependencies, scheduled_date, scheduled_time, status, reason, profiles } = appointment;
  const config = STATUS_CONFIG[status];

  return (
    <div
      className="card card--flat card--accent-left"
      style={{ "--card-accent": dependencies?.color || "var(--neutral-300)" }}
    >
      <div className="card__header">
        {dependencies?.name && (
          <span
            className="badge"
            style={{
              background: `${dependencies?.color}1a`,
              color: dependencies?.color || "var(--text-secondary)",
              borderColor: `${dependencies?.color}33`,
            }}
          >
            {dependencies.name}
          </span>
        )}
        <span className={`badge ${config.className}`}>
          <span className="badge__dot" />
          {config.label}
        </span>
      </div>

      <div className="card__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontSize: "var(--text-small)" }}>
          <Calendar size={14} aria-hidden="true" />
          <span>{format(parseISO(scheduled_date), "PPP", { locale: es })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontSize: "var(--text-small)" }}>
          <Clock size={14} aria-hidden="true" />
          <span>{scheduled_time}</span>
        </div>
        {reason && (
          <p style={{ marginTop: "var(--space-xs)", color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>
            {reason}
          </p>
        )}
        {!isAprendiz && profiles && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontSize: "var(--text-small)" }}>
            <User size={14} aria-hidden="true" />
            <span>{profiles.full_name}</span>
          </div>
        )}
      </div>

      {isAprendiz && status === "pending" && (
        <div className="card__footer">
          <button onClick={onCancel} className="btn btn-danger btn--sm">
            <XCircle size={14} aria-hidden="true" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
