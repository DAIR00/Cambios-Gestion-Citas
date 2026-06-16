import { useState, useCallback } from "react";
import { AdminRepository } from "../api/admin.repository";
import { useAuth } from "../../../providers/AuthProvider";
import { toast } from "sonner";

export function useAdmin() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [config, setConfig] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(false);

    // Overview state
    const [globalStats, setGlobalStats] = useState(null);
    const [userStats, setUserStats] = useState([]);
    const [appointmentStatusStats, setAppointmentStatusStats] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [byDependency, setByDependency] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);

    // Audit state
    const [admins, setAdmins] = useState([]);

    // Supervision state
    const [allAppointments, setAllAppointments] = useState([]);
    const [appointmentPagination, setAppointmentPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // Dependencies state
    const [dependencies, setDependencies] = useState([]);

    // USERS
    const fetchUsers = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await AdminRepository.getUsers(filters);
            setUsers(result.users);
            setPagination({
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
            });
        } catch {
            toast.error("Error al cargar los usuarios");
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserRole = async (userId, { roleId, dependencyId, isActive }) => {
        try {
            await AdminRepository.updateUser(userId, {
                role_id: roleId,
                dependency_id: dependencyId,
                is_active: isActive,
            }, user.id);

            toast.success("Usuario actualizado exitosamente");
            await fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const createUser = async (userData) => {
        try {
            await AdminRepository.createUser(userData, user.id);
            toast.success("Usuario creado exitosamente");
            await fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // AUDIT LOGS
    const fetchAuditLogs = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await AdminRepository.getAuditLogs(filters);
            setAuditLogs(result.logs);
        } catch {
            toast.error("Error cargando auditoría");
        } finally {
            setLoading(false);
        }
    }, []);

    // CONFIG
    const fetchConfig = useCallback(async () => {
        try {
            const data = await AdminRepository.getConfig();
            setConfig(data);
        } catch {
            toast.error("Error cargando configuración");
        }
    }, []);

    const updateConfig = async (key, value) => {
        try {
            await AdminRepository.updateConfig(key, value, user.id);
            toast.success("Configuración actualizada");
            await fetchConfig();
        } catch (err) {
            toast.error(err.message);
        }
    };

    // OVERVIEW
    const fetchGlobalStats = useCallback(async () => {
        try {
            const [stats, uStats, aptStats, activity] = await Promise.allSettled([
                AdminRepository.getGlobalStats(),
                AdminRepository.getUserStats(),
                AdminRepository.getAppointmentStatusStats(),
                AdminRepository.getRecentActivity(10),
            ]);

            if (stats.status === "fulfilled") setGlobalStats(stats.value);
            if (uStats.status === "fulfilled") setUserStats(uStats.value);
            if (aptStats.status === "fulfilled") setAppointmentStatusStats(aptStats.value);
            if (activity.status === "fulfilled") setRecentActivity(activity.value);
        } catch {
            toast.error("Error cargando estadísticas");
        }
    }, []);

    // ADMINS (for audit filter)
    const fetchAdmins = useCallback(async () => {
        try {
            const data = await AdminRepository.getAdmins();
            setAdmins(data);
        } catch {
            toast.error("Error cargando administradores");
        }
    }, []);

    // CHART DATA
    const fetchDependencyChartData = useCallback(async (dateRange) => {
        try {
            const data = await AdminRepository.getAppointmentsByDependency(dateRange);
            setByDependency(data);
        } catch {
            toast.error("Error cargando datos de dependencias");
        }
    }, []);

    const fetchMonthlyTrend = useCallback(async (year) => {
        try {
            const data = await AdminRepository.getMonthlyEvolution(year);
            setMonthlyTrend(data);
        } catch {
            toast.error("Error cargando tendencia mensual");
        }
    }, []);

    // ALL APPOINTMENTS (Supervision)
    const fetchAllAppointments = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await AdminRepository.getAllAppointments(filters);
            setAllAppointments(result.appointments);
            setAppointmentPagination({
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
            });
        } catch {
            toast.error("Error cargando citas");
        } finally {
            setLoading(false);
        }
    }, []);

    const reassignAppointment = async (appointmentId, newProfessionalId) => {
        try {
            await AdminRepository.reassignAppointment(appointmentId, newProfessionalId, user.id);
            toast.success("Profesional reasignado correctamente");
            return { success: true };
        } catch (err) {
            toast.error(err.message);
            return { success: false };
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            await AdminRepository.updateAppointment
                ? await AdminRepository.update(appointmentId, { status: "cancelled" })
                : await import("../api/admin.repository").then((m) =>
                    m.supabase?.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId)
                );
            toast.success("Cita cancelada");
            return { success: true };
        } catch {
            toast.error("Error cancelando cita");
            return { success: false };
        }
    };

    // DEPENDENCIES
    const fetchDependencies = useCallback(async () => {
        try {
            const stats = await AdminRepository.getDependencyStats();
            setDependencies(stats);
        } catch {
            toast.error("Error cargando dependencias");
        }
    }, []);

    const createDependency = async (data) => {
        try {
            await AdminRepository.createDependency(data, user.id);
            toast.success("Dependencia creada");
            await fetchDependencies();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const updateDependency = async (id, data) => {
        try {
            await AdminRepository.updateDependency(id, data, user.id);
            toast.success("Dependencia actualizada");
            await fetchDependencies();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteDependency = async (id) => {
        try {
            await AdminRepository.deleteDependency(id, user.id);
            toast.success("Dependencia eliminada");
            await fetchDependencies();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const getProfessionalsByDependency = async (dependencyId) => {
        try {
            return await AdminRepository.getProfessionalsByDependency(dependencyId);
        } catch {
            toast.error("Error cargando profesionales");
            return [];
        }
    };

    // ROLES
    const [roles, setRoles] = useState([]);
    const [usersByRole, setUsersByRole] = useState([]);

    const fetchRoles = useCallback(async () => {
        try {
            const data = await AdminRepository.getRoles();
            setRoles(data);
        } catch {
            toast.error("Error cargando roles");
        }
    }, []);

    const fetchUsersByRole = useCallback(async (roleId) => {
        try {
            const data = await AdminRepository.getUsersByRole(roleId);
            setUsersByRole(data);
        } catch {
            toast.error("Error cargando usuarios del rol");
        }
    }, []);

    const updateRolePermissions = async (roleId, permissions) => {
        try {
            await AdminRepository.updateRolePermissions(roleId, permissions, user.id);
            toast.success("Permisos actualizados");
            await fetchRoles();
            return { success: true };
        } catch (err) {
            toast.error(err.message);
            return { success: false };
        }
    };

    const createRole = async (data) => {
        try {
            await AdminRepository.createRole(data, user.id);
            toast.success("Rol creado");
            await fetchRoles();
            return { success: true };
        } catch (err) {
            toast.error(err.message);
            return { success: false };
        }
    };

    const updateRole = async (roleId, data) => {
        try {
            await AdminRepository.updateRole(roleId, data, user.id);
            toast.success("Rol actualizado");
            await fetchRoles();
            return { success: true };
        } catch (err) {
            toast.error(err.message);
            return { success: false };
        }
    };

    const deleteRole = async (roleId) => {
        try {
            await AdminRepository.deleteRole(roleId, user.id);
            toast.success("Rol eliminado");
            await fetchRoles();
            return { success: true };
        } catch (err) {
            toast.error(err.message);
            return { success: false };
        }
    };

    return {
        users,
        auditLogs,
        config,
        pagination,
        loading,
        globalStats,
        userStats,
        appointmentStatusStats,
        recentActivity,
        byDependency,
        monthlyTrend,
        admins,
        allAppointments,
        appointmentPagination,
        dependencies,
        roles,
        usersByRole,
        fetchUsers,
        updateUserRole,
        createUser,
        fetchAuditLogs,
        fetchConfig,
        updateConfig,
        fetchGlobalStats,
        fetchAdmins,
        fetchDependencyChartData,
        fetchMonthlyTrend,
        fetchAllAppointments,
        reassignAppointment,
        cancelAppointment,
        fetchDependencies,
        createDependency,
        updateDependency,
        deleteDependency,
        getProfessionalsByDependency,
        fetchRoles,
        fetchUsersByRole,
        updateRolePermissions,
        createRole,
        updateRole,
        deleteRole,
    };
}
