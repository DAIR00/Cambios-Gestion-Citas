import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserAvatar from "../UserAvatar";

describe("UserAvatar", () => {
  it("renderiza iniciales del nombre completo", () => {
    render(<UserAvatar name="Juan Pérez" />);
    expect(screen.getByText("JP")).toBeInTheDocument();
  });

  it("renderiza iniciales de un solo nombre", () => {
    render(<UserAvatar name="Juan" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("muestra interrogación cuando no hay nombre", () => {
    render(<UserAvatar name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("muestra interrogación cuando name es null", () => {
    render(<UserAvatar name={null} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("muestra interrogación cuando name es undefined", () => {
    render(<UserAvatar name={undefined} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("usa el nombre como title del botón", () => {
    render(<UserAvatar name="Juan Pérez" />);
    expect(screen.getByRole("button")).toHaveAttribute("title", "Juan Pérez");
  });

  it("llama onClick cuando se hace click", () => {
    const onClick = vi.fn();
    render(<UserAvatar name="Juan" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("aplica clase de tamaño md por defecto", () => {
    const { container } = render(<UserAvatar name="Juan" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("avatar-md");
  });

  it("aplica clase de tamaño sm", () => {
    const { container } = render(<UserAvatar name="Juan" size="sm" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("avatar-sm");
  });

  it("aplica clase de tamaño lg", () => {
    const { container } = render(<UserAvatar name="Juan" size="lg" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("avatar-lg");
  });

  it("aplica className personalizado", () => {
    const { container } = render(<UserAvatar name="Juan" className="custom" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom");
  });

  it("maneja nombres con espacios extra", () => {
    render(<UserAvatar name="  Juan   Pérez  " />);
    expect(screen.getByText("JP")).toBeInTheDocument();
  });
});
