import { supabase } from "../../../lib/supabase";

export class AdminRepository {
    static async getUsers({ role, status, search, page = 1, limit = 20 }) {
        let query = supabase
            .from("profiles")
            .select(
                `
            *,
            roles (name, description),
            dependencies (name)
        `,
                { count: "exact" }
            );

        if (role) query = query.eq("roles.name", role);
        if (status !== undefined) query = query.eq("is_active", status);
        if (search) {
            query = query.or(
                `full_name.ilike.%${search}%, document_number.ilike.%${search}%`
            );
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query.range(from, to);
        if (error) throw new Error(`Error fetching users: ${error.message}`);
        return { users: data, total: count, page, totalPages: Math.ceil(count / limit) };
    }

    static async updateUser(userId, updates, adminId) {
        const { data: oldData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        const { data: newData, error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date() })
            .eq("id", userId)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_USER",
            entityType: "user",
            entityId: userId,
            oldData,
            newData,
        });

        return newData;
    }

    static async createUser({ email, password, fullName, roleId, dependencyId }, adminId) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        });

        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .update({ role_id: roleId, dependency_id: dependencyId })
            .eq("id", authData.user.id)
            .select()
            .single();

        if (profileError) throw profileError;

        await this.logAction({
            userId: adminId,
            action: "CREATE_USER",
            entityType: "user",
            entityId: authData.user.id,
            newData: profile,
        });

        return profile;
    }

    static async getAuditLogs({ action, userId, dateFrom, dateTo, page = 1, limit = 50 }) {
        let query = supabase
            .from("audit_logs")
            .select(
                `
            *,
            admin:profiles!user_id (full_name,email)
        `,
                { count: "exact" }
            );

        if (action) query = query.eq("action", action);
        if (userId) query = query.eq("user_id", userId);
        if (dateFrom) query = query.gte("created_at", dateFrom);
        if (dateTo) query = query.lte("created_at", dateTo);

        const from = (page - 1) * limit;
        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, from + limit - 1);

        if (error) throw error;
        return { logs: data, total: count };
    }

    static async getConfig() {
        const { data, error } = await supabase
            .from("system_config")
            .select("*")

        if (error) throw error;
        return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    }
    static async updateConfig(key, value, adminId) {
        const { data: oldConfigRows } = await supabase
            .from("system_config")
            .select("*")
            .eq("key", key);

        const oldConfig = oldConfigRows?.[0] || null;

        const { data, error } = await supabase
            .from("system_config")
            .upsert({
                key,
                value,
                updated_by: adminId,
                updated_at: new Date(),
            }, { onConflict: "key" })
            .select()
            .single();
        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_CONFIG",
            entityType: "config",
            entityId: key,
            oldData: oldConfig,
            newData: data,
        });

        return data;
    }

    // GLOBAL STATS: Estadísticas globales para el overview del admin
    static async getGlobalStats() {
        const [usersResult, appointmentsResult, professionalsResult] = await Promise.all([
            supabase.from("profiles").select("id, is_active, role_id, roles(name)"),
            supabase.from("appointments").select("status, scheduled_date, created_at"),
            supabase.from("profiles").select("id").in("role_id", [3, 4, 5]),
        ]);

        if (usersResult.error) throw usersResult.error;
        if (appointmentsResult.error) throw appointmentsResult.error;

        const users = usersResult.data || [];
        const appointments = appointmentsResult.data || [];
        const professionals = professionalsResult.data || [];

        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.is_active).length;
        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter((a) => a.status === "completed").length;
        const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
        const activeProfessionals = professionals.length;

        return {
            totalUsers,
            activeUsers,
            totalAppointments,
            completedAppointments,
            completionRate,
            activeProfessionals,
        };
    }

    // USER STATS: Distribución de usuarios por rol
    static async getUserStats() {
        const { data, error } = await supabase
            .from("profiles")
            .select("role_id, roles(name)")
            .not("role_id", "is", null);

        if (error) throw error;

        const grouped = (data || []).reduce((acc, user) => {
            const roleName = user.roles?.name || "Sin rol";
            if (!acc[roleName]) acc[roleName] = { role: roleName, count: 0 };
            acc[roleName].count++;
            return acc;
        }, {});

        return Object.values(grouped);
    }

    // APPOINTMENT STATUS STATS: Citas por estado (para donut chart)
    static async getAppointmentStatusStats() {
        const { data, error } = await supabase
            .from("appointments")
            .select("status");

        if (error) throw error;

        const grouped = (data || []).reduce((acc, apt) => {
            if (!acc[apt.status]) acc[apt.status] = { status: apt.status, count: 0 };
            acc[apt.status].count++;
            return acc;
        }, {});

        return Object.values(grouped);
    }

    // RECENT ACTIVITY: Últimas citas para el feed de actividad
    static async getRecentActivity(limit = 10) {
        const { data, error } = await supabase
            .from("appointments")
            .select(`
                id, status, scheduled_date, scheduled_time, created_at,
                dependencies (name, color),
                profiles!user_id (full_name)
            `)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    // ALL APPOINTMENTS: Citas globales con filtros (sin filtro de dependency)
    static async getAllAppointments({ dependencyId, professionalId, status, search, dateFrom, dateTo, page = 1, limit = 20 }) {
        let query = supabase
            .from("appointments")
            .select(`
                *,
                dependencies (name, color),
                profiles!user_id (full_name, document_number),
                professional:profiles!professional_id (full_name)
            `, { count: "exact" });

        if (dependencyId) query = query.eq("dependency_id", dependencyId);
        if (professionalId) query = query.eq("professional_id", professionalId);
        if (status) query = query.eq("status", status);
        if (dateFrom) query = query.gte("scheduled_date", dateFrom);
        if (dateTo) query = query.lte("scheduled_date", dateTo);
        if (search) {
            query = query.or(
                `profiles.full_name.ilike.%${search}%, profiles.document_number.ilike.%${search}%`
            );
        }

        const from = (page - 1) * limit;
        const { data, error, count } = await query
            .order("scheduled_date", { ascending: false })
            .order("scheduled_time", { ascending: false })
            .range(from, from + limit - 1);

        if (error) throw new Error(`Error fetching appointments: ${error.message}`);
        return { appointments: data, total: count, page, totalPages: Math.ceil(count / limit) };
    }

    // REASSIGN APPOINTMENT: Reasignar profesional a una cita
    static async reassignAppointment(appointmentId, newProfessionalId, adminId) {
        const { data: oldData } = await supabase
            .from("appointments")
            .select("*, professional:profiles!professional_id(full_name)")
            .eq("id", appointmentId)
            .single();

        const { data: newData, error } = await supabase
            .from("appointments")
            .update({ professional_id: newProfessionalId, updated_at: new Date() })
            .eq("id", appointmentId)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "REASSIGN_APPOINTMENT",
            entityType: "appointment",
            entityId: appointmentId,
            oldData,
            newData,
        });

        return newData;
    }

    // DEPENDENCY STATS: Estadísticas de cada dependencia
    static async getDependencyStats() {
        const [depsResult, profsResult, aptsResult] = await Promise.all([
            supabase.from("dependencies").select("*"),
            supabase.from("profiles").select("dependency_id, role_id").in("role_id", [3, 4, 5]),
            supabase.from("appointments").select("dependency_id, status"),
        ]);

        if (depsResult.error) throw depsResult.error;

        const deps = depsResult.data || [];
        const profs = profsResult.data || [];
        const apts = aptsResult.data || [];

        return deps.map((dep) => {
            const professionalCount = profs.filter((p) => p.dependency_id === dep.id).length;
            const depAppointments = apts.filter((a) => a.dependency_id === dep.id);
            const appointmentCount = depAppointments.length;
            const completedCount = depAppointments.filter((a) => a.status === "completed").length;

            return {
                ...dep,
                professionalCount,
                appointmentCount,
                completedCount,
                completionRate: appointmentCount > 0 ? Math.round((completedCount / appointmentCount) * 100) : 0,
            };
        });
    }

    // CREATE DEPENDENCY
    static async createDependency({ name, color }, adminId) {
        const { data, error } = await supabase
            .from("dependencies")
            .insert({ name, color })
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "CREATE_DEPENDENCY",
            entityType: "dependency",
            entityId: data.id,
            newData: data,
        });

        return data;
    }

    // UPDATE DEPENDENCY
    static async updateDependency(id, updates, adminId) {
        const { data: oldData } = await supabase
            .from("dependencies")
            .select("*")
            .eq("id", id)
            .single();

        const { data, error } = await supabase
            .from("dependencies")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_DEPENDENCY",
            entityType: "dependency",
            entityId: id,
            oldData,
            newData: data,
        });

        return data;
    }

    // DELETE DEPENDENCY
    static async deleteDependency(id, adminId) {
        const { data: oldData } = await supabase
            .from("dependencies")
            .select("*")
            .eq("id", id)
            .single();

        const { error } = await supabase
            .from("dependencies")
            .delete()
            .eq("id", id);

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "DELETE_DEPENDENCY",
            entityType: "dependency",
            entityId: id,
            oldData,
        });
    }

    // GET PROFESSIONALS BY DEPENDENCY: Profesionales de una dependencia específica
    static async getProfessionalsByDependency(dependencyId) {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("dependency_id", dependencyId)
            .in("role_id", [3, 4, 5]);

        if (error) throw error;
        return data || [];
    }

    // GET ADMINS: Lista de usuarios con rol admin/coordinador (para filtro de auditoría)
    static async getAdmins() {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, roles(name)")
            .in("role_id", [1, 2]);

        if (error) throw error;
        return data || [];
    }

    // APPOINTMENTS BY DEPENDENCY: Citas agrupadas por dependencia (para gráfico de barras)
    static async getAppointmentsByDependency(dateRange) {
        let query = supabase
            .from("appointments")
            .select("dependency_id, dependencies(name, color), status");

        if (dateRange?.from) query = query.gte("scheduled_date", dateRange.from);
        if (dateRange?.to) query = query.lte("scheduled_date", dateRange.to);

        const { data, error } = await query;
        if (error) throw error;

        const grouped = (data || []).reduce((acc, curr) => {
            const depName = curr.dependencies?.name || "Sin dependencia";
            const color = curr.dependencies?.color || "#ccc";
            if (!acc[depName]) acc[depName] = { name: depName, color, total: 0, completed: 0, cancelled: 0 };
            acc[depName].total++;
            if (curr.status === "completed") acc[depName].completed++;
            if (curr.status === "cancelled") acc[depName].cancelled++;
            return acc;
        }, {});

        return Object.values(grouped);
    }

    // MONTHLY EVOLUTION: Tendencia mensual de citas (para gráfico de líneas)
    static async getMonthlyEvolution(year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data, error } = await supabase
            .from("appointments")
            .select("status, scheduled_date")
            .gte("scheduled_date", startDate)
            .lte("scheduled_date", endDate);

        if (error) throw error;

        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        const grouped = (data || []).reduce((acc, curr) => {
            const date = new Date(curr.scheduled_date);
            const monthIdx = date.getMonth();
            const monthName = months[monthIdx];
            if (!acc[monthName]) acc[monthName] = { name: monthName, month: monthIdx, total: 0, completed: 0 };
            acc[monthName].total++;
            if (curr.status === "completed") acc[monthName].completed++;
            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => a.month - b.month);
    }

    // GET ROLES: Obtener todos los roles con conteo de usuarios
    static async getRoles() {
        const { data: roles, error: rolesError } = await supabase
            .from("roles")
            .select("*")
            .order("id");

        if (rolesError) throw rolesError;

        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("role_id");

        if (profilesError) throw profilesError;

        const counts = (profiles || []).reduce((acc, p) => {
            acc[p.role_id] = (acc[p.role_id] || 0) + 1;
            return acc;
        }, {});

        return (roles || []).map((role) => ({
            ...role,
            userCount: counts[role.id] || 0,
            permissions: Array.isArray(role.permissions) ? role.permissions : [],
        }));
    }

    // GET USERS BY ROLE: Usuarios de un rol específico
    static async getUsersByRole(roleId) {
        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, email, document_number, is_active, dependencies(name)")
            .eq("role_id", roleId);

        if (error) throw error;
        return data || [];
    }

    // UPDATE ROLE PERMISSIONS: Actualizar permisos de un rol
    static async updateRolePermissions(roleId, permissions, adminId) {
        const { data: oldData } = await supabase
            .from("roles")
            .select("*")
            .eq("id", roleId)
            .single();

        const { data, error } = await supabase
            .from("roles")
            .update({ permissions })
            .eq("id", roleId)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_ROLE_PERMISSIONS",
            entityType: "role",
            entityId: roleId,
            oldData,
            newData: data,
        });

        return data;
    }

    // CREATE ROLE: Crear nuevo rol
    static async createRole({ name, description, permissions }, adminId) {
        const { data, error } = await supabase
            .from("roles")
            .insert({ name, description, permissions })
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "CREATE_ROLE",
            entityType: "role",
            entityId: data.id,
            newData: data,
        });

        return data;
    }

    // UPDATE ROLE: Actualizar nombre y descripción de un rol
    static async updateRole(roleId, { name, description }, adminId) {
        const { data: oldData } = await supabase
            .from("roles")
            .select("*")
            .eq("id", roleId)
            .single();

        const { data, error } = await supabase
            .from("roles")
            .update({ name, description })
            .eq("id", roleId)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_ROLE",
            entityType: "role",
            entityId: roleId,
            oldData,
            newData: data,
        });

        return data;
    }

    // DELETE ROLE: Eliminar rol (solo si no tiene usuarios)
    static async deleteRole(roleId, adminId) {
        const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role_id", roleId);

        if (count > 0) {
            throw new Error(`No se puede eliminar: tiene ${count} usuario(s) asignado(s)`);
        }

        const { data: oldData } = await supabase
            .from("roles")
            .select("*")
            .eq("id", roleId)
            .single();

        const { error } = await supabase
            .from("roles")
            .delete()
            .eq("id", roleId);

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "DELETE_ROLE",
            entityType: "role",
            entityId: roleId,
            oldData,
        });
    }

    static async logAction({ userId, action, entityType, entityId, oldData, newData }) {
        const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

        const { error } = await supabase.from("audit_logs").insert({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            oid_data: oldData,
            new_data: newData,
            user_agent: userAgent
        });

        if (error) {
            console.error("Error logging audit action:", error.message);
        }
    }
}
