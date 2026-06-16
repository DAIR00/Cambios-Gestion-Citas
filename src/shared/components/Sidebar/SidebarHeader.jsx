import { X, Shield } from "lucide-react";
import UserAvatar from "../UserAvatar";

export default function SidebarHeader({ profile, user, onClose }) {
  return (
    <div className="sidebar-user-header">
      <button className="sidebar-close" onClick={onClose} type="button" aria-label="Cerrar panel">
        <X size={20} />
      </button>
      <UserAvatar name={profile?.full_name} size="lg" />
      <div className="sidebar-user-info">
        <h3 className="sidebar-user-name">{profile?.full_name || "Usuario"}</h3>
        <span className="sidebar-user-role">
          <Shield size={13} aria-hidden="true" />
          {profile?.roles?.name || "Sin rol"}
        </span>
        <span className="sidebar-user-email">{user?.email}</span>
      </div>
    </div>
  );
}
