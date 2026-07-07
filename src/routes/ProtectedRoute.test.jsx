import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

vi.mock("../providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../providers/AuthProvider";

function renderWithAuth(ui, authValue, { route = "/" } = {}) {
  useAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("muestra 'Cargando sesión...' cuando loading=true", () => {
    renderWithAuth(
      <ProtectedRoute>Content</ProtectedRoute>,
      { user: null, profile: null, loading: true, profileLoaded: false, hasRole: vi.fn() }
    );
    expect(screen.getByText("Cargando sesión...")).toBeInTheDocument();
  });

  it("muestra 'Cargando perfil...' cuando loading=false y profileLoaded=false", () => {
    renderWithAuth(
      <ProtectedRoute>Content</ProtectedRoute>,
      { user: { id: "1" }, profile: null, loading: false, profileLoaded: false, hasRole: vi.fn() }
    );
    expect(screen.getByText("Cargando perfil...")).toBeInTheDocument();
  });

  it("redirige a /login cuando no hay usuario", () => {
    renderWithAuth(
      <ProtectedRoute>Content</ProtectedRoute>,
      { user: null, profile: null, loading: false, profileLoaded: true, hasRole: vi.fn() }
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("redirige a /login cuando user existe pero profile es null", () => {
    renderWithAuth(
      <ProtectedRoute>Content</ProtectedRoute>,
      { user: { id: "1" }, profile: null, loading: false, profileLoaded: true, hasRole: vi.fn() }
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("redirige a /unauthorized cuando no tiene el rol requerido", () => {
    const hasRole = vi.fn().mockReturnValue(false);
    renderWithAuth(
      <ProtectedRoute requiredRoles="SUPERADMIN">Content</ProtectedRoute>,
      { user: { id: "1" }, profile: { roles: { name: "APRENDIZ" } }, loading: false, profileLoaded: true, hasRole }
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renderiza children cuando el usuario tiene el rol correcto", () => {
    const hasRole = vi.fn().mockReturnValue(true);
    renderWithAuth(
      <ProtectedRoute requiredRoles="SUPERADMIN">Protected Content</ProtectedRoute>,
      { user: { id: "1" }, profile: { roles: { name: "SUPERADMIN" } }, loading: false, profileLoaded: true, hasRole }
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renderiza children cuando no se requiere rol", () => {
    renderWithAuth(
      <ProtectedRoute>Any Content</ProtectedRoute>,
      { user: { id: "1" }, profile: { roles: { name: "APRENDIZ" } }, loading: false, profileLoaded: true, hasRole: vi.fn() }
    );
    expect(screen.getByText("Any Content")).toBeInTheDocument();
  });

  it("usa fallback personalizado", () => {
    renderWithAuth(
      <ProtectedRoute fallback="/custom-login">Content</ProtectedRoute>,
      { user: null, profile: null, loading: false, profileLoaded: true, hasRole: vi.fn() },
      { route: "/dashboard" }
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });
});
