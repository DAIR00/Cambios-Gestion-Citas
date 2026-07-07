# Guía de Testing - Gestión de Citas SENA

## Descripción General

Este proyecto utiliza una estrategia de testing dual:

- **Unit Tests** con **Vitest** + **Testing Library** para probar lógica aislada, hooks, repositorios, schemas y componentes UI.
- **E2E Tests** con **Playwright** para probar flujos completos de usuario en el navegador.

---

## Configuración del Entorno

### Dependencias instaladas

```bash
# Unit testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8

# E2E testing
npm install @playwright/test
```

### Archivos de configuración

| Archivo | Propósito |
|---------|-----------|
| `vite.config.js` | Configuración de Vitest (environment, setup, coverage, include pattern) |
| `playwright.config.js` | Configuración de Playwright (baseURL, proyectos, webServer) |
| `src/test/setup.js` | Setup global de Vitest (imports de jest-dom) |
| `src/test/test-utils.jsx` | Utilidades de renderizado con providers mock |
| `src/mocks/supabase.mock.js` | Mock del cliente Supabase para unit tests |

### Configuración de Vitest

Vitest está configurado para ejecutar solo archivos dentro de `src/`:
```js
// vite.config.js
test: {
  include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  // Esto excluye los tests E2E de Playwright en tests/e2e/
}
```

---

## Cómo Ejecutar los Tests

### Unit Tests (Vitest)

```bash
# Ejecutar todos los unit tests una vez
npm run test

# Ejecutar en modo watch (re-ejecuta al guardar archivos)
npm run test:watch

# Ejecutar con reporte de cobertura
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Instalar navegadores de Playwright (primera vez)
npm run test:install

# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI interactiva de Playwright
npm run test:e2e:ui

# Ver reporte HTML de los resultados
npm run test:report
```

> **Nota:** Los tests E2E requieren el servidor de desarrollo corriendo. Playwright está configurado para levantarlo automáticamente.

---

## Estructura de Carpetas de Testing

```
src/
  features/
    [feature]/
      __tests__/
        *.test.jsx       # Tests de componentes
        *.test.js        # Tests de hooks/repositorios/schemas
  shared/
    __tests__/
      *.test.jsx         # Tests de componentes compartidos
  providers/
    AuthProvider.test.jsx
  routes/
    ProtectedRoute.test.jsx
  mocks/
    supabase.mock.js     # Mock de Supabase
  test/
    setup.js             # Setup de Vitest
    test-utils.jsx       # Utilidades de testing

tests/
  e2e/
    auth.spec.js         # Tests E2E de autenticación
    navigation.spec.js   # Tests E2E de navegación y RBAC
    appointments.spec.js # Tests E2E de citas
    coordination.spec.js # Tests E2E de dashboard de coordinación
    admin.spec.js        # Tests E2E de panel admin
```

---

## Convenciones de Naming

### Unit Tests
- Archivos: `*.test.js` (lógica) o `*.test.jsx` (componentes)
- Suites: `describe("NombreDelMódulo", () => { ... })`
- Tests: `it("descripción del comportamiento esperado", () => { ... })`

### E2E Tests
- Archivos: `*.spec.js`
- Suites: `test.describe("Nombre de la Feature", () => { ... })`
- Tests: `test("descripción del flujo", async ({ page }) => { ... })`

---

## Mocking de Supabase

Todas las llamadas a Supabase se mockean usando `src/mocks/supabase.mock.js`:

```javascript
import { supabaseMock, resetMocks } from "../../mocks/supabase.mock";

beforeEach(() => {
  resetMocks();
});

it("retorna datos", async () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve({ data: [...], error: null })),
  };
  supabaseMock.from.mockReturnValue(chain);

  const result = await MiRepositorio.getData();
  expect(result).toEqual([...]);
});
```

### Patrón para tests de hooks con renderHook

```javascript
import { renderHook, act } from "@testing-library/react";
import { supabaseMock, resetMocks } from "../../../../mocks/supabase.mock";

vi.mock("../../../../lib/supabase", () => ({ supabase: supabaseMock }));
vi.mock("../../../../providers/AuthProvider", () => ({ useAuth: vi.fn() }));

import { useAuth } from "../../../../providers/AuthProvider";

beforeEach(() => {
  resetMocks();
  vi.clearAllMocks();
  useAuth.mockReturnValue({ user: { id: "u1" }, profile: { role_id: 6 }, isAprendiz: () => true });
});

it("fetch data", async () => {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve({ data: [...], error: null })),
  });

  const { result } = renderHook(() => useMiHook());
  await act(async () => {
    await result.current.fetchData();
  });
  expect(result.current.data).toEqual([...]);
});
```

---

## Guía para Agregar Nuevos Tests

### 1. Test de Schema Zod

```javascript
import { appointmentSchema } from "./appointment.schema";

it("rechaza valor inválido", () => {
  const result = appointmentSchema.safeParse({ campo: "valor" });
  expect(result.success).toBe(false);
});
```

### 2. Test de Repositorio

```javascript
import { supabaseMock, resetMocks } from "../../../../mocks/supabase.mock";
import { MiRepositorio } from "./mi.repositorio";

beforeEach(() => resetMocks());

it("retorna datos", async () => {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve({ data: [...], error: null })),
  });
  const result = await MiRepositorio.getAll();
  expect(result).toEqual([...]);
});
```

