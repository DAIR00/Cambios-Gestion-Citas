import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KPICard } from "../KPICard";

describe("KPICard", () => {
  it("renderiza el título", () => {
    render(<KPICard title="Total Citas" value={10} />);
    expect(screen.getByText("Total Citas")).toBeInTheDocument();
  });

  it("renderiza el valor numérico", () => {
    render(<KPICard title="Citas" value={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renderiza el valor de texto", () => {
    render(<KPICard title="Estado" value="Activo" />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("renderiza el subtítulo cuando se provee", () => {
    render(<KPICard title="Citas" value={10} subtitle="este mes" />);
    expect(screen.getByText("este mes")).toBeInTheDocument();
  });

  it("no renderiza subtítulo cuando no se provee", () => {
    const { container } = render(<KPICard title="Citas" value={10} />);
    expect(container.querySelector(".kpi-subtitle")).not.toBeInTheDocument();
  });

  it("renderiza trend positivo con flecha arriba", () => {
    render(<KPICard title="Citas" value={10} trend={15} />);
    expect(screen.getByText(/15%/)).toBeInTheDocument();
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it("renderiza trend negativo con flecha abajo", () => {
    render(<KPICard title="Citas" value={10} trend={-10} />);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it("no renderiza trend cuando no se provee", () => {
    const { container } = render(<KPICard title="Citas" value={10} />);
    expect(container.querySelector(".kpi-trend")).not.toBeInTheDocument();
  });

  it("aplica clase positive para trend positivo", () => {
    const { container } = render(<KPICard title="Citas" value={10} trend={5} />);
    expect(container.querySelector(".kpi-trend")).toHaveClass("positive");
  });

  it("aplica clase negative para trend negativo", () => {
    const { container } = render(<KPICard title="Citas" value={10} trend={-5} />);
    expect(container.querySelector(".kpi-trend")).toHaveClass("negative");
  });
});
