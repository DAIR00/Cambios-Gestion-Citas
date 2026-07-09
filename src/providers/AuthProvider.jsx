import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

// 1 Creamos el contenedor (context)
const AuthContext = createContext(null);

// 2. Hook personalizado para usar el contexto facilmente
//esto evita importar useContext y AuthContext en cada archivo
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

//3 El provider que envuelve la aplicacion
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Guard para evitar fetchProfile concurrentes
  const fetchingRef = useRef(false);

  //funcion auxiliar: obterner el perfil + el rol desde nuestra base de datos
  const fetchProfile = async (userId, authUser) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const meta = authUser?.user_metadata || {};

      let { data, error } = await supabase
        .from("profiles")
        .select(
          `
            *,
            roles (name, permissions),
            dependencies(name)
            `,
        )
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            full_name: meta.full_name || "",
            document_number: meta.document_number || "",
            role_id: meta.role_id || 6,
            dependency_id: meta.dependency_id || null,
          }, { onConflict: "id" })
          .select(`*, roles (name, permissions), dependencies(name)`)
          .single();

        if (insertError) throw insertError;
        data = newProfile;
      } else if (error) {
        throw error;
      }

      if (data && meta.role_id && data.role_id !== meta.role_id) {
        const { data: updated } = await supabase
          .from("profiles")
          .update({ role_id: meta.role_id, dependency_id: meta.dependency_id || data.dependency_id })
          .eq("id", userId)
          .select(`*, roles (name, permissions), dependencies(name)`)
          .single();
        if (updated) data = updated;
      }

      setProfile(data);
    } catch (err) {
      console.error("Error cargando perfil:", err?.msg || err?.message || JSON.stringify(err));
      setError("No se pudo cargar el perfil de usuario");
      // NO llamar signOut en error de red - solo en errores de auth
      // Esto evita el loop infinito: fetchProfile falla -> signOut -> SIGNED_IN -> fetchProfile falla...
    } finally {
      setProfileLoaded(true);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION") {
          if (session?.user) {
            setProfileLoaded(false);
            setUser(session.user);
            // await en INITIAL_SESSION esta bien porque es el primer carga
            fetchProfile(session.user.id, session.user);
          } else {
            setUser(null);
            setProfile(null);
            setProfileLoaded(true);
          }
          setInitialLoading(false);
        } else if (event === "SIGNED_IN") {
          if (session?.user) {
            setProfileLoaded(false);
            setUser(session.user);
            // NO await - fire & forget.
            // Si fetchProfile se cuelga, no bloquea la cola de eventos de Supabase.
            // El visibilitychange listener lo relanzara si es necesario.
            fetchProfile(session.user.id, session.user);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setProfileLoaded(true);
          fetchingRef.current = false;
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // FIX: Cuando el usuario vuelve a la pestaña y profileLoaded sigue en false
  // (fetchProfile se quedo colgado), resetear el guard y re-lanzar.
  const profileLoadedRef = useRef(false);
  const userRef = useRef(null);
  useEffect(() => { profileLoadedRef.current = profileLoaded; }, [profileLoaded]);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        !profileLoadedRef.current &&
        userRef.current
      ) {
        console.log("[Auth] Tab visible, reset guard + re-lanzando fetchProfile...");
        fetchingRef.current = false; // resetear el guard
        fetchProfile(userRef.current.id, userRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  //Método de autenticacion (clean code: funciones puras y descriptivas)
  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const msg = err?.message || "Error al iniciar sesión";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            document_number: userData.document_number,
            role_id: userData.role_id,
            dependency_id: userData.dependency_id,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const msg = err?.message || "Error al registrar usuario";
      setError(msg);
      return { success: false, error: msg };
    }
  };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      setError(err?.message || "Error al cerrar sesión");
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      const msg = err?.message || "Error al enviar el correo de recuperación";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      const msg = err?.message || "Error al actualizar la contraseña";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  //SISTEMA RBAC: helper functions para verificar permisos
  const normalizeRole = (str) => str?.toUpperCase().replace(/\s+/g, "_").trim();
  const hasRole = (requiredRoles) => {
    if (!profile?.roles?.name) return false;
    const userRole = normalizeRole(profile.roles.name);
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.some((r) => normalizeRole(r) === userRole);
    }
    return normalizeRole(requiredRoles) === userRole;
  };

  const isAdmin = () => hasRole("SUPERADMIN");
  const isCoordination = () => hasRole(["COORDINACION", "SUPERADMIN"]);
  const isProfessional = () =>
    hasRole(["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]);
  const isAprendiz = () => hasRole("APRENDIZ");
  const isPsicologia = () => hasRole("PSICOLOGIA");
  const isEnfermeria = () => hasRole("ENFERMERIA");
  const isTrabajoSocial = () => hasRole("TRABAJO_SOCIAL");

  const value = {
    user,
    profile,
    loading: initialLoading,
    profileLoaded,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    isAdmin,
    isCoordination,
    isProfessional,
    isAprendiz,
    isPsicologia,
    isEnfermeria,
    isTrabajoSocial,
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
}
