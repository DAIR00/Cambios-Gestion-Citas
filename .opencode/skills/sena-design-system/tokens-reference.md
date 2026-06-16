# Referencia de Tokens — SENA Design System

## Colores

| Token | Valor | Uso |
|---|---|---|
| `--sena-green` | `#39a900` | Acento principal, botones primarios |
| `--sena-green-dark` | `#2d8600` | Hover de botones primarios |
| `--neutral-50` | `#f7f8fa` | Fondo de página |
| `--neutral-100` | `#eef0f4` | Fondos muted, hover |
| `--neutral-200` | `#e1e5ed` | Bordes light |
| `--neutral-300` | `#c5cad6` | Bordes default |
| `--neutral-500` | `#7c8399` | Texto muted (solo decorativo) |
| `--neutral-700` | `#4a5064` | Texto secondary |
| `--neutral-900` | `#1a1d29` | Texto primary |
| `--color-success` | `#15803d` | Éxito (WCAG AAA) |
| `--color-warning` | `#b45309` | Advertencia (WCAG AAA) |
| `--color-error` | `#b91c1c` | Error (WCAG AAA) |
| `--color-info` | `#1d4ed8` | Información (WCAG AAA) |

## Tipografía

| Token | Tamaño | Peso | Contexto |
|---|---|---|---|
| `--text-display` | `clamp(1.5rem, 3vw, 2.25rem)` | 800 | Títulos de página grandes |
| `--text-h1` | `clamp(1.25rem, 2.5vw, 1.75rem)` | 700 | Encabezados principales |
| `--text-h2` | `clamp(1.125rem, 2vw, 1.5rem)` | 600 | Secciones |
| `--text-h3` | `clamp(1rem, 1.5vw, 1.25rem)` | 600 | Subtítulos |
| `--text-body` | `clamp(0.875rem, 1.2vw, 1rem)` | 400 | Texto general |
| `--text-small` | `clamp(0.75rem, 1vw, 0.875rem)` | 400 | Etiquetas, metadatos |

## Sombras

| Token | Valor | Uso |
|---|---|---|
| `--shadow-card-sm` | `0 1px 3px...` | Cards flat |
| `--shadow-card-md` | `0 4px 12px...` | Cards elevated |
| `--shadow-card-lg` | `0 8px 24px...` | Cards hover |
| `--shadow-card-hover` | `0 12px 36px...` | Hover state |
| `--shadow-modal` | `0 20px 60px...` | Modales |
| `--shadow-sidebar` | `-4px 0 24px...` | Sidebar |

## Spacing

`--space-xs` (0.25rem) → `--space-3xl` (4rem)

## Border Radius

`--radius-sm` (8px) → `--radius-2xl` (24px), `--radius-full` (9999px)

## Transiciones

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
--duration-instant: 100ms;
--duration-fast:    200ms;
--duration-normal:  300ms;
--duration-slow:    500ms;
```
