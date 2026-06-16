import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import {
    Shield, Plus, Pencil, Trash2, X, Save, Users, CheckCircle,
    ChevronRight, Info,
} from "lucide-react";

const PERMISSIONS = [
    { key: "dashboard.view", label: "Ver dashboard", category: "Dashboard" },
    { key: "users.view", label: "Ver usuarios", category: "Usuarios" },
    { key: "users.create", label: "Crear usuarios", category: "Usuarios" },
    { key: "users.edit", label: "Editar usuarios", category: "Usuarios" },
    { key: "users.delete", label: "Eliminar usuarios", category: "Usuarios" },
    { key: "appointments.view", label: "Ver citas propias", category: "Citas" },
    { key: "appointments.view_all", label: "Ver todas las citas", category: "Citas" },
    { key: "appointments.edit", label: "Editar citas", category: "Citas" },
    { key: "appointments.cancel", label: "Cancelar citas", category: "Citas" },
    { key: "appointments.reassign", label: "Reasignar citas", category: "Citas" },
    { key: "appointments.complete", label: "Completar citas", category: "Citas" },
    { key: "appointments.history", label: "Ver historial de aprendices", category: "Citas" },
    { key: "reports.view", label: "Ver reportes", category: "Reportes" },
    { key: "reports.export", label: "Exportar reportes (CSV/PDF)", category: "Reportes" },
    { key: "audit.view", label: "Ver auditoría", category: "Auditoría" },
    { key: "config.edit", label: "Editar configuración del sistema", category: "Configuración" },
    { key: "dependencies.manage", label: "Gestionar dependencias", category: "Dependencias" },
    { key: "roles.manage", label: "Gestionar roles y permisos", category: "Roles" },
];

const CATEGORIES = [...new Set(PERMISSIONS.map((p) => p.category))];

const ROLE_COLORS = {
    1: "#ef4444",
    2: "#3b82f6",
    3: "#22c55e",
    4: "#a855f7",
    5: "#f97316",
    6: "#16a34a",
};

