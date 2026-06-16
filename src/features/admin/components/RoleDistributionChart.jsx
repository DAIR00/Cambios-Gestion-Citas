import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ROLE_COLORS = {
    SUPERADMIN: "#ef4444",
    COORDINACION: "#3b82f6",
    PSICOLOGIA: "#22c55e",
    ENFERMERIA: "#a855f7",
    TRABAJO_SOCIAL: "#f97316",
    APRENDIZ: "#16a34a",
};

const ROLE_LABELS = {
    SUPERADMIN: "Super Admin",
    COORDINACION: "Coordinación",
    PSICOLOGIA: "Psicología",
    ENFERMERIA: "Enfermería",
    TRABAJO_SOCIAL: "Trabajo Social",
    APRENDIZ: "Aprendiz",
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { role, count } = payload[0].payload;
        return (
            <div style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                fontSize: "0.8rem",
            }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{ROLE_LABELS[role] || role}</p>
                <p style={{ margin: "0.25rem 0 0", color: "#6b7280" }}>{count} usuarios</p>
            </div>
        );
    }
    return null;
};

export function RoleDistributionChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <h3>Usuarios por Rol</h3>
                <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Sin datos disponibles</p>
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="chart-container">
            <h3>Usuarios por Rol</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="role"
                        label={({ role, count }) => `${ROLE_LABELS[role] || role}: ${count}`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={ROLE_COLORS[entry.role] || "#6b7280"}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => ROLE_LABELS[value] || value}
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "0.75rem" }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem", color: "#6b7280" }}>
                Total: {total} usuarios
            </div>
        </div>
    );
}
