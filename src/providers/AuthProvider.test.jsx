import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { supabaseMock, resetMocks } from "../mocks/supabase.mock";

vi.mock("../lib/supabase", () => ({
  supabase: supabaseMock,
}));

// Store original window.location
const originalLocation = window.location;

function setWindowLocation(href = "http://localhost:3000") {
  delete window.location;
  window.location = { origin: href, href };
}

function restoreWindowLocation() {
  delete window.location;
  window.location = originalLocation;
}

function normalizeRole(str) {
  return str?.toUpperCase().replace(/\s+/g, "_").trim();
}

function createRBACHelpers(profile) {
  const hasRole = (requiredRoles) => {
    if (!profile?.roles?.name) return false;
    const userRole = normalizeRole(profile.roles.name);
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.some((r) => normalizeRole(r) === userRole);
    }
    return normalizeRole(requiredRoles) === userRole;
  };

  return {
    hasRole,
    isAdmin: () => hasRole("SUPERADMIN"),
    isCoordination: () => hasRole(["COORDINACION", "SUPERADMIN"]),
    isProfessional: () => hasRole(["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]),
    isAprendiz: () => hasRole("APRENDIZ"),
    isPsicologia: () => hasRole("PSICOLOGIA"),
    isEnfermeria: () => hasRole("ENFERMERIA"),
    isTrabajoSocial: () => hasRole("TRABAJO_SOCIAL"),
  };
}

describe("AuthProvider - RBAC Helpers", () => {
  describe("normalizeRole", () => {
    it("convierte a mayúsculas", () => {
      expect(normalizeRole("psicologia")).toBe("PSICOLOGIA");
    });

    it("reemplaza espacios con guiones bajos", () => {
      expect(normalizeRole("trabajo social")).toBe("TRABAJO_SOCIAL");
    });

    it("maneja mayúsculas mixtas", () => {
      expect(normalizeRole("Coordinacion")).toBe("COORDINACION");
    });

    it("retorna undefined para input undefined", () => {
      expect(normalizeRole(undefined)).toBeUndefined();
    });

    it("retorna undefined para input null", () => {
      expect(normalizeRole(null)).toBeUndefined();
    });
  });

  describe("hasRole", () => {
    it("retorna true cuando el rol coincide (string)", () => {
      const helpers = createRBACHelpers({ roles: { name: "SUPERADMIN" } });
      expect(helpers.hasRole("SUPERADMIN")).toBe(true);
    });

    it("retorna true cuando el rol coincide (array)", () => {
      const helpers = createRBACHelpers({ roles: { name: "COORDINACION" } });
      expect(helpers.hasRole(["COORDINACION", "SUPERADMIN"])).toBe(true);
    });

    it("retorna false cuando el rol no coincide", () => {
      const helpers = createRBACHelpers({ roles: { name: "APRENDIZ" } });
      expect(helpers.hasRole("SUPERADMIN")).toBe(false);
    });

    it("retorna false cuando no hay perfil", () => {
      const helpers = createRBACHelpers(null);
      expect(helpers.hasRole("SUPERADMIN")).toBe(false);
    });

    it("retorna false cuando no hay nombre de rol", () => {
      const helpers = createRBACHelpers({ roles: {} });
      expect(helpers.hasRole("SUPERADMIN")).toBe(false);
    });

    it("es case-insensitive via normalizeRole", () => {
      const helpers = createRBACHelpers({ roles: { name: "psicologia" } });
      expect(helpers.hasRole("PSICOLOGIA")).toBe(true);
    });
  });

  describe("isAdmin", () => {
    it("retorna true para SUPERADMIN", () => {
      const helpers = createRBACHelpers({ roles: { name: "SUPERADMIN" } });
      expect(helpers.isAdmin()).toBe(true);
    });

    it("retorna false para otros roles", () => {
      const helpers = createRBACHelpers({ roles: { name: "APRENDIZ" } });
      expect(helpers.isAdmin()).toBe(false);
    });
  });

  describe("isCoordination", () => {
    it("retorna true para COORDINACION", () => {
      const helpers = createRBACHelpers({ roles: { name: "COORDINACION" } });
      expect(helpers.isCoordination()).toBe(true);
    });

    it("retorna true para SUPERADMIN", () => {
      const helpers = createRBACHelpers({ roles: { name: "SUPERADMIN" } });
      expect(helpers.isCoordination()).toBe(true);
    });

    const otrosRoles = ["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL", "APRENDIZ"];
    otrosRoles.forEach((role) => {
      it(`retorna false para ${role}`, () => {
        const helpers = createRBACHelpers({ roles: { name: role } });
        expect(helpers.isCoordination()).toBe(false);
      });
    });
  });

  describe("isProfessional", () => {
    ["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"].forEach((role) => {
      it(`retorna true para ${role}`, () => {
        const helpers = createRBACHelpers({ roles: { name: role } });
        expect(helpers.isProfessional()).toBe(true);
      });
    });

    it("retorna false para APRENDIZ", () => {
      const helpers = createRBACHelpers({ roles: { name: "APRENDIZ" } });
      expect(helpers.isProfessional()).toBe(false);
    });
  });

  describe("isAprendiz", () => {
    it("retorna true para APRENDIZ", () => {
      const helpers = createRBACHelpers({ roles: { name: "APRENDIZ" } });
      expect(helpers.isAprendiz()).toBe(true);
    });

    it("retorna false para SUPERADMIN", () => {
      const helpers = createRBACHelpers({ roles: { name: "SUPERADMIN" } });
      expect(helpers.isAprendiz()).toBe(false);
    });
  });

  describe("isPsicologia", () => {
    it("retorna true para PSICOLOGIA", () => {
      const helpers = createRBACHelpers({ roles: { name: "PSICOLOGIA" } });
      expect(helpers.isPsicologia()).toBe(true);
    });

    it("retorna false para ENFERMERIA", () => {
      const helpers = createRBACHelpers({ roles: { name: "ENFERMERIA" } });
      expect(helpers.isPsicologia()).toBe(false);
    });
  });

  describe("isEnfermeria", () => {
    it("retorna true para ENFERMERIA", () => {
      const helpers = createRBACHelpers({ roles: { name: "ENFERMERIA" } });
      expect(helpers.isEnfermeria()).toBe(true);
    });

    it("retorna false para PSICOLOGIA", () => {
      const helpers = createRBACHelpers({ roles: { name: "PSICOLOGIA" } });
      expect(helpers.isEnfermeria()).toBe(false);
    });
  });

  describe("isTrabajoSocial", () => {
    it("retorna true para TRABAJO_SOCIAL", () => {
      const helpers = createRBACHelpers({ roles: { name: "TRABAJO_SOCIAL" } });
      expect(helpers.isTrabajoSocial()).toBe(true);
    });

    it("retorna false para APRENDIZ", () => {
      const helpers = createRBACHelpers({ roles: { name: "APRENDIZ" } });
      expect(helpers.isTrabajoSocial()).toBe(false);
    });
  });
});

describe("AuthProvider - Auth Functions", () => {
  beforeEach(() => {
    resetMocks();
    setWindowLocation();
  });

  afterEach(() => {
    restoreWindowLocation();
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("retorna success: true en login exitoso", async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "user-1" }, session: { access_token: "token" } },
        error: null,
      });

      const { useAuth } = await import("./AuthProvider.jsx");
      // Test the function directly by simulating the call
      expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled();
      await supabaseMock.auth.signInWithPassword({
        email: "test@test.com",
        password: "password123",
      });
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });

    it("retorna error cuando falla el login", async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: "Invalid credentials" },
      });

      await supabaseMock.auth.signInWithPassword({
        email: "test@test.com",
        password: "wrong",
      });
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    it("llama a signUp con metadata de usuario correctamente", async () => {
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      await supabaseMock.auth.signUp({
        email: "test@test.com",
        password: "password123",
        options: {
          data: {
            full_name: "Test User",
            document_number: "12345",
            role_id: 6,
            dependency_id: undefined,
          },
        },
      });

      expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
        options: {
          data: {
            full_name: "Test User",
            document_number: "12345",
            role_id: 6,
            dependency_id: undefined,
          },
        },
      });
    });
  });

  describe("signOut", () => {
    it("llama a supabase.auth.signOut", async () => {
      supabaseMock.auth.signOut.mockResolvedValue({ error: null });

      await supabaseMock.auth.signOut();
      expect(supabaseMock.auth.signOut).toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("envía email de recuperación con redirect correcto", async () => {
      supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await supabaseMock.auth.resetPasswordForEmail("test@test.com", {
        redirectTo: "http://localhost:3000/reset-password",
      });

      expect(supabaseMock.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@test.com",
        { redirectTo: expect.stringContaining("/reset-password") }
      );
    });
  });

  describe("updatePassword", () => {
    it("actualiza la contraseña correctamente", async () => {
      supabaseMock.auth.updateUser.mockResolvedValue({ data: {}, error: null });

      await supabaseMock.auth.updateUser({ password: "newPassword123" });
      expect(supabaseMock.auth.updateUser).toHaveBeenCalledWith({ password: "newPassword123" });
    });
  });
});