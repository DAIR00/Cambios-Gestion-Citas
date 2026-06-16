export function ProfessionalTable({ data }) {
    return (
        <div className="table-container">
            <h3>Top Profesionales</h3>
            {data.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-lg)" }}>
                    No hay datos de profesionales para el periodo seleccionado
                </p>
            ) : (
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: "3rem", textAlign: "center" }}>#</th>
                        <th>Nombre</th>
                        <th style={{ textAlign: "center" }}>Total Citas</th>
                        <th style={{ textAlign: "center" }}>Completadas</th>
                        <th>Eficiencia</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((prof, index) => {
                        const efficiency =
                        prof.total > 0
                        ? Math.round((prof.completed / prof.total) * 100)
                        : 0;

                        return (
                            <tr key={prof.id}>
                                <td style={{ textAlign: "center" }}>{index + 1}</td>
                                <td>{prof.name}</td>
                                <td style={{ textAlign: "center" }}>{prof.total}</td>
                                <td style={{ textAlign: "center" }}>{prof.completed}</td>
                                <td>
                                    <div className="efficiency-bar">
                                        <div className="efficiency-fill" style={{
                                            width: `${efficiency}%`,
                                            background: efficiency > 80 ? "#22c55e" : efficiency > 50 ? "#f59e0b" : "#ef4444",
                                        }} />
                                        <span>{efficiency}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            )}
        </div>
    )
}