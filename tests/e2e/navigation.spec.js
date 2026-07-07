import { test, expect } from "@playwright/test";

test.describe("Navegación y RBAC", () => {
  test.describe("Rutas protegidas", () => {
    test("redirige a login cuando no hay sesión en /dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/login/);
    });

    test("redirige a login cuando no hay sesión en /admin", async ({ page }) => {
      await page.goto("/admin");
      await expect(page).toHaveURL(/login/);
    });

    test("redirige a login cuando no hay sesión en /coordination", async ({ page }) => {
      await page.goto("/coordination");
      await expect(page).toHaveURL(/login/);
    });

    test("redirige a login cuando no hay sesión en /psychology", async ({ page }) => {
      await page.goto("/psychology");
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Página 404", () => {
    test("muestra 404 para ruta inexistente", async ({ page }) => {
      await page.goto("/ruta-que-no-existe");
      await expect(page.getByText(/404|no encontr/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Página de no autorizado", () => {
    test("muestra mensaje de no autorizado", async ({ page }) => {
      await page.goto("/unauthorized");
      await expect(page.getByText(/no autorizado|acceso denegado|403/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Navegación pública", () => {
    test("accede a login sin autenticación", async ({ page }) => {
      await page.goto("/login");
      await expect(page).toHaveURL(/login/);
    });

    test("accede a register sin autenticación", async ({ page }) => {
      await page.goto("/register");
      await expect(page).toHaveURL(/register/);
    });

    test("accede a recuperar contraseña sin autenticación", async ({ page }) => {
      await page.goto("/recuperar");
      await expect(page).toHaveURL(/recuperar/);
    });
  });

  test.describe("Home redirect", () => {
    test("redirige a login cuando访问 / sin sesión", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/login/);
    });
  });
});
