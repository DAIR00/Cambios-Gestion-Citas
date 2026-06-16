import { User, Settings, Lock, LogOut, ChevronRight, Calendar, Clock, CheckCircle2 } from "lucide-react";

const VIEWS = { MENU: "menu", PROFILE: "profile", PASSWORD: "password", CONFIG: "config" };

export default function SidebarMenu({ onNavigate, onLogout, appointments }) {
  const menuItems = [
    { icon: User, label: "Mi Perfil", view: VIEWS.PROFILE },
    { icon: Settings, label: "Configuración", view: VIEWS.CONFIG },
    { icon: Lock, label: "Cambiar Contraseña", view: VIEWS.PASSWORD },
  ];

  return (
    <>
      <div className="sidebar-section">
        <span className="sidebar-section-label">Mi Cuenta</span>
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="sidebar-menu-item"
            onClick={() => onNavigate(item.view)}
            type="button"
          >
            <item.icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
            <ChevronRight size={16} className="menu-arrow" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Sesión</span>
        <button className="sidebar-menu-item sidebar-logout" onClick={onLogout} type="button">
          <LogOut size={18} aria-hidden="true" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {appointments && (
        <div className="sidebar-stats">
          <span className="sidebar-section-label">Resumen</span>
          <div className="sidebar-stat-grid">
            <div className="sidebar-stat-item">
              <Calendar size={16} aria-hidden="true" />
              <span className="sidebar-stat-value">{appointments.length}</span>
              <span className="sidebar-stat-label">Agendadas</span>
            </div>
            <div className="sidebar-stat-item">
              <Clock size={16} aria-hidden="true" />
              <span className="sidebar-stat-value">{appointments.filter((a) => a.status === "pending").length}</span>
              <span className="sidebar-stat-label">Pendientes</span>
            </div>
            <div className="sidebar-stat-item">
              <CheckCircle2 size={16} aria-hidden="true" />
              <span className="sidebar-stat-value">{appointments.filter((a) => a.status === "completed").length}</span>
              <span className="sidebar-stat-label">Completadas</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
