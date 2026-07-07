import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../mocks/supabase.mock";
import { DashboardRepository } from "./dashboard.repository";

describe("DashboardRepository", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("getKPI", () => {
    it("retorna KPIs calculados correctamente", async () => {
      const mockData = [
        { status: "completed", scheduled_date: "2025-01-15", created_at: "2025-01-10" },
        { status: "completed", scheduled_date: "2025-01-20", created_at: "2025-01-18" },
        { status: "pending", scheduled_date: "2025-01-25", created_at: "2025-01-22" },
        { status: "cancelled", scheduled_date: "2025-01-22", created_at: "2025-01-20" },
        { status: "no_show", scheduled_date: "2025-01-18", created_at: "2025-01-15" },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getKPI({ from: "2025-01-01", to: "2025-01-31" });
      expect(result[0].total_appointments).toBe(5);
      expect(result[0].completed_appointments).toBe(2);
      expect(result[0].pending_count).toBe(1);
      expect(result[0].cancelled_count).toBe(1);
      expect(result[0].no_show_count).toBe(1);
      expect(result[0].avg_wait_days).toBeGreaterThan(0);
    });

    it("retorna 0 avg_wait_days cuando no hay completadas", async () => {
      const mockData = [{ status: "pending", scheduled_date: "2025-01-15", created_at: "2025-01-10" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getKPI({ from: "2025-01-01", to: "2025-01-31" });
      expect(result[0].avg_wait_days).toBe(0);
    });

    it("lanza error cuando Supabase falla", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: { message: "query failed" } })),
      };
      supabaseMock.from.mockReturnValue(chain);

      await expect(DashboardRepository.getKPI({ from: "2025-01-01", to: "2025-01-31" })).rejects.toThrow("Error KPI");
    });
  });

  describe("getAppointmentsByDependency", () => {
    it("agrupa citas por dependencia", async () => {
      const mockData = [
        { dependency_id: 1, dependencies: { name: "Psicología", color: "#FF0000" }, status: "completed" },
        { dependency_id: 1, dependencies: { name: "Psicología", color: "#FF0000" }, status: "pending" },
        { dependency_id: 2, dependencies: { name: "Enfermería", color: "#00FF00" }, status: "completed" },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getAppointmentsByDependency({ from: "2025-01-01", to: "2025-01-31" });
      expect(result).toHaveLength(2);
      expect(result.find((d) => d.name === "Psicología").total).toBe(2);
      expect(result.find((d) => d.name === "Psicología").completed).toBe(1);
      expect(result.find((d) => d.name === "Enfermería").total).toBe(1);
    });

    it("maneja dependencias nulas", async () => {
      const mockData = [{ dependency_id: null, dependencies: null, status: "pending" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getAppointmentsByDependency({ from: "2025-01-01", to: "2025-01-31" });
      expect(result[0].name).toBe("Sin dependencia");
    });
  });

  describe("getMonthlyEvolution", () => {
    it("retorna evolución mensual ordenada", async () => {
      const mockData = [
        { status: "completed", scheduled_date: "2025-03-15" },
        { status: "pending", scheduled_date: "2025-03-20" },
        { status: "completed", scheduled_date: "2025-01-10" },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getMonthlyEvolution(2025);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0].month).toBeLessThan(result[1].month);
      expect(result.find((m) => m.name === "Ene").total).toBe(1);
      expect(result.find((m) => m.name === "Mar").total).toBe(2);
    });
  });

  describe("getProfessionalPerformance", () => {
    it("retorna rendimiento de profesionales ordenado por completadas", async () => {
      const mockData = [
        { professional_id: "p1", professional: { full_name: "Dr. García" }, status: "completed", scheduled_date: "2025-01-15" },
        { professional_id: "p1", professional: { full_name: "Dr. García" }, status: "completed", scheduled_date: "2025-01-20" },
        { professional_id: "p2", professional: { full_name: "Dra. López" }, status: "pending", scheduled_date: "2025-01-18" },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getProfessionalPerformance({ from: "2025-01-01", to: "2025-01-31" });
      expect(result[0].name).toBe("Dr. García");
      expect(result[0].completed).toBe(2);
      expect(result[1].name).toBe("Dra. López");
      expect(result[1].completed).toBe(0);
    });

    it("limita a 10 profesionales", async () => {
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        professional_id: `p${i}`,
        professional: { full_name: `Prof ${i}` },
        status: "completed",
        scheduled_date: "2025-01-15",
      }));
      const chain = {
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getProfessionalPerformance({ from: "2025-01-01", to: "2025-01-31" });
      expect(result).toHaveLength(10);
    });

    it("maneja profesionales sin nombre", async () => {
      const mockData = [{ professional_id: "p1", professional: null, status: "completed", scheduled_date: "2025-01-15" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getProfessionalPerformance({ from: "2025-01-01", to: "2025-01-31" });
      expect(result[0].name).toBe("Sin asignar");
    });
  });

  describe("getRawDataForExport", () => {
    it("retorna datos crudos para exportación", async () => {
      const mockData = [{ id: "1", status: "completed" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await DashboardRepository.getRawDataForExport({ from: "2025-01-01", to: "2025-01-31" });
      expect(result).toEqual(mockData);
    });
  });
});
