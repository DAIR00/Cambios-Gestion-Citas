import { useState, useCallback } from "react";
import { UserManagement } from "../components/UserManagement";
import { AuditLogViewer } from "../components/AuditLogViewer";
import { SystemConfig } from "../components/SystemConfig";
import { AdminOverview } from "../components/AdminOverview";
import { AppointmentSupervision } from "../components/AppointmentSupervision";
import { DependencyManagement } from "../components/DependencyManagement";
import { RoleManagement } from "../components/RoleManagement";
import { ReportGenerator } from "../../appointments/components/ReportGenerator";
import { useAuth } from "../../../providers/AuthProvider";
import {
    LayoutDashboard, Users, CalendarCheck, Building2, Shield,
    FileBarChart, ClipboardList, Settings,
} from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";

const TABS = [
    { id: "overview", label: "Panel General", icon: LayoutDashboard },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "supervision", label: "Supervisión Citas", icon: CalendarCheck },
    { id: "dependencies", label: "Dependencias", icon: Building2 },
    { id: "reports", label: "Reportes", icon: FileBarChart },
    { id: "audit", label: "Auditoría", icon: ClipboardList },
    { id: "config", label: "Configuración", icon: Settings },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const { profile } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleNavigate = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Panel de Administración</h1>
                    <p>Gestión completa del sistema de bienestar SENA</p>
                </div>
                <div className="header-actions">
                    <UserAvatar name={profile?.full_name} onClick={() => setSidebarOpen(true)} />
                </div>
            </header>

            <nav className="admin-tabs">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <section className="admin-content">
                {activeTab === "overview" && <AdminOverview onNavigate={handleNavigate} />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "roles" && <RoleManagement />}
                {activeTab === "supervision" && <AppointmentSupervision />}
                {activeTab === "dependencies" && <DependencyManagement />}
                {activeTab === "reports" && (
                    <ReportGenerator title="Reporte General de Citas" variant="full" />
                )}
                {activeTab === "audit" && <AuditLogViewer />}
                {activeTab === "config" && <SystemConfig />}
            </section>

            <UserSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
        </div>
    );
}
