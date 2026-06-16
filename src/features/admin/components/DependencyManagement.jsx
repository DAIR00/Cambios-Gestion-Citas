import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Plus, Pencil, Trash2, X, Building2 } from "lucide-react";

export function DependencyManagement() {
    const {
        dependencies, fetchDependencies, createDependency,
        updateDependency, deleteDependency,
    } = useAdmin();
    const [showModal, setShowModal] = useState(false);
    const [editingDep, setEditingDep] = useState(null);
    const [form, setForm] = useState({ name: "", color: "#39a900" });

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    const openCreate = () => {
        setEditingDep(null);
        setForm({ name: "", color: "#39a900" });
        setShowModal(true);
    };

    const openEdit = (dep) => {
        setEditingDep(dep);
        setForm({ name: dep.name, color: dep.color || "#39a900" });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingDep) {
            await updateDependency(editingDep.id, form);
        } else {
            await createDependency(form);
        }
        setShowModal(false);
    };

    const handleDelete = async (dep) => {
        if (dep.appointmentCount > 0) {
            alert(`No se puede eliminar "${dep.name}" porque tiene ${dep.appointmentCount} citas asociadas.`);
            return;
        }
        if (!window.confirm(`¿Eliminar la dependencia "${dep.name}"?`)) return;
        await deleteDependency(dep.id);
    };

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Gestión de Dependencias</h2>
                <button className="btn-primary" onClick={openCreate}>
                    <Plus size={18} />
                    <span>Nueva Dependencia</span>
                </button>
            </header>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Dependencia</th>
                            <th>Color</th>
                            <th>Profesionales</th>
                            <th>Total Citas</th>
                            <th>Cumplimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dependencies.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: "center", color: "#9ca3af" }}>No hay dependencias registradas</td></tr>
                        ) : (
                            dependencies.map((dep) => (
                                <tr key={dep.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar" style={{ background: dep.color || "#39a900" }}>
                                                <Building2 size={16} color="#fff" />
                                            </div>
                                            <div>
                                                <div className="name">{dep.name}</div>
                                                <div className="document">ID: {dep.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{ width: 24, height: 24, borderRadius: "var(--radius-sm)", background: dep.color, border: "1px solid #e5e7eb" }} />
                                            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#6b7280" }}>{dep.color}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{dep.professionalCount}</span>
                                        <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}> profesionales</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{dep.appointmentCount}</span>
                                        <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}> citas</span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{ width: 60, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{ width: `${dep.completionRate}%`, height: "100%", background: dep.completionRate > 70 ? "#22c55e" : "#f59e0b", borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{dep.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.35rem" }}>
                                            <button className="btn-icon" onClick={() => openEdit(dep)} title="Editar">
                                                <Pencil size={14} />
                                            </button>
                                            <button className="btn-icon" onClick={() => handleDelete(dep)} title="Eliminar" style={{ color: "#ef4444" }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3>{editingDep ? "Editar Dependencia" : "Nueva Dependencia"}</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="field">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Ej: Psicología"
                                />
                            </div>
                            <div className="field">
                                <label>Color</label>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <input
                                        type="color"
                                        value={form.color}
                                        onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                                        style={{ width: 48, height: 36, border: "1px solid #d1d5db", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }}
                                    />
                                    <input
                                        type="text"
                                        value={form.color}
                                        onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                                        style={{ flex: 1, fontFamily: "monospace" }}
                                        placeholder="#39a900"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editingDep ? "Guardar Cambios" : "Crear Dependencia"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
