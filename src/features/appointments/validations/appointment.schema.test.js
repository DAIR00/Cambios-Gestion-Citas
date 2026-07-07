import { describe, it, expect, vi, beforeEach } from "vitest";
import { addDays, format, subDays } from "date-fns";
import { appointmentSchema } from "./appointment.schema";

function futureWeekday(daysAhead = 2) {
  let date = addDays(new Date(), daysAhead);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date = addDays(date, 1);
  }
  return format(date, "yyyy-MM-dd");
}

const validData = () => ({
  dependency_id: 1,
  scheduled_date: futureWeekday(3),
  scheduled_time: "10:00",
  reason: "Necesito una consulta psicológica urgente",
});

describe("appointmentSchema", () => {
  describe("dependency_id", () => {
    it("acepta un número entero positivo", () => {
      const result = appointmentSchema.safeParse({ ...validData(), dependency_id: 1 });
      expect(result.success).toBe(true);
    });

    it("rechaza 0", () => {
      const result = appointmentSchema.safeParse({ ...validData(), dependency_id: 0 });
      expect(result.success).toBe(false);
    });

    it("rechaza valores negativos", () => {
      const result = appointmentSchema.safeParse({ ...validData(), dependency_id: -1 });
      expect(result.success).toBe(false);
    });

    it("rechaza strings", () => {
      const result = appointmentSchema.safeParse({ ...validData(), dependency_id: "abc" });
      expect(result.success).toBe(false);
    });

    it("rechaza números decimales", () => {
      const result = appointmentSchema.safeParse({ ...validData(), dependency_id: 1.5 });
      expect(result.success).toBe(false);
    });
  });

  describe("scheduled_date", () => {
    it("acepta un día laborable futuro con más de 24h", () => {
      const result = appointmentSchema.safeParse(validData());
      expect(result.success).toBe(true);
    });

    it("rechaza fechas pasadas", () => {
      const pastDate = format(subDays(new Date(), 2), "yyyy-MM-dd");
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_date: pastDate });
      expect(result.success).toBe(false);
    });

    it("rechaza fecha con menos de 24 horas de anticipación (hoy)", () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_date: today });
      expect(result.success).toBe(false);
    });

    it("rechaza formato de fecha inválido", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_date: "invalid-date" });
      expect(result.success).toBe(false);
    });
  });

  describe("scheduled_time", () => {
    it("acepta hora válida en rango (08:00 - 16:59)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "14:30" });
      expect(result.success).toBe(true);
    });

    it("acepta hora mínima (08:00)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "08:00" });
      expect(result.success).toBe(true);
    });

    it("acepta hora máxima antes de cierre (16:59)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "16:59" });
      expect(result.success).toBe(true);
    });

    it("rechaza hora antes de las 8 AM (07:59)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "07:59" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("8:00"))).toBe(true);
      }
    });

    it("rechaza hora a las 5 PM (17:00)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "17:00" });
      expect(result.success).toBe(false);
    });

    it("rechaza formato inválido (sin dos puntos)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "1000" });
      expect(result.success).toBe(false);
    });

    it("rechaza formato con letras", () => {
      const result = appointmentSchema.safeParse({ ...validData(), scheduled_time: "ab:cd" });
      expect(result.success).toBe(false);
    });
  });

  describe("reason", () => {
    it("acepta razón con 10-500 caracteres", () => {
      const result = appointmentSchema.safeParse({ ...validData(), reason: "a".repeat(10) });
      expect(result.success).toBe(true);
    });

    it("acepta razón con exactamente 500 caracteres", () => {
      const result = appointmentSchema.safeParse({ ...validData(), reason: "a".repeat(500) });
      expect(result.success).toBe(true);
    });

    it("rechaza razón con menos de 10 caracteres", () => {
      const result = appointmentSchema.safeParse({ ...validData(), reason: "corto" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("10 caracteres"))).toBe(true);
      }
    });

    it("rechaza razón vacía", () => {
      const result = appointmentSchema.safeParse({ ...validData(), reason: "" });
      expect(result.success).toBe(false);
    });

    it("rechaza razón con más de 500 caracteres", () => {
      const result = appointmentSchema.safeParse({ ...validData(), reason: "a".repeat(501) });
      expect(result.success).toBe(false);
    });
  });

  describe("notes (opcional)", () => {
    it("acepta sin notes", () => {
      const data = validData();
      delete data.notes;
      const result = appointmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("acepta notes con hasta 1000 caracteres", () => {
      const result = appointmentSchema.safeParse({ ...validData(), notes: "a".repeat(1000) });
      expect(result.success).toBe(true);
    });

    it("rechaza notes con más de 1000 caracteres", () => {
      const result = appointmentSchema.safeParse({ ...validData(), notes: "a".repeat(1001) });
      expect(result.success).toBe(false);
    });
  });

  describe("validación completa del formulario", () => {
    it("objeto válido completo pasa validación", () => {
      const result = appointmentSchema.safeParse(validData());
      expect(result.success).toBe(true);
    });

    it("objeto con todos los campos faltantes falla", () => {
      const result = appointmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("campos extra son ignorados (strip)", () => {
      const result = appointmentSchema.safeParse({ ...validData(), extra: "ignored" });
      expect(result.success).toBe(true);
    });
  });
});