import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renderiza un skeleton de texto por defecto", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("skeleton--text");
  });

  it("renderiza variant circle", () => {
    const { container } = render(<Skeleton variant="circle" />);
    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton--circle");
  });

  it("renderiza variant rect", () => {
    const { container } = render(<Skeleton variant="rect" />);
    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton--rect");
  });

  it("aplica width y height personalizados", () => {
    const { container } = render(<Skeleton width="200px" height="50px" />);
    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveStyle({ width: "200px", height: "50px" });
  });

  it("renderiza múltiples skeletons con count", () => {
    const { container } = render(<Skeleton count={3} />);
    const group = container.querySelector(".skeleton-group");
    expect(group).toBeInTheDocument();
    expect(group.children).toHaveLength(3);
  });

  it("renderiza un solo skeleton sin group cuando count=1", () => {
    const { container } = render(<Skeleton count={1} />);
    expect(container.querySelector(".skeleton-group")).not.toBeInTheDocument();
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("tiene aria-hidden para accesibilidad", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza skeletons con variant custom en count mode", () => {
    const { container } = render(<Skeleton variant="circle" count={2} />);
    const group = container.querySelector(".skeleton-group");
    expect(group.children[0]).toHaveClass("skeleton--circle");
    expect(group.children[1]).toHaveClass("skeleton--circle");
  });

  it("renderiza skeletons con count sin count extra", () => {
    const { container } = render(<Skeleton count={5} />);
    const group = container.querySelector(".skeleton-group");
    expect(group.children).toHaveLength(5);
  });
});
