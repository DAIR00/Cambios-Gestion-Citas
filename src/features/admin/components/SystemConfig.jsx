import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Save, RefreshCw } from "lucide-react";

const CONFIG_SECTIONS = [
    {
        dbKey: "appointment_limits",
        label: "Límites de Agendamiento",
        fields: [
            { path: "max_pending_per_user", label: "Máximo de citas pendientes por aprendiz", type: "number" },
            { path: "max_advance_days", label: "Días de anticipación para agendar", type: "number" },
            { path: "min_advance_hours", label: "Horas mínimas para cancelar sin penalización", type: "number" },
        ],
    },
    {
        dbKey: "working_hours",
        label: "Horario de Atención",
        fields: [
            { path: "start", label: "Hora de inicio de atención", type: "text" },
            { path: "end", label: "Hora de fin de atención", type: "text" },
        ],
    },
    {
        dbKey: "notification_settings",
        label: "Notificaciones",
        fields: [
            { path: "reminder_hours_before", label: "Horas de recordatorio antes de la cita", type: "number" },
        ],
    },
];

function flattenConfig(config) {
    if (!config) return {};
    const flat = {};
    for (const section of CONFIG_SECTIONS) {
        const value = config[section.dbKey] || {};
        for (const field of section.fields) {
            flat[`${section.dbKey}.${field.path}`] = value[field.path] ?? "";
        }
    }
    return flat;
}

function unflattenToSections(formValues) {
    const sections = {};
    for (const section of CONFIG_SECTIONS) {
        const obj = {};
        for (const field of section.fields) {
            const key = `${section.dbKey}.${field.path}`;
            const raw = formValues[key];
            if (raw === "" || raw === undefined || raw === null) continue;
            obj[field.path] = field.type === "number" ? Number(raw) : raw;
        }
        sections[section.dbKey] = obj;
    }
    return sections;
}

export function SystemConfig() {
    const { config, fetchConfig, updateConfig, loading } = useAdmin();
    const [formValues, setFormValues] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    useEffect(() => {
        if (config) {
            setFormValues(flattenConfig(config));
        }
    }, [config]);

    const handleChange = (key, value) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const sections = unflattenToSections(formValues);
            for (const section of CONFIG_SECTIONS) {
                const newValue = sections[section.dbKey];
                const oldValue = config?.[section.dbKey] || {};
                const merged = { ...oldValue, ...newValue };
                const hasChanges = JSON.stringify(merged) !== JSON.stringify(oldValue);
                if (hasChanges) {
                    await updateConfig(section.dbKey, merged);
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const handleReload = useCallback(() => {
        fetchConfig();
    }, [fetchConfig]);

    if (loading && !config) {
        return <div className="loading-screen">Cargando configuración...</div>;
    }

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Configuración del Sistema</h2>
                <div className="header-actions">
                    <button onClick={handleReload} className="btn-secondary">
                        <RefreshCw size={18} />
                        Recargar
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={saving}>
                        <Save size={18} />
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </header>

            {CONFIG_SECTIONS.map((section) => (
                <div key={section.dbKey} className="config-section" style={{ marginBottom: "var(--space-xl)" }}>
                    <h3 style={{ fontSize: "var(--text-body)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-md)" }}>
                        {section.label}
                    </h3>
                    <div className="config-grid">
                        {section.fields.map((field) => {
                            const fieldKey = `${section.dbKey}.${field.path}`;
                            return (
                                <div key={fieldKey} className="config-field">
                                    <label htmlFor={fieldKey}>{field.label}</label>
                                    <input
                                        id={fieldKey}
                                        type={field.type}
                                        value={formValues[fieldKey] ?? ""}
                                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                                    />
                                    <span className="config-key">{field.path}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
