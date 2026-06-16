import { createContext, useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "INITIAL_SESSION") {
          if (session?.user) {
            setProfileLoaded(false);
            setUser(session.user);
            await fetchProfile(session.user.id, session.user);
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
            await fetchProfile(session.user.id, session.user);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setProfileLoaded(true);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  //funcion auxiliar: obterner el perfil + el rol desde nuestra base de datos
  const fetchProfile = async (userId, authUser) => {
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
      if (authUser) {
        await supabase.auth.signOut();
      }
    } finally {
      setProfileLoaded(true);
    }
  };

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
