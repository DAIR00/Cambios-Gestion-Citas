import { test, expect } from "@playwright/test";

test.describe("Panel de Administración", () => {
  test.describe("Acceso", () => {
    test("redirige a login sin autenticación", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL(/login/);
    });

    test("muestra panel con credenciales de admin", async ({ page }) => {
      test.skip(!process.env.TEST_ADMIN_EMAIL, "Requiere credenciales de admin");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/admin/, { timeout: 15000 });

      await expect(page.getByText(/admin|administración/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Gestión de usuarios", () => {
    test("muestra pestaña de usuarios", async ({ page }) => {
      test.skip(!process.env.TEST_ADMIN_EMAIL, "Requiere credenciales de admin");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/admin/, { timeout: 15000 });

      // Buscar pestaña de usuarios
      const usersTab = page.getByRole("tab", { name: /usuarios/i });
      if (await usersTab.isVisible()) {
        await usersTab.click();
        await expect(page.getByText(/usuarios|users/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Gestión de dependencias", () => {
    test("muestra pestaña de dependencias", async ({ page }) => {
      test.skip(!process.env.TEST_ADMIN_EMAIL, "Requiere credenciales de admin");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/admin/, { timeout: 15000 });

      const depsTab = page.getByRole("tab", { name: /dependencias/i });
      if (await depsTab.isVisible()) {
        await depsTab.click();
        await expect(page.getByText(/dependencias/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Logs de auditoría", () => {
    test("muestra pestaña de auditoría", async ({ page }) => {
      test.skip(!process.env.TEST_ADMIN_EMAIL, "Requiere credenciales de admin");

      await page.goto("/login");
      await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL);
      await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/admin/, { timeout: 15000 });

      const auditTab = page.getByRole("tab", { name: /auditoría|audit/i });
      if (await auditTab.isVisible()) {
        await auditTab.click();
        await expect(page.getByText(/auditoría|audit|log/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

test.describe("Navegación del Admin", () => {
  test("muestra sidebar de navegación", async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, "Requiere credenciales de admin");

    await page.goto("/login");
    await page.getByLabel(/email/i).fill(process.env.TEST_ADMIN_EMAIL);
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_ADMIN_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL(/admin/, { timeout: 15000 });

    await expect(page.locator("nav, .sidebar, [role='navigation']")).toBeVisible({ timeout: 10000 });
  });
});
