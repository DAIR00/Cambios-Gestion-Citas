import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { User, FileText, Briefcase, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import AuthLayout from "../../../shared/components/AuthLayout";

const ROLES = [
  { id: 2, name: "COORDINACION", label: "Coordinador de Bienestar" },
  { id: 3, name: "PSICOLOGIA", label: "Profesional Psicología" },
  { id: 4, name: "ENFERMERIA", label: "Profesional Enfermería" },
  { id: 5, name: "TRABAJO_SOCIAL", label: "Profesional Trabajo Social" },
  { id: 6, name: "APRENDIZ", label: "Aprendiz" },
];

export default function Register() {
  const [formData, setFormData] = useState({
    email: "", password: "", confirmPassword: "",
    full_name: "", document_number: "", roleId: "", dependencyId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dependencies, setDependencies] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp, signOut, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("dependencies").select("*").then(({ data }) => setDependencies(data || []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectedRole = ROLES.find((r) => r.id === Number(formData.roleId));
  const isProfessional = selectedRole && ["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"].includes(selectedRole.name);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = "El nombre es obligatorio";
    if (!formData.document_number.trim()) errs.document_number = "El documento es obligatorio";
    if (!formData.email) errs.email = "El correo es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Correo inválido";
    if (!formData.password) errs.password = "La contraseña es obligatoria";
    else if (formData.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.roleId) errs.roleId = "Selecciona un rol";
    if (isProfessional && !formData.dependencyId) errs.dependencyId = "Selecciona una dependencia";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const result = await signUp(formData.email, formData.password, {
      full_name: formData.full_name,
      document_number: formData.document_number,
      role_id: Number(formData.roleId),
      dependency_id: formData.dependencyId ? Number(formData.dependencyId) : null,
    });

    if (result.success) {
      const userId = result.data?.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId, full_name: formData.full_name,
          document_number: formData.document_number,
          role_id: Number(formData.roleId),
          dependency_id: formData.dependencyId ? Number(formData.dependencyId) : null,
        }, { onConflict: "id" });
      }
      await signOut();
      toast.success("¡Registro exitoso! Ahora puedes iniciar sesión.");
      navigate("/login");
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout>
      <div className="auth-card register-card">
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate para acceder al sistema</p>

        {(errors.global || authError) && <div className="auth-error">{errors.global || authError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <span className="auth-section-title"><User size={14} aria-hidden="true" /> Información personal</span>

          <div className={`field ${errors.full_name ? 'field--error' : ''}`}>
            <input id="reg-fullname" className="field__input" type="text" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Tu nombre completo" aria-invalid={!!errors.full_name} aria-describedby={errors.full_name ? "fn-error" : undefined} />
            <label className="field__label" htmlFor="reg-fullname">Nombre completo</label>
            {errors.full_name && <p className="field__error" id="fn-error" role="alert">{errors.full_name}</p>}
          </div>

          <div className={`field ${errors.document_number ? 'field--error' : ''}`}>
            <input id="reg-document" className="field__input" type="text" name="document_number" value={formData.document_number} onChange={handleChange} required placeholder="Ej: 1234567890" aria-invalid={!!errors.document_number} aria-describedby={errors.document_number ? "doc-error" : undefined} />
            <label className="field__label" htmlFor="reg-document">Número de documento</label>
            {errors.document_number && <p className="field__error" id="doc-error" role="alert">{errors.document_number}</p>}
          </div>

          <span className="auth-section-title"><Briefcase size={14} aria-hidden="true" /> Rol y dependencia</span>

          <div className={`field ${errors.roleId ? 'field--error' : ''}`}>
            <select id="reg-role" className="field__input" name="roleId" value={formData.roleId} onChange={handleChange} required aria-invalid={!!errors.roleId} aria-describedby={errors.roleId ? "role-error" : undefined}>
              <option value="">Selecciona tu rol</option>
              {ROLES.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
            </select>
            <label className="field__label" htmlFor="reg-role">Rol</label>
            {errors.roleId && <p className="field__error" id="role-error" role="alert">{errors.roleId}</p>}
          </div>

          {isProfessional && (
            <div className={`field ${errors.dependencyId ? 'field--error' : ''}`}>
              <select id="reg-dependency" className="field__input" name="dependencyId" value={formData.dependencyId} onChange={handleChange} required aria-invalid={!!errors.dependencyId} aria-describedby={errors.dependencyId ? "dep-error" : undefined}>
                <option value="">{dependencies.length === 0 ? "No hay dependencias disponibles" : "Selecciona una dependencia"}</option>
                {dependencies.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
              <label className="field__label" htmlFor="reg-dependency">Dependencia</label>
              {errors.dependencyId && <p className="field__error" id="dep-error" role="alert">{errors.dependencyId}</p>}
            </div>
          )}

          <span className="auth-section-title"><Mail size={14} aria-hidden="true" /> Credenciales</span>

          <div className={`field ${errors.email ? 'field--error' : ''}`}>
            <input id="reg-email" className="field__input" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="tu.email@soy.sena.edu.co" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
            <label className="field__label" htmlFor="reg-email">Email institucional</label>
            {errors.email && <p className="field__error" id="email-error" role="alert">{errors.email}</p>}
          </div>

          <div className={`field ${errors.password ? 'field--error' : ''}`}>
            <div className="password-field">
              <input id="reg-password" className="field__input" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Mínimo 6 caracteres" aria-invalid={!!errors.password} aria-describedby={errors.password ? "pw-error" : undefined} />
              <label className="field__label" htmlFor="reg-password">Contraseña</label>
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="field__error" id="pw-error" role="alert">{errors.password}</p>}
          </div>

          <div className={`field ${errors.confirmPassword ? 'field--error' : ''}`}>
            <div className="password-field">
              <input id="reg-confirm" className="field__input" type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repite tu contraseña" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "conf-error" : undefined} />
              <label className="field__label" htmlFor="reg-confirm">Confirmar contraseña</label>
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} aria-label={showConfirm ? "Ocultar" : "Mostrar"}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="field__error" id="conf-error" role="alert">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn--block" disabled={isSubmitting} aria-busy={isSubmitting}>
            <UserPlus size={18} aria-hidden="true" />
            <span className="btn__label">{isSubmitting ? "Registrando..." : "Crear cuenta"}</span>
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
