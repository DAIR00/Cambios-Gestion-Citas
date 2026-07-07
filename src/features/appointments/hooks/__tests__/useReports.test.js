import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../../mocks/supabase.mock";
import { renderHook, act } from "@testing-library/react";
import { useReports } from "../useReports";

vi.mock("../../../../lib/supabase", () => ({
  supabase: supabaseMock,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useReports", () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe("generateReport", () => {
    it("retorna datos del reporte filtrados por dependencia", async () => {
      const mockData = [
        { id: "1", status: "completed", dependency_id: 1, dependencies: { name: "Psicología" } },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useReports());

      let reportResult;
      await act(async () => {
        reportResult = await result.current.generateReport({ dependencyId: 1 });
      });

      expect(reportResult).toEqual(mockData);
      expect(chain.eq).toHaveBeenCalledWith("dependency_id", 1);
    });

    it("retorna datos filtrados por profesional", async () => {
      const mockData = [{ id: "1", professional_id: "p1" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport({ professionalId: "p1" });
      });

      expect(chain.eq).toHaveBeenCalledWith("professional_id", "p1");
    });

    it("retorna datos filtrados por status", async () => {
      const mockData = [{ id: "1", status: "pending" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport({ status: "pending" });
      });

      expect(chain.eq).toHaveBeenCalledWith("status", "pending");
    });

    it("aplica filtro de rango de fechas", async () => {
      const mockData = [{ id: "1", scheduled_date: "2025-01-15" }];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport({ dateFrom: "2025-01-01", dateTo: "2025-01-31" });
      });

      expect(chain.gte).toHaveBeenCalledWith("scheduled_date", "2025-01-01");
      expect(chain.lte).toHaveBeenCalledWith("scheduled_date", "2025-01-31");
    });

    it("retorna array vacío cuando hay error", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: { message: "query failed" } })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useReports());

      let reportResult;
      await act(async () => {
        reportResult = await result.current.generateReport();
      });

      expect(reportResult).toEqual([]);
    });
  });

  describe("calculateSummary", () => {
    it("calcula resumen correctamente con datos completos", async () => {
      const mockData = [
        { id: "1", status: "completed", dependencies: { name: "Psicología" }, professional: { full_name: "Dr. García" } },
        { id: "2", status: "pending", dependencies: { name: "Psicología" }, professional: { full_name: "Dr. García" } },
        { id: "3", status: "completed", dependencies: { name: "Enfermería" }, professional: { full_name: "Enf. López" } },
      ];
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport();
      });

      expect(result.current.summary).not.toBeNull();
      expect(result.current.summary.total).toBe(3);
      expect(result.current.summary.completed).toBe(2);
      expect(result.current.summary.pending).toBe(1);
      expect(result.current.summary.completionRate).toBe(67);
    });
  });

  describe("exportToCSV", () => {
    it("genera y descarga un archivo CSV", async () => {
      const { result } = renderHook(() => useReports());

      const mockData = [
        {
          id: "1",
          scheduled_date: "2025-01-15",
          scheduled_time: "10:00",
          dependencies: { name: "Psicología" },
          aprendiz: { full_name: "Juan Pérez", document_number: "12345" },
          professional: { full_name: "Dr. García" },
          status: "completed",
          reason: "Consulta general",
          notes: "Sin notas",
          created_at: "2025-01-10",
        },
      ];

      // Mock URL.createObjectURL and document.createElement
      const mockClick = vi.fn();
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:http://localhost/fake");
      vi.stubGlobal("URL", { createObjectURL: mockCreateObjectURL });
      vi.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        click: mockClick,
      });

      act(() => {
        result.current.exportToCSV(mockData, "reporte");
      });

      expect(mockClick).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});
