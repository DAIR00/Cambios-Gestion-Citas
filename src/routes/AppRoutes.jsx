import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../providers/AuthProvider";
import { Navigate } from "react-router-dom";

// Lazy loading para code splitting (mejor performance)
import { lazy, Suspense } from "react";

// Públicas
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const Unauthorized = lazy(() => import("../shared/components/Unauthorized"));

// Privadas - Aprendiz
const AprendizDashboard = lazy(
  () => import("../features/appointments/pages/AprendizDashboard"),
);

// Privadas - Profesionales (por dependencia)
const PsychologyDashboard = lazy(
  () => import("../features/appointments/pages/PsychologyDashboard"),
);
const NursingDashboard = lazy(
  () => import("../features/appointments/pages/NursingDashboard"),
);
const SocialWorkDashboard = lazy(
  () => import("../features/appointments/pages/SocialWorkDashboard"),
);

// Privadas - Coordinación
const CoordinationDashboard = lazy(
  () => import("../features/dashboard/pages/CoordinationDashboard"),
);

// Privadas - Admin
const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard"),
);

function HomeRedirect() {
  const {
    user, profile, loading, profileLoaded,
    isAdmin, isCoordination, isPsicologia, isEnfermeria, isTrabajoSocial,
  } = useAuth();

  if (loading && !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (loading && user && !profileLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin()) return <Navigate to="/admin" replace />;
  if (isCoordination()) return <Navigate to="/coordination" replace />;
  if (isPsicologia()) return <Navigate to="/psychology" replace />;
  if (isEnfermeria()) return <Navigate to="/nursing" replace />;
  if (isTrabajoSocial()) return <Navigate to="/social-work" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* RUTAS PROTEGIDAS - APRENDIZ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles="APRENDIZ">
              <AprendizDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - PSICOLOGÍA */}
        <Route
          path="/psychology"
          element={
            <ProtectedRoute requiredRoles="PSICOLOGIA">
              <PsychologyDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - ENFERMERÍA */}
        <Route
          path="/nursing"
          element={
            <ProtectedRoute requiredRoles="ENFERMERIA">
              <NursingDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - TRABAJO SOCIAL */}
        <Route
          path="/social-work"
          element={
            <ProtectedRoute requiredRoles="TRABAJO_SOCIAL">
              <SocialWorkDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - COORDINACIÓN */}
        <Route
          path="/coordination"
          element={
            <ProtectedRoute requiredRoles={["COORDINACION", "SUPERADMIN"]}>
              <CoordinationDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles="SUPERADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* REDIRECCIÓN INICIAL */}
        <Route path="/" element={<HomeRedirect />} />

        {/* 404 */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </Suspense>
  );
}
