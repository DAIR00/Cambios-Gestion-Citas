# Sistema de Cards — 3 Profundidades

## Depth 1: Flat
```html
<div class="card card--flat">
  <div class="card__header">
    <h3 class="card__title">Título</h3>
  </div>
  <div class="card__body">
    Contenido secundario
  </div>
</div>
```

## Depth 2: Elevated
```html
<div class="card card--elevated">
  ...
</div>
```

## Depth 3: Modal
```html
<div class="card card--modal">
  ...
</div>
```

## Variantes

### Accent Top
```html
<div class="card card--elevated card--accent-top" style="--card-accent: var(--sena-green)">
```

### Accent Left (Appointment Cards)
```html
<div class="card card--flat card--accent-left" style="--card-accent: #39a900">
```

### Interactive (clickable)
```html
<div class="card card--elevated card--interactive" tabindex="0" role="button">
```

### Hover-reveal actions
```html
<div class="card">
  <div class="card__actions">
    <!-- Visible on hover/focus -->
  </div>
</div>
```
