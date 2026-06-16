import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function ProtectedRoute({
  children,
  requiredRoles = null,
  fallback = "/login",
}) {
  const { user, profile, loading, profileLoaded, hasRole } = useAuth();
  const location = useLocation();

  if (loading && !profileLoaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!profileLoaded && !loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (!profile) {
    return <Navigate to={fallback} replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
