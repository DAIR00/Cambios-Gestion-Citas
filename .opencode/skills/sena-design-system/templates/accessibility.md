# Checklist de Accesibilidad WCAG AAA

## Contraste de Color
- [ ] Texto normal (<18px): ratio 7:1 mínimo
- [ ] Texto grande (≥18px o ≥14px bold): ratio 4.5:1 mínimo
- [ ] Componentes de interfaz: ratio 3:1 mínimo
- [ ] No usar color como único diferenciador (añadir iconos/patrones)

## Navegación por Teclado
- [ ] Skip link visible al hacer Tab
- [ ] Tab order lógico en todas las pantallas
- [ ] Enter/Space activan botones y enlaces
- [ ] Escape cierra modales, sidebar, dropdowns
- [ ] Arrow keys navegan tabs, listas, menús
- [ ] Focus trap en modales (Tab循环 cerrado)

## ARIA
- [ ] `aria-label` en botones sin texto visible
- [ ] `aria-describedby` en inputs con error
- [ ] `aria-invalid` en inputs con error de validación
- [ ] `aria-busy="true"` en botones con estado loading
- [ ] `aria-selected` en tabs, listbox options
- [ ] `aria-checked` en toggles y switches
- [ ] `aria-expanded` en acordeones y dropdowns
- [ ] `role="alert"` en mensajes de error
- [ ] `role="dialog"` + `aria-modal="true"` en modales
- [ ] `role="tablist"`, `role="tab"`, `role="tabpanel"` en tabs
- [ ] `role="switch"` en toggles
- [ ] `role="status"` + `aria-live="polite"` en notificaciones

## Imágenes y Multimedia
- [ ] `alt` descriptivo en todas las imágenes
- [ ] `aria-hidden="true"` en iconos decorativos
- [ ] Subtítulos en videos

## Formularios
- [ ] Todos los inputs tienen `<label>` con `htmlFor`
- [ ] Mensajes de error visibles y con `role="alert"`
- [ ] Placeholder no reemplaza al label
- [ ] Autocomplete en campos de formulario

## Responsive y Zoom
- [ ] La interfaz funciona hasta 200% de zoom
- [ ] Contenido no se corta en tamaños pequeños
- [ ] Touch targets de al menos 44x44px en mobile

## Movimiento Reducido
- [ ] `prefers-reduced-motion` desactiva animaciones
- [ ] Animaciones no esenciales se eliminan
- [ ] Parpadeos no superan 3 por segundo

## Lectores de Pantalla
- [ ] Encabezados en orden jerárquico (h1→h2→h3)
- [ ] Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] Tablas con `<th>` y `scope` o `headers`
- [ ] Mensajes dinámicos con `aria-live`

## Herramientas de Verificación
- WAVE: https://wave.webaim.org
- axe DevTools: extensión Chrome
- NVDA: lector de pantalla gratuito
- Color Contrast Analyzer: https://webaim.org/resources/contrastchecker
