import { z } from "zod";
import { isWeekend, isPast, addDays, startOfDay } from "date-fns";

// Esquema de validación robusto
export const appointmentSchema = z.object({
  dependency_id: z.number().int().positive("Selecciona una dependencia"),

  scheduled_date: z
    .string()
    .refine((date) => !isWeekend(new Date(date)), {
      message: "No se agendan citas los fines de semana",
    })
    .refine((date) => !isPast(startOfDay(new Date(date))), {
      message: "No puedes agendar en fechas pasadas",
    })
    .refine(
      (date) => {
        const minDate = addDays(new Date(), 1); // Mínimo mañana
        return new Date(date) >= startOfDay(minDate);
      },
      {
        message: "Debes agendar con mínimo 24 horas de anticipación",
      },
    ),

  scheduled_time: z
    .string()
    .regex(/^([0-9]{2}):([0-9]{2})$/, "Formato de hora inválido")
    .refine(
      (time) => {
        const [hours] = time.split(":").map(Number);
        return hours >= 8 && hours < 17; // 8 AM a 5 PM
      },
      {
        message: "Horario debe ser entre 8:00 AM y 5:00 PM",
      },
    ),

  reason: z
    .string()
    .min(10, "Describe tu situación en al menos 10 caracteres")
    .max(500, "Máximo 500 caracteres"),

  notes: z.string().max(1000).optional(),
});
