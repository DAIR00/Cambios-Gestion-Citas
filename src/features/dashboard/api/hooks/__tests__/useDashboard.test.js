import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../../../mocks/supabase.mock";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../../../../lib/supabase", () => ({
  supabase: supabaseMock,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useDashboard", () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe("fetchAllMetrics", () => {
    it("carga todas las métricas", async () => {
      // Raw appointment data that the repository processes into KPIs
      const rawKpiData = [
        { status: "completed", scheduled_date: "2025-01-15", created_at: "2025-01-10" },
        { status: "completed", scheduled_date: "2025-01-16", created_at: "2025-01-12" },
        { status: "pending", scheduled_date: "2025-01-20", created_at: "2025-01-14" },
        { status: "confirmed", scheduled_date: "2025-01-21", created_at: "2025-01-15" },
        { status: "cancelled", scheduled_date: "2025-01-22", created_at: "2025-01-16" },
      ];
      const depsData = [
        { dependency_id: 1, dependencies: { name: "Psicología", color: "#FF0000" }, status: "completed" },
      ];
      const monthlyData = [
        { status: "completed", scheduled_date: "2025-01-15" },
        { status: "pending", scheduled_date: "2025-01-20" },
      ];
      const profData = [
        { professional_id: "p1", professional: { full_name: "Dr. García" }, status: "completed", scheduled_date: "2025-01-15" },
      ];

      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: rawKpiData, error: null })),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: depsData, error: null })),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: monthlyData, error: null })),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: profData, error: null })),
        });

      const { useDashboard } = await import("../useDashboard");
      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.fetchAllMetrics();
      });

      // The hook processes raw data through DashboardRepository
      expect(result.current.kpis).toBeDefined();
      expect(result.current.kpis.total_appointments).toBe(5);
      expect(result.current.kpis.completed_appointments).toBe(2);
      expect(result.current.kpis.pending_count).toBe(1);
      expect(result.current.kpis.confirmed_count).toBe(1);
      expect(result.current.kpis.cancelled_count).toBe(1);
    });

    it("maneja errores individualmente sin romper todo", async () => {
      supabaseMock.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: null, error: { message: "fail" } })),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: [], error: null })),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: [], error: null })),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) => resolve({ data: [], error: null })),
        });

      const { useDashboard } = await import("../useDashboard");
      const { result } = renderHook(() => useDashboard());

      await act(async () => {
        await result.current.fetchAllMetrics();
      });

      expect(result.current.loading).toBe(false);
    });
  });
});
