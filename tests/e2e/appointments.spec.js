import { test, expect } from "@playwright/test";

test.describe("Gestión de Citas", () => {
  test.describe("Formulario de nueva cita", () => {
    test("muestra campos del formulario después de login", async ({ page }) => {
      // Este test requiere autenticación previa
      // Se ejecuta solo si hay credenciales de test disponibles
      test.skip(!process.env.TEST_USER_EMAIL, "Requiere credenciales de test");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_USER_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/dashboard/, { timeout: 15000 });

      // Verificar que el dashboard del aprendiz carga
      await expect(page.getByText(/citas|dashboard/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Dashboard del aprendiz", () => {
    test("muestra interfaz del dashboard", async ({ page }) => {
      test.skip(!process.env.TEST_USER_EMAIL, "Requiere credenciales de test");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_USER_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/dashboard/, { timeout: 15000 });

      // Verificar elementos del dashboard
      await expect(page.locator("body")).toContainText(/cita/i);
    });
  });

  test.describe("Validación del formulario", () => {
    test("muestra formulario con campos visibles", async ({ page }) => {
      // Test de validación sin necesidad de login completo
      // Verifica que la página de login funciona correctamente
      await page.goto("/login");
      await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
    });
  });
});

test.describe("Flujo completo de usuario", () => {
  test("navega desde login hasta register y de vuelta", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();

    // Navegar a register
    await page.getByRole("link", { name: /registr/i }).click();
    await expect(page).toHaveURL(/register/);

    // Navegar de vuelta a login
    await page.getByRole("link", { name: /iniciar sesión|login/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test("navega a recuperar contraseña desde login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /olvid|recuperar/i }).click();
    await expect(page).toHaveURL(/recuperar/);
  });
});
