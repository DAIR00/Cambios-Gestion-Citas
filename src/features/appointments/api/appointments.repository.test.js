import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabaseMock, resetMocks } from "../../../mocks/supabase.mock";
import { AppointmentRepository } from "./appointments.repository";

describe("AppointmentRepository", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("create", () => {
    it("inserta una cita con los datos correctos", async () => {
      const mockData = { id: "1", dependency_id: 1, scheduled_date: "2025-01-15" };
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      supabaseMock.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: mockSelect.mockReturnValue({ single: mockSingle }),
        }),
      });

      const result = await AppointmentRepository.create({ dependency_id: 1, scheduled_date: "2025-01-15" });
      expect(result).toEqual(mockData);
      expect(supabaseMock.from).toHaveBeenCalledWith("appointments");
    });

    it("lanza error cuando Supabase retorna error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "insert failed" } });
      supabaseMock.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: mockSingle }),
        }),
      });

      await expect(AppointmentRepository.create({})).rejects.toThrow("Error creando cita");
    });
  });

  describe("fetch", () => {
    it("retorna citas sin filtros", async () => {
      const mockData = [{ id: "1" }, { id: "2" }];
      const buildChain = () => {
        const chain = {
          eq: vi.fn().mockImplementation(() => chain),
          ilike: vi.fn().mockImplementation(() => chain),
          or: vi.fn().mockImplementation(() => chain),
          gte: vi.fn().mockImplementation(() => chain),
          lte: vi.fn().mockImplementation(() => chain),
          order: vi.fn().mockImplementation(() => chain),
          then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
        };
        return chain;
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(buildChain()) });

      const result = await AppointmentRepository.fetch({});
      expect(result).toEqual(mockData);
    });

    it("aplica filtro por userId", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.fetch({ userId: "user-1" });
      expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("aplica filtro por dependencyId", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.fetch({ dependencyId: 2 });
      expect(chain.eq).toHaveBeenCalledWith("dependency_id", 2);
    });

    it("aplica filtro por status", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.fetch({ status: "pending" });
      expect(chain.eq).toHaveBeenCalledWith("status", "pending");
    });

    it("aplica filtro de búsqueda", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.fetch({ search: "Juan" });
      expect(chain.or).toHaveBeenCalledWith(expect.stringContaining("Juan"));
    });

    it("lanza error cuando Supabase falla", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: { message: "query failed" } })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await expect(AppointmentRepository.fetch({})).rejects.toThrow("Error fetching citas");
    });
  });

  describe("update", () => {
    it("actualiza una cita correctamente", async () => {
      const mockData = { id: "1", status: "confirmed" };
      const chain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AppointmentRepository.update("1", { status: "confirmed" });
      expect(result).toEqual(mockData);
      expect(chain.update).toHaveBeenCalled();
    });

    it("lanza error cuando falla", async () => {
      const chain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "update failed" } }),
      };
      supabaseMock.from.mockReturnValue(chain);

      await expect(AppointmentRepository.update("1", {})).rejects.toThrow("Error actualizando cita");
    });
  });

  describe("checkAvailability", () => {
    it("retorna true cuando no hay conflicto", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      const result = await AppointmentRepository.checkAvailability(1, "2025-01-15", "10:00");
      expect(result).toBe(true);
    });

    it("retorna false cuando hay conflicto", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [{ id: "existing" }], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      const result = await AppointmentRepository.checkAvailability(1, "2025-01-15", "10:00");
      expect(result).toBe(false);
    });

    it("excluye un ID específico con excludeId", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.checkAvailability(1, "2025-01-15", "10:00", "exclude-id");
      expect(chain.neq).toHaveBeenCalledWith("id", "exclude-id");
    });

    it("no llama neq cuando no se provee excludeId", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.checkAvailability(1, "2025-01-15", "10:00");
      expect(chain.neq).not.toHaveBeenCalled();
    });
  });

  describe("countPending", () => {
    it("retorna el conteo de citas pendientes", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ count: 2, error: null })),
      };
      supabaseMock.from.mockReturnValue(chain);

      const result = await AppointmentRepository.countPending("user-1");
      expect(result).toBe(2);
    });

    it("lanza error cuando falla", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ count: null, error: { message: "count failed" } })),
      };
      supabaseMock.from.mockReturnValue(chain);

      await expect(AppointmentRepository.countPending("user-1")).rejects.toThrow();
    });
  });

  describe("fetchApprenticeHistory", () => {
    it("retorna historial ordenado por fecha descendente", async () => {
      const mockData = [{ id: "2" }, { id: "1" }];
      const chain = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      const result = await AppointmentRepository.fetchApprenticeHistory("user-1");
      expect(result).toEqual(mockData);
    });

    it("filtra por dependencyId cuando se provee", async () => {
      const chain = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      };
      supabaseMock.from.mockReturnValue({ select: vi.fn().mockReturnValue(chain) });

      await AppointmentRepository.fetchApprenticeHistory("user-1", 1);
      expect(chain.eq).toHaveBeenCalledWith("dependency_id", 1);
    });
  });
});
