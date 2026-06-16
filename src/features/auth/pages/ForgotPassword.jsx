import { useState } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import AuthLayout from "../../../shared/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const { resetPassword, error } = useAuth();

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "El correo es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Correo inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await resetPassword(email);
    if (result.success) {
      setSent(true);
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {sent ? (
          <>
            <div className="auth-success-icon">
              <CheckCircle size={48} aria-hidden="true" />
            </div>
            <h1>Correo enviado</h1>
            <p className="auth-subtitle">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <p className="auth-hint">
              ¿No lo recibiste? Revisa la carpeta de spam o intenta nuevamente.
            </p>
            <Link to="/login" className="btn btn-primary btn--block auth-back-btn">
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="btn__label">Volver al inicio de sesión</span>
            </Link>
          </>
        ) : (
          <>
            <h1>Recuperar contraseña</h1>
            <p className="auth-subtitle">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className={`field ${errors.email ? "field--error" : ""}`}>
                <input
                  id="forgot-email"
                  className="field__input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  required
                  placeholder="tu.email@soy.sena.edu.co"
                  aria-describedby={errors.email ? "forgot-email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
                <label className="field__label" htmlFor="forgot-email">
                  Correo electrónico
                </label>
                {errors.email && (
                  <p className="field__error" id="forgot-email-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn--block"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                <Send size={18} aria-hidden="true" />
                <span className="btn__label">
                  {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
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
