import { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, KeyRound, Mail } from "lucide-react";
import AuthLayout from "../../../shared/components/AuthLayout";
import { supabase } from "../../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [validToken, setValidToken] = useState(null);
  const { updatePassword, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams((hash || "").substring(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: params.get("refresh_token") || "",
      }).then(({ error: sessionError }) => {
        setValidToken(!sessionError);
      });
    } else {
      Promise.resolve().then(() => setValidToken(false));
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!password) errs.password = "La contraseña es obligatoria";
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (!confirmPassword) errs.confirmPassword = "Confirma tu contraseña";
    else if (password !== confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await updatePassword(password);
    if (result.success) {
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {success ? (
          <>
            <div className="auth-success-icon">
              <CheckCircle size={48} aria-hidden="true" />
            </div>
            <h1>Contraseña actualizada</h1>
            <p className="auth-subtitle">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary btn--block"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="btn__label">Ir al inicio de sesión</span>
            </button>
          </>
        ) : validToken === false ? (
          <>
            <div className="auth-success-icon auth-error-icon">
              <KeyRound size={48} aria-hidden="true" />
            </div>
            <h1>Enlace no válido</h1>
            <p className="auth-subtitle">
              El enlace de recuperación ha expirado o no es válido. Solicita uno nuevo.
            </p>
            <Link to="/recuperar" className="btn btn-primary btn--block">
              <Mail size={18} aria-hidden="true" />
              <span className="btn__label">Solicitar nuevo enlace</span>
            </Link>
          </>
        ) : validToken === null ? (
          <p className="auth-subtitle">Verificando enlace...</p>
        ) : (
          <>
            <h1>Nueva contraseña</h1>
            <p className="auth-subtitle">
              Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className={`field ${errors.password ? "field--error" : ""}`}>
                <div className="password-field">
                  <input
                    id="reset-password"
                    className="field__input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    required
                    placeholder="Mínimo 6 caracteres"
                    aria-describedby={errors.password ? "reset-pw-error" : undefined}
                    aria-invalid={!!errors.password}
                  />
                  <label className="field__label" htmlFor="reset-password">
                    Nueva contraseña
                  </label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="field__error" id="reset-pw-error" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className={`field ${errors.confirmPassword ? "field--error" : ""}`}>
                <div className="password-field">
                  <input
                    id="reset-confirm"
                    className="field__input"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    required
                    placeholder="Repite tu contraseña"
                    aria-describedby={errors.confirmPassword ? "reset-conf-error" : undefined}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <label className="field__label" htmlFor="reset-confirm">
                    Confirmar contraseña
                  </label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                    aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="field__error" id="reset-conf-error" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn--block"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                <Lock size={18} aria-hidden="true" />
                <span className="btn__label">
                  {isSubmitting ? "Actualizando..." : "Restablecer contraseña"}
                </span>
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">
            <ArrowLeft size={14} aria-hidden="true" />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
