import { test, expect } from "@playwright/test";

test.describe("Dashboard de Coordinación", () => {
  test.describe("Acceso", () => {
    test("redirige a login sin autenticación", async ({ page }) => {
      await page.goto("/coordination");
      await expect(page).toHaveURL(/login/);
    });

    test("muestra dashboard con credenciales de coordinador", async ({ page }) => {
      test.skip(!process.env.TEST_COORD_EMAIL, "Requiere credenciales de coordinación");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_COORD_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_COORD_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/coordination/, { timeout: 15000 });

      await expect(page.getByText(/dashboard|coordinación|KPI/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Exportación", () => {
    test("muestra botón de exportar CSV", async ({ page }) => {
      test.skip(!process.env.TEST_COORD_EMAIL, "Requiere credenciales de coordinación");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_COORD_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_COORD_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/coordination/, { timeout: 15000 });

      await expect(page.getByRole("button", { name: /exportar|csv/i })).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe("Navegación del Dashboard", () => {
  test("permite navegar entre secciones", async ({ page }) => {
    test.skip(!process.env.TEST_COORD_EMAIL, "Requiere credenciales de coordinación");

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(process.env.TEST_COORD_EMAIL);
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_COORD_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL(/coordination/, { timeout: 15000 });

    // Verificar que hay navegación sidebar
    await expect(page.locator("nav, .sidebar, [role='navigation']")).toBeVisible({ timeout: 10000 });
  });
});
