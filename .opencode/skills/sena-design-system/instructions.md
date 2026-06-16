# SENA Design System — Skill para opencode

Esta skill encapsula el sistema de diseño SENA 2026 para aplicaciones de gestión de citas y bienestar. Úsala cuando trabajes en este proyecto o en futuros proyectos SENA que requieran consistencia visual y WCAG AAA.

## Principios de Diseño

1. **Emotional Design** — Formas redondeadas, micro-copy humano, paleta cálida
2. **Cognitive Load Reduction** — Máximo 3 acciones visibles por pantalla
3. **Mobile-first** — 70% usuarios en celular
4. **Trust Signals** — Transparencia en cada acción
5. **WCAG AAA** — Contraste 7:1, navegación total por teclado

## Stack Tecnológico

- React 19 + Vite 8
- CSS puro con Custom Properties (sin Tailwind)
- Lucide React para iconos
- Recharts para gráficos
- Sonner para notificaciones

## Tokens CSS (`shared/styles/variables.css`)

Usa siempre las custom properties en vez de valores hardcodeados:

```css
/* Colores neutrales */
var(--neutral-50)  /* fondo de página */
var(--neutral-100) /* fondos muted */
var(--neutral-200) /* bordes light */
var(--neutral-300) /* bordes default */
var(--neutral-500) /* texto muted (solo decorativo) */
var(--neutral-700) /* texto secondary */
var(--neutral-900) /* texto primary */

/* Semánticos (WCAG AAA, 7:1) */
var(--color-success) /* #15803d */
var(--color-warning) /* #b45309 */
var(--color-error)   /* #b91c1c */
var(--color-info)    /* #1d4ed8 */

/* Tipografía fluida */
var(--text-display) /* clamp(1.5rem, 3vw, 2.25rem) */
var(--text-h1)
var(--text-h2)
var(--text-h3)
var(--text-body)
var(--text-small)
```

Para la lista completa de tokens, ver `tokens.json`.

## Patrón de Layout: Bento Grid

Siempre que crees un dashboard o vista con múltiples cards, usa el sistema Bento:

```jsx
<div className="bento stagger-enter">
  <div className="card card--elevated card--tall">
    {/* Card principal, ocupa 2 rows */}
  </div>
  <div className="card card--flat">
    {/* Card secundaria */}
  </div>
  <div className="card card--elevated card--wide">
    {/* Card que ocupa 2 columnas */}
  </div>
</div>
```

### Variantes de Card

- `card--flat`: Para información secundaria, datos de fondo
- `card--elevated`: Para contenido principal, KPIs
- `card--modal`: Para modales y drawers
- `card--interactive`: Clickable, con hover scale
- `card--accent-top`: Barra de color superior
- `card--accent-left`: Barra de color izquierda (appointment cards)

### Spans Bento

- `card--span-2`: Ocupa 2 columnas
- `card--tall`: Ocupa 2 filas
- `card--wide`: Ocupa 2 columnas (alias de span-2)

## Sistema de Botones

```jsx
<button className="btn btn-primary"> {/* o btn-secondary, btn-success, btn-danger, btn-ghost, btn-link */}
  <Icon size={18} aria-hidden="true" />
  <span className="btn__label">Texto</span>
</button>

/* Loading state */
<button className="btn btn-primary" aria-busy="true" disabled>
  <span className="btn__label">Guardando...</span>
</button>

/* Tamaños */
<button className="btn btn--sm"> {/* Pequeño */}
<button className="btn btn--lg"> {/* Grande */}
<button className="btn btn--block"> {/* Full width */}
```

## Formularios con Floating Labels

```jsx
<div className={`field ${error ? 'field--error' : ''}`}>
  <input
    id="email"
    className="field__input"
    type="email"
    placeholder="email@ejemplo.com"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  <label className="field__label" htmlFor="email">
    Correo electrónico
  </label>
  {error && <p className="field__error" id="email-error" role="alert">{error}</p>}
</div>
```

## Estados de Carga

```jsx
import { Skeleton } from "./shared/components/Skeleton";

/* Texto */
<Skeleton variant="text" width="60%" count={3} />

/* Card */
<Skeleton variant="card" height="120px" />

/* Bento grid skeleton */
<div className="skeleton-bento">
  <div className="skeleton-card">
    <Skeleton variant="heading" />
    <Skeleton variant="chart" />
  </div>
</div>
```

## Estados Vacíos

```jsx
import { EmptyState } from "./shared/components/EmptyState";

<EmptyState
  icon={Calendar}
  title="No hay citas"
  description="Agenda tu primera cita"
  action={<button className="btn btn-primary">Agendar</button>}
/>
```

## Micro-interacciones

| Elemento | CSS Class |
|---|---|
| Stagger enter | `stagger-enter` en el contenedor |
| Fade in up | `animate-fadeInUp` |
| Shake (error) | `animate-shake` |
| Skeleton shimmer | `skeleton` |
| Spin loading | `animate-spin` |

## Accesibilidad WCAG AAA

### Checklist obligatorio

- [ ] Contraste 7:1 para texto normal (<18px)
- [ ] Contraste 4.5:1 para texto grande (≥18px)
- [ ] `:focus-visible` en todos los interactive elements
- [ ] Skip link al inicio del body
- [ ] `aria-label` en botones sin texto
- [ ] `aria-busy` en botones con loading
- [ ] `aria-describedby` en inputs con error
- [ ] `role="alert"` en mensajes de error
- [ ] `role="dialog"` + `aria-modal` en modales
- [ ] `role="tablist"` + `role="tab"` + `aria-selected` en tabs
- [ ] `role="switch"` + `aria-checked` en toggles
- [ ] Keyboard: Escape cierra modales, Tab navega en orden lógico
- [ ] Focus trap en modales abiertos
- [ ] `prefers-reduced-motion` respetado (ya incluido en animations.css)

## Colores por Rol

```css
--role-psicologia:    #166534
--role-enfermeria:    #6b21a8
--role-trabajo-social: #c2410c
--role-coordinacion:  #1e40af
--role-aprendiz:      #15803d
```

## Tendencias UI 2026 Aplicadas

1. **Bento Grid Layouts** — Layouts asimétricos con cards de distintos tamaños
2. **Micro-interacciones funcionales** — Animaciones que comunican estado
3. **Emotional Design** — Experiencia cálida y humana, no clínica
4. **Strategic Minimalism** — Solo lo esencial visible
5. **Variable Fonts** — Inter en todos los pesos con un solo archivo