export function RoleManagement() {
    const {
        roles, usersByRole, fetchRoles, fetchUsersByRole,
        updateRolePermissions, createRole, updateRole, deleteRole,
    } = useAdmin();
    const [selectedRole, setSelectedRole] = useState(null);
    const [editPermissions, setEditPermissions] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", description: "" });
    const [createForm, setCreateForm] = useState({ name: "", description: "", permissions: [] });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        const perms = Array.isArray(role.permissions) ? role.permissions : [];
        setEditPermissions(perms);
        setHasChanges(false);
        setEditMode(false);
        fetchUsersByRole(role.id);
    };

    const handleTogglePermission = (key) => {
        setEditPermissions((prev) => {
            const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
            setHasChanges(true);
            return next;
        });
    };

    const handleToggleCategory = (category) => {
        const categoryKeys = PERMISSIONS.filter((p) => p.category === category).map((p) => p.key);
        const allChecked = categoryKeys.every((k) => editPermissions.includes(k));
        setEditPermissions((prev) => {
            const next = allChecked
                ? prev.filter((k) => !categoryKeys.includes(k))
                : [...new Set([...prev, ...categoryKeys])];
            setHasChanges(true);
            return next;
        });
    };

    const handleSelectAll = () => {
        const allKeys = PERMISSIONS.map((p) => p.key);
        const allChecked = allKeys.every((k) => editPermissions.includes(k));
        setEditPermissions(allChecked ? [] : allKeys);
        setHasChanges(true);
    };

    const handleSavePermissions = async () => {
        setSaving(true);
        const result = await updateRolePermissions(selectedRole.id, editPermissions);
        setSaving(false);
        if (result.success) {
            setSelectedRole((prev) => ({ ...prev, permissions: editPermissions }));
            setHasChanges(false);
        }
    };

    const handleStartEdit = () => {
        setEditForm({ name: selectedRole.name, description: selectedRole.description || "" });
        setEditMode(true);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        const result = await updateRole(selectedRole.id, editForm);
        setSaving(false);
        if (result.success) {
            setSelectedRole((prev) => ({ ...prev, ...editForm }));
            setEditMode(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        const result = await createRole(createForm);
        setSaving(false);
        if (result.success) {
            setShowCreateModal(false);
            setCreateForm({ name: "", description: "", permissions: [] });
        }
    };

    const handleDelete = async (role) => {
        if (role.userCount > 0) {
            alert(`No se puede eliminar "${role.name}" porque tiene ${role.userCount} usuario(s) asignado(s). Primero reasigna los usuarios a otro rol.`);
            return;
        }
        if (!window.confirm(`¿Eliminar el rol "${role.name}"?`)) return;
        const result = await deleteRole(role.id);
        if (result.success && selectedRole?.id === role.id) {
            setSelectedRole(null);
        }
    };

    const totalChecked = editPermissions.length;
    const totalPermissions = PERMISSIONS.length;

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Gestión de Roles y Permisos</h2>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    <span>Nuevo Rol</span>
                </button>
            </header>

            <div className="role-management">
                {/* Lista de roles */}
                <div className="role-list">
                    <div className="role-list-header">
                        <Shield size={16} />
                        <span>Roles ({roles.length})</span>
                    </div>
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className={`role-item ${selectedRole?.id === role.id ? "active" : ""}`}
                            onClick={() => handleSelectRole(role)}
                        >
                            <div className="role-item-left">
                                <div
                                    className="role-dot"
                                    style={{ background: ROLE_COLORS[role.id] || "#6b7280" }}
                                />
                                <div>
                                    <div className="role-name">{role.name}</div>
                                    <div className="role-count">{role.userCount} usuario(s)</div>
                                </div>
                            </div>
                            <ChevronRight size={14} className="role-chevron" />
                        </div>
                    ))}
                </div>

                {/* Detalle del rol */}
                <div className="role-detail">
                    {!selectedRole ? (
                        <div className="empty-state">
                            <Shield size={48} />
                            <p>Selecciona un rol para ver su detalle</p>
                        </div>
                    ) : (
                        <>
                            {/* Header del rol */}
                            <div className="role-detail-header">
                                <div className="role-detail-info">
                                    <div
                                        className="role-detail-dot"
                                        style={{ background: ROLE_COLORS[selectedRole.id] || "#6b7280" }}
                                    />
                                    {editMode ? (
                                        <div className="role-edit-form">
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                                className="role-edit-name"
                                                placeholder="Nombre del rol"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                                className="role-edit-desc"
                                                placeholder="Descripción (opcional)"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h3>{selectedRole.name}</h3>
                                            <p className="role-description">
                                                {selectedRole.description || "Sin descripción"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="role-detail-actions">
                                    {editMode ? (
                                        <>
                                            <button className="btn-secondary" onClick={() => setEditMode(false)}>
                                                Cancelar
                                            </button>
                                            <button className="btn-primary" onClick={handleSaveEdit} disabled={saving || !editForm.name.trim()}>
                                                <Save size={14} />
                                                {saving ? "Guardando..." : "Guardar"}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-icon" onClick={handleStartEdit} title="Editar nombre">
                                                <Pencil size={14} />
                                            </button>
                                            <button className="btn-icon" onClick={() => handleDelete(selectedRole)} title="Eliminar rol" style={{ color: "#ef4444" }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Permisos */}
                            <div className="permissions-section">
                                <div className="permissions-header">
                                    <div>
                                        <h4>Permisos</h4>
                                        <span className="permissions-count">
                                            {totalChecked}/{totalPermissions} seleccionados
                                        </span>
                                    </div>
                                    <button
                                        className="btn-link"
                                        onClick={handleSelectAll}
                                        style={{ fontSize: "0.8rem" }}
                                    >
                                        {totalChecked === totalPermissions ? "Desmarcar todo" : "Marcar todo"}
                                    </button>
                                </div>

                                <div className="permissions-grid">
                                    {CATEGORIES.map((category) => {
                                        const categoryPerms = PERMISSIONS.filter((p) => p.category === category);
                                        const checkedCount = categoryPerms.filter((p) => editPermissions.includes(p.key)).length;
                                        const allChecked = checkedCount === categoryPerms.length;

                                        return (
                                            <div key={category} className="permission-category">
                                                <div
                                                    className={`permission-category-header ${allChecked ? "checked" : ""}`}
                                                    onClick={() => handleToggleCategory(category)}
                                                >
                                                    <div className={`permission-checkbox ${allChecked ? "checked" : ""}`}>
                                                        {allChecked && <CheckCircle size={12} />}
                                                    </div>
                                                    <span>{category}</span>
                                                    <span className="permission-category-count">
                                                        {checkedCount}/{categoryPerms.length}
                                                    </span>
                                                </div>
                                                {categoryPerms.map((perm) => {
                                                    const isChecked = editPermissions.includes(perm.key);
                                                    return (
                                                        <div
                                                            key={perm.key}
                                                            className={`permission-item ${isChecked ? "checked" : ""}`}
                                                            onClick={() => handleTogglePermission(perm.key)}
                                                        >
                                                            <div className={`permission-checkbox ${isChecked ? "checked" : ""}`}>
                                                                {isChecked && <CheckCircle size={12} />}
                                                            </div>
                                                            <span>{perm.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>

                                {hasChanges && (
                                    <div className="permissions-save-bar">
                                        <Info size={14} />
                                        <span>Hay cambios sin guardar</span>
                                        <button className="btn-primary" onClick={handleSavePermissions} disabled={saving}>
                                            <Save size={14} />
                                            {saving ? "Guardando..." : "Guardar Permisos"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Usuarios con este rol */}
                            <div className="users-in-role">
                                <h4>
                                    <Users size={16} />
                                    Usuarios con este rol ({usersByRole.length})
                                </h4>
                                {usersByRole.length === 0 ? (
                                    <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>No hay usuarios con este rol</p>
                                ) : (
                                    <div className="users-list">
                                        {usersByRole.map((u) => (
                                            <div key={u.id} className={`user-row ${!u.is_active ? "inactive" : ""}`}>
                                                <div className="user-cell">
                                                    <div className="avatar" style={{ background: ROLE_COLORS[selectedRole.id] || "#6b7280" }}>
                                                        {u.full_name?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="name">{u.full_name}</div>
                                                        <div className="document">{u.email || u.document_number}</div>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                                                    {u.dependencies?.name || "Sin dependencia"}
                                                </span>
                                                <span className={`status-badge ${u.is_active ? "active" : "inactive"}`} style={{
                                                    fontSize: "0.7rem",
                                                    padding: "0.15rem 0.5rem",
                                                    borderRadius: "999px",
                                                    background: u.is_active ? "#dcfce7" : "#fee2e2",
                                                    color: u.is_active ? "#16a34a" : "#dc2626",
                                                }}>
                                                    {u.is_active ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal Crear Rol */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
                        <div className="modal-header">
                            <h3>Crear Nuevo Rol</h3>
                            <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="admin-form">
                            <div className="field">
                                <label>Nombre del rol</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Ej: Coordinador General"
                                />
                            </div>
                            <div className="field">
                                <label>Descripción</label>
                                <input
                                    type="text"
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Breve descripción del rol"
                                />
                            </div>
                            <div className="field">
                                <label>Permisos iniciales</label>
                                <div className="permissions-grid" style={{ maxHeight: 200, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
                                    {PERMISSIONS.map((perm) => {
                                        const isChecked = createForm.permissions.includes(perm.key);
                                        return (
                                            <div
                                                key={perm.key}
                                                className={`permission-item ${isChecked ? "checked" : ""}`}
                                                onClick={() => {
                                                    setCreateForm((f) => ({
                                                        ...f,
                                                        permissions: isChecked
                                                            ? f.permissions.filter((k) => k !== perm.key)
                                                            : [...f.permissions, perm.key],
                                                    }));
                                                }}
                                                style={{ padding: "0.25rem 0" }}
                                            >
                                                <div className={`permission-checkbox ${isChecked ? "checked" : ""}`}>
                                                    {isChecked && <CheckCircle size={12} />}
                                                </div>
                                                <span style={{ fontSize: "0.8rem" }}>{perm.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving || !createForm.name.trim()}>
                                    {saving ? "Creando..." : "Crear Rol"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
