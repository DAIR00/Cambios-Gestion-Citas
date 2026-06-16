import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Ban } from "lucide-react";

const STATUS_CONFIG = {
    pending: { label: "Pendiente", color: "#f59e0b", icon: AlertCircle },
    confirmed: { label: "Confirmada", color: "#3b82f6", icon: Clock },
    completed: { label: "Completada", color: "#22c55e", icon: CheckCircle },
    cancelled: { label: "Cancelada", color: "#9ca3af", icon: Ban },
    no_show: { label: "No asistió", color: "#ef4444", icon: XCircle },
};

export function ActivityFeed({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="activity-feed">
                <h3>Actividad Reciente</h3>
                <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Sin actividad reciente</p>
            </div>
        );
    }

    return (
        <div className="activity-feed">
            <h3>Actividad Reciente</h3>
            <div className="activity-list">
                {data.map((apt) => {
                    const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                    const Icon = config.icon;
                    return (
                        <div key={apt.id} className="activity-item">
                            <div className="activity-dot" style={{ background: config.color }} />
                            <div className="activity-content">
                                <div className="activity-main">
                                    <span className="activity-name">
                                        {apt.profiles?.full_name || "Sin nombre"}
                                    </span>
                                    <span className="activity-action" style={{ color: config.color }}>
                                        <Icon size={12} />
                                        {config.label}
                                    </span>
                                </div>
                                <div className="activity-meta">
                                    <span>
                                        <Calendar size={12} />
                                        {format(parseISO(apt.scheduled_date), "dd MMM", { locale: es })}
                                    </span>
                                    <span>
                                        <Clock size={12} />
                                        {apt.scheduled_time}
                                    </span>
                                    <span
                                        className="activity-dep"
                                        style={{ background: apt.dependencies?.color || "#ccc" }}
                                    >
                                        {apt.dependencies?.name || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
