import { test, expect } from "@playwright/test";

test.describe("Autenticación", () => {
  test.describe("Login", () => {
    test("muestra el formulario de login", async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/contraseña/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
    });

    test("muestra error con credenciales inválidas", async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel(/email/i).fill("invalid@test.com");
      await page.getByLabel(/contraseña/i).fill("wrongpassword");
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      await expect(page.getByText(/error|credenciales|inválid/i)).toBeVisible({ timeout: 10000 });
    });

    test("muestra errores de validación al enviar vacío", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      await expect(page.getByText(/requerido|obligatorio|email/i)).toBeVisible({ timeout: 5000 });
    });

    test("redirige a register desde el login", async ({ page }) => {
      await page.goto("/login");
      await page.getByRole("link", { name: /registr|crear cuenta/i }).click();
      await expect(page).toHaveURL(/register/);
    });
  });

  test.describe("Registro", () => {
    test("muestra el formulario de registro", async ({ page }) => {
      await page.goto("/register");
      await expect(page.getByLabel(/nombre/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /registr/i })).toBeVisible();
    });

    test("muestra errores de validación al enviar vacío", async ({ page }) => {
      await page.goto("/register");
      await page.getByRole("button", { name: /registr/i }).click();

      await expect(page.locator(".error, [class*='error']").first()).toBeVisible({ timeout: 5000 });
    });

    test("redirige a login desde el registro", async ({ page }) => {
      await page.goto("/register");
      await page.getByRole("link", { name: /iniciar sesión|login/i }).click();
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Recuperar Contraseña", () => {
    test("muestra el formulario de recuperación", async ({ page }) => {
      await page.goto("/recuperar");
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /enviar|recuperar/i })).toBeVisible();
    });
  });
});
