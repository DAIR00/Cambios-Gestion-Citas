import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../mocks/supabase.mock";
import { AdminRepository } from "./admin.repository";

describe("AdminRepository", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("getUsers", () => {
    it("retorna usuarios con paginación", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [{ id: "1" }], error: null, count: 1 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getUsers({ page: 1, limit: 10 });
      expect(result.users).toEqual([{ id: "1" }]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
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

      await AdminRepository.getUsers({ search: "admin" });
      expect(chain.or).toHaveBeenCalledWith(expect.stringContaining("admin"));
    });

    it("aplica filtro de rol", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      await AdminRepository.getUsers({ role: "SUPERADMIN" });
      expect(chain.eq).toHaveBeenCalledWith("roles.name", "SUPERADMIN");
    });

    it("lanza error cuando falla", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: { message: "failed" }, count: 0 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      await expect(AdminRepository.getUsers({})).rejects.toThrow("Error fetching users");
    });
  });

  describe("updateUser", () => {
    it("actualiza un usuario y registra auditoría", async () => {
      const oldData = { id: "1", full_name: "Old Name" };
      const newData = { id: "1", full_name: "New Name" };

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
      };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newData, error: null }),
      };

      supabaseMock.from
        .mockReturnValueOnce({ ...selectChain, select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: oldData, error: null }) }) }) })
        .mockReturnValueOnce({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: newData, error: null }) }) }) }) })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const result = await AdminRepository.updateUser("1", { full_name: "New Name" }, "admin-id");
      expect(result.full_name).toBe("New Name");
    });
  });

  describe("getConfig", () => {
    it("retorna configuración del sistema como objeto", async () => {
      const mockConfig = [
        { key: "appointment_limits", value: { max_pending: 2 } },
        { key: "working_hours", value: { start: "08:00" } },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockConfig, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getConfig();
      expect(result).toEqual({
        appointment_limits: { max_pending: 2 },
        working_hours: { start: "08:00" },
      });
    });

    it("lanza error cuando falla", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: { message: "failed" } })),
      };
      supabaseMock.from.mockReturnValue(chain);

      await expect(AdminRepository.getConfig()).rejects.toThrow();
    });
  });

  describe("updateConfig", () => {
    it("actualiza configuración y registra auditoría", async () => {
      const oldConfig = [{ key: "appointment_limits", value: { max_pending: 2 } }];
      const newData = { key: "appointment_limits", value: { max_pending: 3 } };

      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: oldConfig, error: null }),
        })
        .mockReturnValueOnce({
          upsert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: newData, error: null }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue({ error: null }),
        });

      const result = await AdminRepository.updateConfig("appointment_limits", { max_pending: 3 }, "admin-id");
      expect(result.key).toBe("appointment_limits");
    });
  });

  describe("getGlobalStats", () => {
    it("retorna estadísticas globales", async () => {
      const usersData = [
        { id: "1", is_active: true, role_id: 1, roles: { name: "SUPERADMIN" } },
        { id: "2", is_active: false, role_id: 6, roles: { name: "APRENDIZ" } },
      ];
      const appointmentsData = [
        { status: "completed", scheduled_date: "2025-01-15", created_at: "2025-01-10" },
        { status: "pending", scheduled_date: "2025-01-20", created_at: "2025-01-18" },
        { status: "completed", scheduled_date: "2025-01-25", created_at: "2025-01-20" },
      ];
      const profsData = [{ id: "p1" }, { id: "p2" }];

      supabaseMock.from
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: usersData, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: appointmentsData, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: profsData, error: null }) });

      const result = await AdminRepository.getGlobalStats();
      expect(result.totalUsers).toBe(2);
      expect(result.activeUsers).toBe(1);
      expect(result.totalAppointments).toBe(3);
      expect(result.completedAppointments).toBe(2);
      expect(result.completionRate).toBe(67);
      expect(result.activeProfessionals).toBe(2);
    });
  });

  describe("getUserStats", () => {
    it("retorna distribución de usuarios por rol", async () => {
      const mockData = [
        { role_id: 1, roles: { name: "SUPERADMIN" } },
        { role_id: 1, roles: { name: "SUPERADMIN" } },
        { role_id: 6, roles: { name: "APRENDIZ" } },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getUserStats();
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.role === "SUPERADMIN").count).toBe(2);
      expect(result.find((r) => r.role === "APRENDIZ").count).toBe(1);
    });
  });

  describe("getAppointmentStatusStats", () => {
    it("retorna citas agrupadas por estado", async () => {
      const mockData = [
        { status: "completed" },
        { status: "completed" },
        { status: "pending" },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getAppointmentStatusStats();
      expect(result).toHaveLength(2);
      expect(result.find((s) => s.status === "completed").count).toBe(2);
      expect(result.find((s) => s.status === "pending").count).toBe(1);
    });
  });

  describe("getAllAppointments", () => {
    it("retorna citas con paginación", async () => {
      const mockApts = [{ id: "1", status: "pending" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockApts, error: null, count: 1 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getAllAppointments({ page: 1, limit: 20 });
      expect(result.appointments).toEqual(mockApts);
      expect(result.total).toBe(1);
    });

    it("aplica filtros de búsqueda", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null, count: 0 })),
      };
      supabaseMock.from.mockReturnValue(chain);

      await AdminRepository.getAllAppointments({ search: "Juan", status: "pending" });
      expect(chain.or).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("status", "pending");
    });
  });

  describe("getRecentActivity", () => {
    it("retorna actividad reciente", async () => {
      const mockActivity = [{ id: "1", status: "completed" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockActivity, error: null }),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getRecentActivity(5);
      expect(result).toEqual(mockActivity);
    });
  });

  describe("createDependency", () => {
    it("crea dependencia y registra auditoría", async () => {
      const mockDep = { id: 1, name: "Enfermería", color: "#FF0000" };
      supabaseMock.from
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockDep, error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const result = await AdminRepository.createDependency({ name: "Enfermería", color: "#FF0000" }, "admin-id");
      expect(result.name).toBe("Enfermería");
    });
  });

  describe("updateDependency", () => {
    it("actualiza dependencia y registra auditoría", async () => {
      const oldData = { id: 1, name: "Old" };
      const newData = { id: 1, name: "Updated" };
      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: newData, error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const result = await AdminRepository.updateDependency(1, { name: "Updated" }, "admin-id");
      expect(result.name).toBe("Updated");
    });
  });

  describe("deleteDependency", () => {
    it("elimina dependencia y registra auditoría", async () => {
      const oldData = { id: 1, name: "To Delete" };
      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
        })
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      await expect(AdminRepository.deleteDependency(1, "admin-id")).resolves.not.toThrow();
    });
  });

  describe("getRoles", () => {
    it("retorna roles con conteo de usuarios", async () => {
      const rolesData = [{ id: 1, name: "SUPERADMIN", permissions: ["dashboard.view"] }];
      const profilesData = [{ role_id: 1 }, { role_id: 1 }, { role_id: 6 }];

      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: rolesData, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockResolvedValue({ data: profilesData, error: null }),
        });

      const result = await AdminRepository.getRoles();
      expect(result).toHaveLength(1);
      expect(result[0].userCount).toBe(2);
      expect(result[0].permissions).toEqual(["dashboard.view"]);
    });
  });

  describe("createRole", () => {
    it("crea rol y registra auditoría", async () => {
      const mockRole = { id: 7, name: "NEW_ROLE", permissions: [] };
      supabaseMock.from
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockRole, error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const result = await AdminRepository.createRole({ name: "NEW_ROLE", permissions: [] }, "admin-id");
      expect(result.name).toBe("NEW_ROLE");
    });
  });

  describe("updateRole", () => {
    it("actualiza rol y registra auditoría", async () => {
      const oldData = { id: 1, name: "OLD" };
      const newData = { id: 1, name: "UPDATED" };
      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: newData, error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const result = await AdminRepository.updateRole(1, { name: "UPDATED", description: "desc" }, "admin-id");
      expect(result.name).toBe("UPDATED");
    });
  });

  describe("deleteRole", () => {
    it("elimina rol cuando no tiene usuarios", async () => {
      const oldData = { id: 7, name: "TO_DELETE" };
      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
        })
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      await expect(AdminRepository.deleteRole(7, "admin-id")).resolves.not.toThrow();
    });

    it("rechaza eliminar rol con usuarios asignados", async () => {
      supabaseMock.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
      });

      await expect(AdminRepository.deleteRole(1, "admin-id")).rejects.toThrow("No se puede eliminar");
    });
  });

  describe("updateRolePermissions", () => {
    it("actualiza permisos y registra auditoría", async () => {
      const oldData = { id: 1, permissions: [] };
      const newData = { id: 1, permissions: ["dashboard.view", "users.manage"] };
      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: oldData, error: null }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: newData, error: null }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const result = await AdminRepository.updateRolePermissions(1, ["dashboard.view", "users.manage"], "admin-id");
      expect(result.permissions).toHaveLength(2);
    });
  });

  describe("getProfessionalsByDependency", () => {
    it("retorna profesionales de una dependencia", async () => {
      const mockProfs = [{ id: "p1", full_name: "Dr. García" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockProfs, error: null }),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AdminRepository.getProfessionalsByDependency(1);
      expect(result).toEqual(mockProfs);
    });
  });

  describe("getDependencyStats", () => {
    it("retorna estadísticas de dependencias", async () => {
      const deps = [{ id: 1, name: "Psicología", color: "#FF0000" }];
      const profs = [{ dependency_id: 1, role_id: 3 }, { dependency_id: 1, role_id: 4 }];
      const apts = [
        { dependency_id: 1, status: "completed" },
        { dependency_id: 1, status: "pending" },
      ];

      supabaseMock.from
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: deps, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: profs, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockResolvedValue({ data: apts, error: null }) });

      const result = await AdminRepository.getDependencyStats();
      expect(result).toHaveLength(1);
      expect(result[0].professionalCount).toBe(2);
      expect(result[0].appointmentCount).toBe(2);
      expect(result[0].completedCount).toBe(1);
      expect(result[0].completionRate).toBe(50);
    });
  });

  describe("logAction", () => {
    it("inserta registro de auditoría", async () => {
      const chain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      supabaseMock.from.mockReturnValue(chain);

      await AdminRepository.logAction({
        userId: "admin-1",
        action: "CREATE_USER",
        entityType: "user",
        entityId: "user-1",
        oldData: null,
        newData: { full_name: "Test" },
      });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: "admin-1",
        action: "CREATE_USER",
        entity_type: "user",
      }));
    });
  });
});
