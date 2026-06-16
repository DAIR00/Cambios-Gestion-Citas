import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "../validations/appointment.schema";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export function AppointmentForm({ onSuccess, createAppointment, isCreating }) {
  const [dependencies, setDependencies] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      scheduled_date: "",
      scheduled_time: "08:00",
      reason: "",
    },
  });

  // Cargar dependencias disponibles
  useEffect(() => {
    async function loadDependencies() {
      const { data } = await supabase.from("dependencies").select("*");
      setDependencies(data || []);
    }
    loadDependencies();
  }, []);

  const onSubmit = async (data) => {
    const result = await createAppointment(data);
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="appointment-form">
      <div className="field">
        <label>Dependencia</label>
        <select {...register("dependency_id", { valueAsNumber: true })}>
          <option value="">Selecciona...</option>
          {dependencies.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))}
        </select>
        {errors.dependency_id && (
          <span className="error">{errors.dependency_id.message}</span>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label>Fecha</label>
          <input type="date" {...register("scheduled_date")} />
          {errors.scheduled_date && (
            <span className="error">{errors.scheduled_date.message}</span>
          )}
        </div>

        <div className="field">
          <label>Hora</label>
          <select {...register("scheduled_time")}>
            {Array.from({ length: 9 }, (_, i) => {
              const hour = (8 + i).toString().padStart(2, "0");
              return (
                <option key={hour} value={`${hour}:00`}>
                  {hour}:00
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Motivo de consulta</label>
        <textarea
          {...register("reason")}
          rows="4"
          placeholder="Describe brevemente por qué necesitas la cita..."
        />
        {errors.reason && (
          <span className="error">{errors.reason.message}</span>
        )}
      </div>

      <button type="submit" disabled={isCreating} className="btn-primary">
        {isCreating ? "Agendando..." : "Solicitar Cita"}
      </button>
    </form>
  );
}
