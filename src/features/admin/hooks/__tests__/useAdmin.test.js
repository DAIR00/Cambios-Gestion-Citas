import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../../mocks/supabase.mock";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../../../lib/supabase", () => ({
  supabase: supabaseMock,
}));

vi.mock("../../../../providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useAuth } from "../../../../providers/AuthProvider";

describe("useAdmin", () => {
  const mockAdmin = { id: "admin-1" };

  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockAdmin });
  });

  describe("fetchUsers", () => {
    it("obtiene usuarios con paginación", async () => {
      const mockUsers = [{ id: "1", full_name: "User 1" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockUsers, error: null, count: 1 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.fetchUsers({ page: 1, limit: 10 });
      });

      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.pagination.page).toBe(1);
    });

    it("aplica filtro de búsqueda", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.fetchUsers({ search: "Juan" });
      });

      expect(chain.or).toHaveBeenCalled();
    });
  });

  describe("fetchConfig", () => {
    it("obtiene configuración del sistema", async () => {
      const mockConfig = [
        { key: "max_pending", value: 5 },
        { key: "working_hours", value: "08:00-17:00" },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockConfig, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.fetchConfig();
      });

      expect(result.current.config).toEqual({
        max_pending: 5,
        working_hours: "08:00-17:00",
      });
    });
  });

  describe("createUser", () => {
    it("crea usuario correctamente", async () => {
      supabaseMock.auth.admin = {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: "new-user" } },
          error: null,
        }),
      };

      const chain = {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "new-user" }, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      supabaseMock.from
        .mockReturnValueOnce(chain)
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.createUser({
          email: "test@test.com",
          password: "password",
          fullName: "Test",
          roleId: 6,
        });
      });

      // Verify the call was made
      expect(supabaseMock.from).toHaveBeenCalled();
    });
  });

  describe("fetchRoles", () => {
    it("obtiene roles con conteo de usuarios", async () => {
      const rolesData = [{ id: 1, name: "SUPERADMIN", permissions: [] }];
      const profilesData = [{ role_id: 1 }, { role_id: 1 }, { role_id: 6 }];

      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: rolesData, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({ data: profilesData, error: null }),
        });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.fetchRoles();
      });

      expect(result.current.roles).toHaveLength(1);
    });
  });

  describe("fetchDependencies", () => {
    it("obtiene estadísticas de dependencias", async () => {
      const depsData = [{ id: 1, name: "Psicología", color: "#FF0000" }];
      const profsData = [{ dependency_id: 1, role_id: 3 }];
      const aptsData = [{ dependency_id: 1, status: "completed" }];

      supabaseMock.from
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: depsData, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: profsData, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: aptsData, error: null }) });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        await result.current.fetchDependencies();
      });

      expect(result.current.dependencies).toHaveLength(1);
    });
  });

  describe("createRole", () => {
    it("crea rol y actualiza lista", async () => {
      supabaseMock.from
        // createRole → insert role
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 7, name: "NEW" }, error: null }),
        })
        // logAction → insert audit
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
        // fetchRoles → getRoles (roles part)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
        // fetchRoles → getRoles (profiles part)
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: [], error: null }) });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      await act(async () => {
        const res = await result.current.createRole({ name: "NEW_ROLE" });
        expect(res.success || res).toBeDefined();
      });
    });
  });

  describe("updateRole", () => {
    it("actualiza rol existente", async () => {
      const oldData = { id: 1, name: "OLD" };
      const newData = { id: 1, name: "UPDATED" };

      // AdminRepository.updateRole internally calls:
      // 1. from("roles").select("*").eq().single() → get old data
      // 2. from("roles").update().eq().select().single() → update
      // 3. logAction → from("audit_logs").insert()
      // Then useAdmin.updateRole calls fetchRoles:
      // 4. from("roles").select("*").order() → getRoles roles part
      // 5. from("profiles").select("role_id") → getRoles profiles part

      supabaseMock.from
        // 1. Get old data
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
        })
        // 2. Update
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: newData, error: null }),
        })
        // 3. Audit log
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
        // 4. fetchRoles → roles
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
        // 5. fetchRoles → profiles
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: [], error: null }) });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      let res;
      await act(async () => {
        res = await result.current.updateRole(1, { name: "UPDATED" });
      });

      expect(res.success).toBe(true);
    });
  });

  describe("deleteRole", () => {
    it("elimina rol sin usuarios", async () => {
      // AdminRepository.deleteRole internally calls:
      // 1. from("profiles").select("*", {count:"exact", head:true}).eq() → count users
      // 2. from("roles").select("*").eq().single() → get old data
      // 3. from("roles").delete().eq() → delete
      // 4. logAction → from("audit_logs").insert()
      // Then useAdmin.deleteRole calls fetchRoles:
      // 5. from("roles").select("*").order() → getRoles roles part
      // 6. from("profiles").select("role_id") → getRoles profiles part

      supabaseMock.from
        // 1. Count users (count: 0)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            count: 0,
            error: null,
          }),
        })
        // 2. Get old data
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { name: "TO_DELETE" }, error: null }),
        })
        // 3. Delete
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })
        // 4. Audit log
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) })
        // 5. fetchRoles → roles
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
        // 6. fetchRoles → profiles
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: [], error: null }) });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      let res;
      await act(async () => {
        res = await result.current.deleteRole(7);
      });

      expect(res.success).toBe(true);
    });

    it("rechaza eliminar rol con usuarios", async () => {
      // AdminRepository.deleteRole calls:
      // 1. from("profiles").select("*", {count:"exact", head:true}).eq() → count users (3)
      // Then throws error before proceeding

      supabaseMock.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({
          count: 3,
          error: null,
        }),
      });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      let res;
      await act(async () => {
        res = await result.current.deleteRole(1);
      });

      expect(res.success).toBe(false);
    });
  });

  describe("reassignAppointment", () => {
    it("reasigna profesional a cita", async () => {
      // AdminRepository.reassignAppointment internally calls:
      // 1. from("appointments").select(...).eq().single() → get old data
      // 2. from("appointments").update().eq().select().single() → update
      // 3. logAction → from("audit_logs").insert()

      supabaseMock.from
        // 1. Get old data
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: "apt-1" }, error: null }),
        })
        // 2. Update
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: "apt-1", professional_id: "new-prof" }, error: null }),
        })
        // 3. Audit log
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const { useAdmin } = await import("../useAdmin");
      const { result } = renderHook(() => useAdmin());

      let res;
      await act(async () => {
        res = await result.current.reassignAppointment("apt-1", "new-prof");
      });

      expect(res.success).toBe(true);
    });
  });
});
