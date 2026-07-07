import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renderiza un título", () => {
    render(<EmptyState title="Sin datos" />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  it("renderiza una descripción", () => {
    render(<EmptyState title="Vacío" description="No hay resultados" />);
    expect(screen.getByText("No hay resultados")).toBeInTheDocument();
  });

  it("renderiza con action", () => {
    render(
      <EmptyState
        title="Sin datos"
        action={<button>Crear nuevo</button>}
      />
    );
    expect(screen.getByText("Crear nuevo")).toBeInTheDocument();
  });

  it("renderiza con variant compact", () => {
    const { container } = render(<EmptyState title="Compacto" compact />);
    const el = container.querySelector(".empty-state--compact");
    expect(el).toBeInTheDocument();
  });

  it("renderiza sin compact por defecto", () => {
    const { container } = render(<EmptyState title="Normal" />);
    const el = container.querySelector(".empty-state--compact");
    expect(el).not.toBeInTheDocument();
  });

  it("no renderiza description cuando no se provee", () => {
    const { container } = render(<EmptyState title="Sin desc" />);
    expect(container.querySelector(".empty-state__description")).not.toBeInTheDocument();
  });

  it("no renderiza action cuando no se provee", () => {
    const { container } = render(<EmptyState title="Sin action" />);
    expect(container.querySelector(".empty-state__action")).not.toBeInTheDocument();
  });

  it("tiene role=status para accesibilidad", () => {
    render(<EmptyState title="Loading" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza icono con size correcto en modo normal", () => {
    const Icon = ({ size }) => <span data-testid="icon">{size}</span>;
    render(<EmptyState title="Con icono" icon={Icon} />);
    expect(screen.getByTestId("icon")).toHaveTextContent("48");
  });

  it("renderiza icono con size 32 en modo compact", () => {
    const Icon = ({ size }) => <span data-testid="icon">{size}</span>;
    render(<EmptyState title="Compact icon" icon={Icon} compact />);
    expect(screen.getByTestId("icon")).toHaveTextContent("32");
  });
});
