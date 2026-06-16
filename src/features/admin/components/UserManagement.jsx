import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { supabase } from "../../../lib/supabase";
import { Search, UserPlus, Pencil, CheckCircle, XCircle, X } from "lucide-react";

const ROLES = [
    { id: 1, name: "SUPERADMIN", label: "Super Admin" },
    { id: 2, name: "COORDINACION", label: "Coordinación" },
    { id: 3, name: "PSICOLOGIA", label: "Psicología" },
    { id: 4, name: "ENFERMERIA", label: "Enfermería" },
    { id: 5, name: "TRABAJO_SOCIAL", label: "Trabajo Social" },
    { id: 6, name: "APRENDIZ", label: "Aprendiz" },
];

const EMPTY_FORM = {
    email: "",
    password: "",
    fullName: "",
    documentNumber: "",
    roleId: "",
    dependencyId: "",
};

export function UserManagement() {
    const { users, pagination, loading, fetchUsers, updateUserRole, createUser } = useAdmin();
    const [filters, setFilters] = useState({ search: "", role: "" });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [dependencies, setDependencies] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers(filters);
    }, [filters, fetchUsers]);

    useEffect(() => {
        supabase.from("dependencies").select("*").then(({ data }) => {
            setDependencies(data || []);
        });
    }, []);

    const toggleUserStatus = (user) => {
        updateUserRole(user.id, {
            roleId: user.role_id,
            dependencyId: user.dependency_id,
            isActive: !user.is_active,
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createUser({
                email: form.email,
                password: form.password,
                fullName: form.fullName,
                roleId: Number(form.roleId),
                dependencyId: form.dependencyId ? Number(form.dependencyId) : null,
            });
            setShowCreateModal(false);
            setForm(EMPTY_FORM);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateUserRole(editingUser.id, {
                roleId: Number(form.roleId),
                dependencyId: form.dependencyId ? Number(form.dependencyId) : null,
                isActive: editingUser.is_active,
            });
            setEditingUser(null);
            setForm(EMPTY_FORM);
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setForm(EMPTY_FORM);
        setShowCreateModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setForm({
            email: user.email || "",
            password: "",
            fullName: user.full_name || "",
            documentNumber: user.document_number || "",
            roleId: user.role_id || "",
            dependencyId: user.dependency_id || "",
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingUser(null);
        setForm(EMPTY_FORM);
    };

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Gestión de Usuarios</h2>
                <button className="btn-primary" onClick={openCreateModal}>
                    <UserPlus size={18} />
                    <span>Nuevo Usuario</span>
                </button>
            </header>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o documento..."
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    />
                </div>
                <select
                    value={filters.role}
                    onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
                >
                    <option value="">Todos los roles</option>
                    {ROLES.map((r) => (
                        <option key={r.id} value={r.name}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Dependencia</th>
                            <th>Estado</th>
                            <th>Última actualización</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6">Cargando...</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className={!u.is_active ? "inactive" : ""}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">{u.full_name?.[0] || "?"}</div>
                                            <div>
                                                <div className="name">{u.full_name}</div>
                                                <div className="document">
                                                    {u.email || u.document_number}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${u.roles?.name?.toLowerCase() || ""}`}>
                                            {u.roles?.name}
                                        </span>
                                    </td>
                                    <td>{u.dependencies?.name || "-"}</td>
                                    <td>
                                        <button
                                            onClick={() => toggleUserStatus(u)}
                                            className={`status-toggle ${u.is_active ? "active" : "inactive"}`}
                                        >
                                            {u.is_active ? (
                                                <CheckCircle size={16} />
                                            ) : (
                                                <XCircle size={16} />
                                            )}
                                            {u.is_active ? "Activo" : "Inactivo"}
                                        </button>
                                    </td>
                                    <td>{new Date(u.updated_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn-icon"
                                            onClick={() => openEditModal(u)}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <span>Total: {pagination.total} usuarios</span>
                <div className="page-controls">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={pagination.page === i + 1 ? "active" : ""}
                            onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal Crear Usuario */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Crear Nuevo Usuario</h3>
                            <button className="btn-icon" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="admin-form">
                            <div className="field">
                                <label>Nombre completo</label>
                                <input
                                    type="text"
                                    required
                                    value={form.fullName}
                                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                                />
                            </div>
                            <div className="field">
                                <label>Correo electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                />
                            </div>
                            <div className="field">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                />
                            </div>
                            <div className="field">
                                <label>Rol</label>
                                <select
                                    required
                                    value={form.roleId}
                                    onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                                >
                                    <option value="">Seleccionar rol</option>
                                    {ROLES.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Dependencia</label>
                                <select
                                    value={form.dependencyId}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dependencyId: e.target.value }))
                                    }
                                >
                                    <option value="">Sin dependencia</option>
                                    {dependencies.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? "Creando..." : "Crear Usuario"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Usuario */}
            {editingUser && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Editar Usuario</h3>
                            <button className="btn-icon" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="admin-form">
                            <div className="field">
                                <label>Nombre</label>
                                <input type="text" value={form.fullName} disabled />
                            </div>
                            <div className="field">
                                <label>Correo</label>
                                <input type="email" value={form.email} disabled />
                            </div>
                            <div className="field">
                                <label>Rol</label>
                                <select
                                    required
                                    value={form.roleId}
                                    onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Dependencia</label>
                                <select
                                    value={form.dependencyId}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dependencyId: e.target.value }))
                                    }
                                >
                                    <option value="">Sin dependencia</option>
                                    {dependencies.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