### 3. Test de Componente

```javascript
import { render, screen } from "@testing-library/react";
import { MiComponente } from "../MiComponente";

it("renderiza el título", () => {
  render(<MiComponente title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

### 4. Test de Hook

```javascript
import { renderHook, act } from "@testing-library/react";

it("actualiza estado", async () => {
  const { result } = renderHook(() => useMiHook());
  act(() => {
    result.current.doSomething();
  });
  expect(result.current.state).toBe("expected");
});
```

### 5. Test E2E

```javascript
import { test, expect } from "@playwright/test";

test("flujo de usuario", async ({ page }) => {
  await page.goto("/ruta");
  await expect(page.getByText("Elemento")).toBeVisible();
});
```

---

## Pitfall Comunes

### 1. Mock de vi.mock y variables hoisted
`vi.mock` se ejecuta antes que cualquier import. No se puede acceder a variables definidas después:

```javascript
// MAL - ReferenceError
const supabaseMock = { from: vi.fn() };
vi.mock("...", () => ({ supabase: supabaseMock }));

// BIEN - usar vi.hoisted
const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));
vi.mock("...", () => ({ supabase: supabaseMock }));
```

### 2. Cadenas mock de Supabase
Supabase usa encadenamiento fluido. Cada método debe retornar `this`:

```javascript
supabaseMock.from.mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  then: vi.fn((resolve) => resolve({ data: [], error: null })),
});
```

### 3. Hooks que llaman fetchRoles después de una operación
Al testear `createRole`, `updateRole`, `deleteRole` en `useAdmin`, la función
interna llama `fetchRoles()` que necesita mocks adicionales:

```javascript
supabaseMock.from
  .mockReturnValueOnce(/* createRole insert */)
  .mockReturnValueOnce(/* logAction audit */)
  .mockReturnValueOnce(/* fetchRoles → roles part */)
  .mockReturnValueOnce(/* fetchRoles → profiles part */);
```

### 4. Hooks que usan estado interno
`cancelAppointment` busca en `appointments` del estado. Primero haz `fetchAppointments()`
para poblar el estado, luego cancela.

### 5. Memoria insuficiente en Windows
Si los tests tardan demasiado o crashean, aumentar la memoria:
```bash
NODE_OPTIONS="--max-old-space-size=8192" npx vitest run
```

---

## Cobertura Mínima Esperada

| Métrica | Umbral |
|---------|--------|
| Líneas | ≥ 70% |
| Funciones | ≥ 70% |
| Branches | ≥ 70% |
| Statements | ≥ 70% |

---

## Variables de Entorno para E2E

Para tests E2E que requieren autenticación, configurar las siguientes variables de entorno:

```bash
# Credenciales de aprendiz
TEST_USER_EMAIL=aprendiz@test.com
TEST_USER_PASSWORD=password123

# Credenciales de coordinador
TEST_COORD_EMAIL=coordinador@test.com
TEST_COORD_PASSWORD=password123

# Credenciales de admin
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=password123
```

Si no están configurados, los tests que requieren autenticación se saltan automáticamente con `test.skip()`.

---

## Resumen de Tests Creados

### Unit Tests (Vitest) — 214 tests, 16 archivos

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `appointment.schema.test.js` | 27 | Schema Zod completo |
| `appointments.repository.test.js` | 18 | CRUD de citas |
| `admin.repository.test.js` | 26 | Gestión admin completa |
| `dashboard.repository.test.js` | 10 | KPIs, gráficos, export |
| `audit.test.js` | 4 | Logging de auditoría |
| `AuthProvider.test.jsx` | 37 | RBAC y auth functions |
| `ProtectedRoute.test.jsx` | 8 | Guard de rutas |
| `UserAvatar.test.jsx` | 12 | Avatar de usuario |
| `EmptyState.test.jsx` | 10 | Estado vacío |
| `Skeleton.test.jsx` | 9 | Skeleton loader |
| `KPICard.test.jsx` | 10 | Tarjeta KPI |
| `AppointmentCard.test.jsx` | 14 | Tarjeta de cita |
| `AppointmentForm.test.jsx` | 6 | Formulario de citas |
| `useAppointments.test.js` | 11 | Hook de citas |
| `useReports.test.js` | 7 | Hook de reportes |
| `useAdmin.test.js` | 11 | Hook admin |
| `useDashboard.test.js` | 2 | Hook dashboard |

### E2E Tests (Playwright) — ~28 tests, 5 archivos

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `auth.spec.js` | 8 | Login, registro, recuperación |
| `navigation.spec.js` | 8 | RBAC, 404, rutas protegidas |
| `appointments.spec.js` | 4 | Flujo de citas |
| `coordination.spec.js` | 3 | Dashboard coordinación |
| `admin.spec.js` | 5 | Panel admin |

---

## Comandos Útiles

```bash
# Ejecutar un archivo específico
npx vitest run src/features/appointments/validations/appointment.schema.test.js

# Ejecutar tests que coincidan con un patrón
npx vitest run -t "dependency_id"

# Ejecutar Playwright solo en Chromium
npx playwright test --project=chromium

# Ejecutar un archivo E2E específico
npx playwright test tests/e2e/auth.spec.js

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar con más memoria (Windows)
NODE_OPTIONS="--max-old-space-size=8192" npm run test
```
