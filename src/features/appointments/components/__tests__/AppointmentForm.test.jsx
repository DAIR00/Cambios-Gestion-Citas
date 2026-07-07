import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AppointmentForm } from "../AppointmentForm";

// Use vi.hoisted to define the mock in the hoisted scope
const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn(),
    auth: { signInWithPassword: vi.fn() },
  },
}));

vi.mock("../../../../lib/supabase", () => ({
  supabase: supabaseMock,
}));

describe("AppointmentForm", () => {
  const mockCreateAppointment = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAppointment.mockResolvedValue({ success: true });

    // Mock dependencies fetch
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) =>
        resolve({
          data: [
            { id: 1, name: "Psicología" },
            { id: 2, name: "Enfermería" },
          ],
          error: null,
        })
      ),
    });
  });

  it("renderiza el formulario con campos", async () => {
    render(
      <AppointmentForm
        createAppointment={mockCreateAppointment}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Motivo de consulta")).toBeInTheDocument();
    expect(screen.getByText("Solicitar Cita")).toBeInTheDocument();
  });

  it("renderiza opciones de dependencia desde la base de datos", async () => {
    render(
      <AppointmentForm
        createAppointment={mockCreateAppointment}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Psicología")).toBeInTheDocument();
      expect(screen.getByText("Enfermería")).toBeInTheDocument();
    });
  });

  it("muestra 'Agendando...' cuando isCreating es true", () => {
    render(
      <AppointmentForm
        createAppointment={mockCreateAppointment}
        onSuccess={mockOnSuccess}
        isCreating={true}
      />
    );

    expect(screen.getByText("Agendando...")).toBeInTheDocument();
    expect(screen.getByText("Agendando...")).toBeDisabled();
  });

  it("muestra 'Solicitar Cita' cuando isCreating es false", () => {
    render(
      <AppointmentForm
        createAppointment={mockCreateAppointment}
        onSuccess={mockOnSuccess}
        isCreating={false}
      />
    );

    expect(screen.getByText("Solicitar Cita")).toBeInTheDocument();
    expect(screen.getByText("Solicitar Cita")).not.toBeDisabled();
  });

  it("renderiza el selector de hora con opciones de 8:00 a 16:00", async () => {
    render(
      <AppointmentForm
        createAppointment={mockCreateAppointment}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      // The option text is split across elements, so check by role
      expect(screen.getAllByRole("option").length).toBeGreaterThanOrEqual(9);
    });
  });

  it("renderiza el campo de fecha", () => {
    render(
      <AppointmentForm
        createAppointment={mockCreateAppointment}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Fecha")).toBeInTheDocument();
  });
});
