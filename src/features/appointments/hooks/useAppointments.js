import { useState, useCallback } from "react";
import { AppointmentRepository } from "../api/appointments.repository";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";

// ESTADOS DE CARGA ESPECÍFICOS (mejor UX que un genérico "loading")
const STATUS = {
  IDLE: "idle",
  CREATING: "creating",
  FETCHING: "fetching",
  UPDATING: "updating",
  ERROR: "error",
};

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const { user, profile, isAprendiz } = useAuth();

  // FETCH: Obtener citas según el rol automáticamente
  const fetchAppointments = useCallback(
    async (filters = {}) => {
      setStatus(STATUS.FETCHING);
      setError(null);

      try {
        const roleFilters = isAprendiz()
          ? { userId: user.id }
          : { dependencyId: profile.dependency_id };

        const data = await AppointmentRepository.fetch({
          ...roleFilters,
          ...filters,
        });
        setAppointments(data);
        return data;
      } catch (err) {
        setError(err.message);
        toast.error("Error cargando citas");
        return [];
      } finally {
        setStatus(STATUS.IDLE);
      }
    },
    [user, profile, isAprendiz],
  );

  // FETCH SILENCIOSO: Para cambios de filtro sin mostrar loading full-screen
  const fetchAppointmentsSilent = useCallback(
    async (filters = {}) => {
      setError(null);

      try {
        const roleFilters = isAprendiz()
          ? { userId: user.id }
          : { dependencyId: profile.dependency_id };

        const data = await AppointmentRepository.fetch({
          ...roleFilters,
          ...filters,
        });
        setAppointments(data);
        return data;
      } catch (err) {
        setError(err.message);
        toast.error("Error cargando citas");
        return [];
      }
    },
    [user, profile, isAprendiz],
  );

  // FETCH POR PROFESIONAL: Citas de la dependencia del profesional
  const fetchMyAppointments = async (filters = {}) => {
    if (!profile?.dependency_id) return [];
    setError(null);

    try {
      const data = await AppointmentRepository.fetch({
        dependencyId: profile.dependency_id,
        ...filters,
      });
      setAppointments(data);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error("Error cargando citas");
      return [];
    }
  };

  // FETCH HISTORIAL APRENDIZ: Citas previas de un aprendiz en una dependencia
  const fetchApprenticeHistory = useCallback(async (userId, dependencyId) => {
    try {
      const data = await AppointmentRepository.fetchApprenticeHistory(userId, dependencyId);
      return data;
    } catch (err) {
      toast.error("Error cargando historial");
      return [];
    }
  }, []);

  // CREATE: Crear cita con validaciones de negocio
  const createAppointment = async (formData) => {
    setStatus(STATUS.CREATING);

    try {
      if (isAprendiz()) {
        const pendingCount = await AppointmentRepository.countPending(user.id);
        if (pendingCount >= 5) {
          throw new Error(
            "Ya tienes 5 citas pendientes. Espera a que se atienda alguna.",
          );
        }
      }

      const isAvailable = await AppointmentRepository.checkAvailability(
        formData.dependency_id,
        formData.scheduled_date,
        formData.scheduled_time,
      );

      if (!isAvailable) {
        throw new Error("Este horario ya está ocupado. Selecciona otro.");
      }

      const newAppointment = await AppointmentRepository.create({
        ...formData,
        user_id: user.id,
        status: "pending",
      });

      setAppointments((prev) => [...prev, newAppointment]);
      toast.success("Cita agendada correctamente");
      return { success: true, data: newAppointment };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // UPDATE: Actualizar cita completa (estado + campos específicos)
  const updateAppointment = async (appointmentId, updates) => {
    setStatus(STATUS.UPDATING);

    try {
      const updated = await AppointmentRepository.update(appointmentId, updates);

      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success("Cita actualizada");
      return { success: true, data: updated };
    } catch (err) {
      toast.error("Error actualizando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // UPDATE STATUS: Cambiar estado (confirmar, completar, cancelar)
  const updateStatus = async (appointmentId, newStatus, notes = null) => {
    setStatus(STATUS.UPDATING);

    try {
      const updates = { status: newStatus };
      if (notes) updates.notes = notes;
      if ((newStatus === "confirmed" || newStatus === "completed") && !isAprendiz()) {
        updates.professional_id = user.id;
      }

      const updated = await AppointmentRepository.update(
        appointmentId,
        updates,
      );

      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success(
        `Cita ${newStatus === "confirmed" ? "confirmada" : "actualizada"}`,
      );
      return { success: true };
    } catch (err) {
      toast.error("Error actualizando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  };

  // CANCEL: Cancelar cita (solo si está pending)
  const cancelAppointment = async (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (appointment.status !== "pending") {
      toast.error("Solo puedes cancelar citas pendientes");
      return { success: false };
    }

    return updateStatus(appointmentId, "cancelled");
  };

  return {
    appointments,
    status,
    error,
    isLoading: status === STATUS.FETCHING,
    isCreating: status === STATUS.CREATING,
    fetchAppointments,
    fetchAppointmentsSilent,
    fetchMyAppointments,
    fetchApprenticeHistory,
    createAppointment,
    updateAppointment,
    updateStatus,
    cancelAppointment,
  };
}
