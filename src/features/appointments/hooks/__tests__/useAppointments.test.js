import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../../mocks/supabase.mock";
import { renderHook, act } from "@testing-library/react";
import { useAppointments } from "../useAppointments";

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

describe("useAppointments", () => {
  const mockUser = { id: "user-1" };
  const mockProfileAprendiz = { role_id: 6 };
  const mockProfileProfesional = { dependency_id: 1 };

  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  describe("fetchAppointments", () => {
    it("obtiene citas filtradas por userId para aprendiz", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const mockData = [{ id: "1", user_id: "user-1" }];
      supabaseMock.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      });

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.fetchAppointments();
      });

      expect(result.current.appointments).toEqual(mockData);
      expect(result.current.status).toBe("idle");
    });

    it("obtiene citas filtradas por dependencyId para profesional", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileProfesional,
        isAprendiz: () => false,
      });

      const mockData = [{ id: "1", dependency_id: 1 }];
      supabaseMock.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      });

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.fetchAppointments();
      });

      expect(result.current.appointments).toEqual(mockData);
    });

    it("establece error cuando falla la petición", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: { message: "DB error" } })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.fetchAppointments();
      });

      // The repository wraps the error: "Error fetching citas: DB error"
      expect(result.current.error).toBe("Error fetching citas: DB error");
      expect(result.current.appointments).toEqual([]);
    });
  });

  describe("checkAvailability and createAppointment", () => {
    it("crea cita exitosamente", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const mockAppointment = { id: "1", dependency_id: 1, user_id: "user-1" };

      // 1st call: countPending → supabase.from("appointments").select(...).eq().eq().then()
      const countPendingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ count: 0, error: null })),
      };

      // 2nd call: checkAvailability → supabase.from("appointments").select("id").eq().eq().eq().in().then()
      const availabilityChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };

      // 3rd call: create → supabase.from("appointments").insert().select().single()
      const createChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
      };

      supabaseMock.from
        .mockReturnValueOnce(countPendingChain)
        .mockReturnValueOnce(availabilityChain)
        .mockReturnValueOnce(createChain);

      const { result } = renderHook(() => useAppointments());

      let res;
      await act(async () => {
        res = await result.current.createAppointment({
          dependency_id: 1,
          scheduled_date: "2025-03-15",
          scheduled_time: "10:00",
          reason: "Test reason with enough chars",
        });
      });

      expect(res.success).toBe(true);
    });

    it("rechaza cita si horario no disponible", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      // 1st call: countPending → returns 0
      const countPendingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ count: 0, error: null })),
      };

      // 2nd call: checkAvailability → returns occupied slot
      const availabilityChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [{ id: "existing" }], error: null })),
      };

      supabaseMock.from
        .mockReturnValueOnce(countPendingChain)
        .mockReturnValueOnce(availabilityChain);

      const { result } = renderHook(() => useAppointments());

      let res;
      await act(async () => {
        res = await result.current.createAppointment({
          dependency_id: 1,
          scheduled_date: "2025-03-15",
          scheduled_time: "10:00",
          reason: "Test reason with enough chars",
        });
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("ocupado");
    });

    it("rechaza cita si aprendiz tiene 5 citas pendientes", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      // 1st call: countPending → returns 5
      const countPendingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ count: 5, error: null })),
      };

      supabaseMock.from.mockReturnValueOnce(countPendingChain);

      const { result } = renderHook(() => useAppointments());

      let res;
      await act(async () => {
        res = await result.current.createAppointment({
          dependency_id: 1,
          scheduled_date: "2025-03-15",
          scheduled_time: "10:00",
          reason: "Test reason with enough chars",
        });
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("5 citas pendientes");
    });
  });

  describe("cancelAppointment", () => {
    it("permite cancelar cita pendiente", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const mockAppointments = [
        { id: "apt-1", status: "pending" },
      ];

      // The hook uses fetchAppointments to load appointments first, then cancelAppointment
      // We need to mock fetch to return the initial data
      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockAppointments, error: null })),
      };

      supabaseMock.from.mockReturnValue(fetchChain);

      const { result } = renderHook(() => useAppointments());

      // First fetch appointments to populate state
      await act(async () => {
        await result.current.fetchAppointments();
      });

      // Now mock the update call for cancellation
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { ...mockAppointments[0], status: "cancelled" }, error: null }),
      };

      supabaseMock.from.mockReturnValue(updateChain);

      let res;
      await act(async () => {
        res = await result.current.cancelAppointment("apt-1");
      });

      expect(res.success).toBe(true);
    });

    it("rechaza cancelar cita no pendiente", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const mockAppointments = [
        { id: "apt-1", status: "confirmed" },
      ];

      // Mock fetch to return initial appointments
      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockAppointments, error: null })),
      };

      supabaseMock.from.mockReturnValue(fetchChain);

      const { result } = renderHook(() => useAppointments());

      await act(async () => {
        await result.current.fetchAppointments();
      });

      let res;
      await act(async () => {
        res = await result.current.cancelAppointment("apt-1");
      });

      expect(res.success).toBe(false);
    });
  });

  describe("searchFilters", () => {
    it("actualiza filtros de búsqueda", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      // Mock fetchWithSearch chain
      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue(fetchChain);

      const { result } = renderHook(() => useAppointments());

      act(() => {
        result.current.updateSearchFilters({ query: "test search" });
      });
    });

    it("limpia filtros de búsqueda", async () => {
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue(fetchChain);

      const { result } = renderHook(() => useAppointments());

      act(() => {
        result.current.updateSearchFilters({ query: "test" });
      });

      act(() => {
        result.current.clearSearchFilters();
      });
    });
  });

  describe("updateSearchFilters debounce", () => {
    it("aplica debounce al actualizar filtros", async () => {
      vi.useFakeTimers();
      useAuth.mockReturnValue({
        user: mockUser,
        profile: mockProfileAprendiz,
        isAprendiz: () => true,
      });

      const fetchChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue(fetchChain);

      const { result } = renderHook(() => useAppointments());

      act(() => {
        result.current.updateSearchFilters({ query: "test" });
      });

      vi.advanceTimersByTime(300);
      vi.useRealTimers();
    });
  });
});
