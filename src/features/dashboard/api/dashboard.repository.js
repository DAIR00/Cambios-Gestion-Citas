import { supabase } from "../../../lib/supabase";

export class DashboardRepository {
    static async getKPI(dateRange) {
        const { data, error } = await supabase
            .from("appointments")
            .select("status, scheduled_date, created_at")
            .gte("scheduled_date", dateRange.from)
            .lte("scheduled_date", dateRange.to);

        if (error) throw new Error(`Error KPI: ${error.message}`);

        const total_appointments = data.length;
        const completed_appointments = data.filter((a) => a.status === "completed").length;
        const no_show_count = data.filter((a) => a.status === "no_show").length;
        const pending_count = data.filter((a) => a.status === "pending").length;
        const confirmed_count = data.filter((a) => a.status === "confirmed").length;
        const cancelled_count = data.filter((a) => a.status === "cancelled").length;

        const waitDays = data
            .filter((a) => a.status === "completed" && a.scheduled_date && a.created_at)
            .map((a) => {
                const created = new Date(a.created_at);
                const scheduled = new Date(a.scheduled_date);
                return Math.max(0, Math.round((scheduled - created) / (1000 * 60 * 60 * 24)));
            });
        const avg_wait_days = waitDays.length > 0 ? waitDays.reduce((a, b) => a + b, 0) / waitDays.length : 0;

        return [{
            total_appointments,
            completed_appointments,
            no_show_count,
            pending_count,
            confirmed_count,
            cancelled_count,
            avg_wait_days,
        }];
    }

    static async getAppointmentsByDependency(dateRange) {
        const { data, error } = await supabase
            .from("appointments")
            .select(`
                dependency_id,
                dependencies (name, color),
                status
            `)
            .gte("scheduled_date", dateRange.from)
            .lte("scheduled_date", dateRange.to);

        if (error) throw error;

        const grouped = data.reduce((acc, curr) => {
            const depName = curr.dependencies?.name || "Sin dependencia";
            const color = curr.dependencies?.color || "#ccc";

            if (!acc[depName]) {
                acc[depName] = {
                    name: depName,
                    color,
                    total: 0,
                    completed: 0,
                    cancelled: 0,
                };
            }
            acc[depName].total++;
            if (curr.status === "completed") acc[depName].completed++;
            if (curr.status === "cancelled") acc[depName].cancelled++;
            return acc;
        }, {});
        return Object.values(grouped);
    }

    static async getMonthlyEvolution(year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data, error } = await supabase
            .from("appointments")
            .select("status, scheduled_date")
            .gte("scheduled_date", startDate)
            .lte("scheduled_date", endDate);

        if (error) throw new Error(`Error monthly evolution: ${error.message}`);

        const months = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
        ];

        const grouped = data.reduce((acc, curr) => {
            const date = new Date(curr.scheduled_date);
            const monthIdx = date.getMonth();
            const monthName = months[monthIdx];

            if (!acc[monthName]) {
                acc[monthName] = { name: monthName, month: monthIdx, total: 0, completed: 0 };
            }
            acc[monthName].total++;
            if (curr.status === "completed") acc[monthName].completed++;
            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => a.month - b.month);
    }

    static async getProfessionalPerformance(dateRange) {
        const { data, error } = await supabase
            .from("appointments")
            .select(`
                professional_id,
                professional: profiles!professional_id (full_name),
                status,
                scheduled_date
            `)
            .not("professional_id", "is", null)
            .gte("scheduled_date", dateRange.from)
            .lte("scheduled_date", dateRange.to);
        if (error) throw new Error(`Error professional performance: ${error.message}`);

        const grouped = data.reduce((acc, curr) => {
            const profId = curr.professional_id;
            const name = curr.professional?.full_name || "Sin asignar";

            if (!acc[profId]) {
                acc[profId] = {
                    id: profId,
                    name,
                    total: 0,
                    completed: 0,
                    avgResponseTime: 0,
                };
            }

            acc[profId].total++;
            if (curr.status === "completed") acc[profId].completed++;

            return acc;
        }, {});

        return Object.values(grouped)
            .sort((a, b) => b.completed - a.completed)
            .slice(0, 10);
    }

    static async getRawDataForExport(dateRange) {
        const { data, error } = await supabase
            .from("appointments")
            .select(
                `
                *,
                dependencies (name),
                aprendiz: profiles!user_id (full_name, document_number),
                professional: profiles!professional_id (full_name)
                `,
            )
            .gte("scheduled_date", dateRange.from)
            .lte("scheduled_date", dateRange.to)
            .order("created_at", { ascending: false });

        if (error) throw new Error(`Error export data: ${error.message}`);
        return data;
    }
}