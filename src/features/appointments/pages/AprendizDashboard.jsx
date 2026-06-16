import { useEffect, useState, useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";
import { Plus, Calendar, Sparkles, Clock, ChevronRight } from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EmptyState } from "../../../shared/components/EmptyState";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_CONFIG = {
  pending:   { label: "Pendiente",   className: "badge--pending" },
  confirmed: { label: "Confirmada",  className: "badge--confirmed" },
  completed: { label: "Completada",  className: "badge--completed" },
  cancelled: { label: "Cancelada",   className: "badge--cancelled" },
  no_show:   { label: "No asistió",  className: "badge--no-show" },
};

const tips = [
  { text: "La salud mental es tan importante como la física. No descuides tus emociones." },
  { text: "Recuerda llevar tus documentos a la cita: carnet y documento de identidad." },
  { text: "Si no puedes asistir, cancela con al menos 24 horas de anticipación." },
  { text: "La hidratación es clave. Bebe al menos 8 vasos de agua al día." },
  { text: "¿Sabías que el SENA ofrece apoyo psicológico gratuito?" },
];

function LoadingState() {
  return (
    <div className="skeleton-bento animate-fadeIn">
      <div className="skeleton-card">
        <Skeleton variant="heading" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="badge" />
      </div>
      <div className="skeleton-card">
        <Skeleton variant="heading" width="50%" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="40%" />
      </div>
      <div className="skeleton-card">
        <Skeleton variant="heading" width="40%" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" />
      </div>
      <div className="skeleton-card">
        <Skeleton variant="heading" width="45%" />
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export default function AprendizDashboard() {
  const { appointments, createAppointment, fetchAppointmentsSilent, cancelAppointment, isLoading, isCreating } =
    useAppointments();
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAppointmentsSilent();
  }, [fetchAppointmentsSilent]);

  const nextAppointment = useMemo(
    () => appointments.find((a) => a.status === "pending" || a.status === "confirmed"),
    [appointments]
  );

  const randomTip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], []);

  const handleCancel = async (id) => {
    await cancelAppointment(id);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Mis Citas de Bienestar</h1>
          <p>Hola, {profile?.full_name?.split(" ")[0] || "Aprendiz"} — gestiona tu bienestar</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={20} aria-hidden="true" />
            Nueva Cita
          </button>
          <UserAvatar
            name={profile?.full_name}
            onClick={() => setSidebarOpen(true)}
          />
        </div>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title">Solicitar Nueva Cita</h2>
            <AppointmentForm
              createAppointment={createAppointment}
              isCreating={isCreating}
              onSuccess={async () => {
                setShowForm(false);
                await fetchAppointmentsSilent();
              }}
            />
          </div>
        </div>
      )}

      {isLoading && appointments.length === 0 ? (
        <LoadingState />
      ) : appointments.length === 0 ? (
        <div className="bento">
          <div className="card card--elevated card--span-2 card--tall animate-fadeIn">
            <EmptyState
              icon={Calendar}
              title="No tienes citas agendadas"
              description="Agenda tu primera cita con el equipo de bienestar del SENA"
              action={
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                  <Plus size={18} aria-hidden="true" />
                  Agendar mi primera cita
                </button>
              }
            />
          </div>
          <div className="card card--flat animate-fadeIn" style={{ animationDelay: "100ms" }}>
            <div className="card__header">
              <Sparkles size={20} aria-hidden="true" />
              <h3 className="card__title">Consejo del día</h3>
            </div>
            <p className="card__body">{randomTip.text}</p>
          </div>
        </div>
      ) : (
        <div className="bento stagger-enter">
          {/* Next appointment — highlighted card */}
          {nextAppointment && (
            <div className="card card--elevated card--tall card--accent-top" style={{ "--card-accent": "var(--sena-green)" }}>
              <div className="card__header">
                <div>
                  <h3 className="card__title">Próxima Cita</h3>
                  <p className="card__subtitle">
                    {nextAppointment.dependencies?.name}
                  </p>
                </div>
                <span className={`badge ${STATUS_CONFIG[nextAppointment.status]?.className || "badge--pending"}`}>
                  <span className="badge__dot" />
                  {STATUS_CONFIG[nextAppointment.status]?.label || nextAppointment.status}
                </span>
              </div>

              <div className="card__body" style={{ marginTop: "var(--space-md)" }}>
                <div style={{ display: "flex", gap: "var(--space-md)", marginBottom: "var(--space-md)" }}>
                  <Calendar size={20} aria-hidden="true" />
                  <span>
                    {format(parseISO(nextAppointment.scheduled_date), "PPP", { locale: es })}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "var(--space-md)", marginBottom: "var(--space-md)" }}>
                  <Clock size={20} aria-hidden="true" />
                  <span>{nextAppointment.scheduled_time}</span>
                </div>
                {nextAppointment.reason && (
                  <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-sm)" }}>
                    {nextAppointment.reason}
                  </p>
                )}
              </div>

              <div className="card__footer">
                <span style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>
                  {nextAppointment.scheduled_date &&
                    `En ${differenceInDays(
                      parseISO(nextAppointment.scheduled_date),
                      new Date()
                    )} días`}
                </span>
                {nextAppointment.status === "pending" && (
                  <button onClick={() => handleCancel(nextAppointment.id)} className="btn btn-danger btn--sm">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stats summary */}
          <div className="card card--flat">
            <div className="card__header">
              <h3 className="card__title">Resumen</h3>
            </div>
            <div className="card__body">
              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "var(--text-h1)", fontWeight: 700, color: "var(--sena-green)" }}>
                    {appointments.length}
                  </div>
                  <div style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Total</div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-h1)", fontWeight: 700, color: "var(--color-warning)" }}>
                    {appointments.filter((a) => a.status === "pending").length}
                  </div>
                  <div style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Pendientes</div>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-h1)", fontWeight: 700, color: "var(--color-success)" }}>
                    {appointments.filter((a) => a.status === "completed").length}
                  </div>
                  <div style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Completadas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness tip */}
          <div className="card card--flat">
            <div className="card__header">
              <Sparkles size={18} aria-hidden="true" />
              <h3 className="card__title">Consejo del día</h3>
            </div>
            <p className="card__body">{randomTip.text}</p>
          </div>

          {/* Quick actions */}
          <div className="card card--flat">
            <div className="card__header">
              <h3 className="card__title">Acciones rápidas</h3>
            </div>
            <div className="card__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn--block">
                <Plus size={18} aria-hidden="true" /> Nueva Cita
              </button>
              <button className="btn btn-secondary btn--block">
                <Calendar size={18} aria-hidden="true" /> Ver historial
              </button>
            </div>
          </div>

          {/* Appointment history */}
          <div className="card card--elevated card--wide">
            <div className="card__header">
              <h3 className="card__title">Historial de Citas</h3>
              <ChevronRight size={18} color="var(--text-muted)" aria-hidden="true" />
            </div>
            <div className="card__body">
              {appointments.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No hay citas registradas</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                  {appointments.slice(0, 5).map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      isAprendiz={true}
                      onCancel={() => handleCancel(apt.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        appointments={appointments}
      />
    </div>
  );
}
