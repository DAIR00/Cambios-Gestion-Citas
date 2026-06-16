# Patrón Bento Grid

## Dashboard de Aprendiz

```
┌─────────────────────┬─────────────────────┐
│  Próxima Cita        │  Resumen            │  ← tall
│  (card elevated)     │  (card flat)        │
│  + countdown         │                     │
├──────────────────────┴─────────────────────┤
│  Historial de Citas                        │  ← wide
│  (card elevated, tabla)                    │
├──────────────────────┬─────────────────────┤
│  Consejo del día      │  Acciones Rápidas   │
│  (card flat)         │  (card flat)        │
└──────────────────────┴─────────────────────┘
```

## Dashboard de Coordinación

```
┌──────────┬──────────┬──────────┬──────────┐
│ KPI 1    │ KPI 2    │ KPI 3    │ KPI 4    │
├──────────┴──────────┼──────────┴──────────┤
│ Chart (bar)         │ Chart (line)        │
├─────────────────────┴─────────────────────┤
│ Tabla Profesionales (wide)                │
└───────────────────────────────────────────┘
```

## Dashboard Profesional

```
┌──────────┬──────────┬──────────┬──────────┐
│ Pendientes│ Confirm. │ Compl.   │ % Cumpl. │
├──────────┴──────────┴──────────┴──────────┤
│ Filter Tabs (pills)                       │
├───────────────────────────────────────────┤
│ Appointment Cards (bento 2 cols)          │
└───────────────────────────────────────────┘
```
