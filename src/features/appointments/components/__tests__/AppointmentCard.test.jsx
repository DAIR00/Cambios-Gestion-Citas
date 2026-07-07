import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppointmentCard } from "../AppointmentCard";

describe("AppointmentCard", () => {
  const mockAppointment = {
    id: "apt-1",
    scheduled_date: "2025-03-15",
    scheduled_time: "10:00",
    status: "pending",
    reason: "Consulta general",
    dependencies: { name: "Psicología", color: "#FF0000" },
    profiles: { full_name: "Juan Pérez" },
  };

  it("renderiza el nombre de la dependencia", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText("Psicología")).toBeInTheDocument();
  });

  it("renderiza el estado pendiente", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("renderiza el estado confirmada", () => {
    const apt = { ...mockAppointment, status: "confirmed" };
    render(<AppointmentCard appointment={apt} />);
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
  });

  it("renderiza el estado completada", () => {
    const apt = { ...mockAppointment, status: "completed" };
    render(<AppointmentCard appointment={apt} />);
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("renderiza el estado cancelada", () => {
    const apt = { ...mockAppointment, status: "cancelled" };
    render(<AppointmentCard appointment={apt} />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("renderiza la hora", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("renderiza el motivo cuando existe", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText("Consulta general")).toBeInTheDocument();
  });

  it("no renderiza motivo cuando no existe", () => {
    const apt = { ...mockAppointment, reason: null };
    render(<AppointmentCard appointment={apt} />);
    expect(screen.queryByText("Consulta general")).not.toBeInTheDocument();
  });

  it("muestra nombre del profesional cuando no es aprendiz", () => {
    render(<AppointmentCard appointment={mockAppointment} isAprendiz={false} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("oculta nombre del profesional cuando es aprendiz", () => {
    render(<AppointmentCard appointment={mockAppointment} isAprendiz={true} />);
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
  });

  it("muestra botón de cancelar para aprendiz con cita pendiente", () => {
    render(<AppointmentCard appointment={mockAppointment} isAprendiz={true} onCancel={vi.fn()} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("no muestra botón de cancelar cuando no es pendiente", () => {
    const apt = { ...mockAppointment, status: "confirmed" };
    render(<AppointmentCard appointment={apt} isAprendiz={true} onCancel={vi.fn()} />);
    expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
  });

  it("llama onCancel al hacer click en cancelar", () => {
    const onCancel = vi.fn();
    render(<AppointmentCard appointment={mockAppointment} isAprendiz={true} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("no muestra botón de cancelar para profesional", () => {
    render(<AppointmentCard appointment={mockAppointment} isAprendiz={false} onCancel={vi.fn()} />);
    expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
  });
});
