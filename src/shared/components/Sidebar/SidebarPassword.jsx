import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: 1, label: "Débil", color: "#b91c1c" };
  if (score <= 3) return { level: 2, label: "Media", color: "#b45309" };
  return { level: 3, label: "Fuerte", color: "#15803d" };
}

export default function SidebarPassword({
  passwordForm,
  onChange,
  onSave,
  onBack,
  isSaving,
  showNewPassword,
  showConfirmPassword,
  onToggleNew,
  onToggleConfirm,
}) {
  const strength = getPasswordStrength(passwordForm.newPassword);
  const mismatch =
    passwordForm.confirmPassword &&
    passwordForm.newPassword !== passwordForm.confirmPassword;

  return (
    <div className="sidebar-view">
      <button className="sidebar-back-btn" onClick={onBack} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Mi Cuenta</span>
      </button>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Cambiar Contraseña</span>

        <div className="sidebar-field">
          <label htmlFor="sidebar-new-pw">Nueva contraseña</label>
          <div className="password-field">
            <input
              id="sidebar-new-pw"
              className="field__input"
              type={showNewPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => onChange("newPassword", e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={onToggleNew}
              tabIndex={-1}
              aria-label={showNewPassword ? "Ocultar" : "Mostrar"}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordForm.newPassword && (
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`strength-bar ${strength.level >= i ? "active" : ""}`}
                    style={{
                      backgroundColor:
                        strength.level >= i ? strength.color : "var(--neutral-200)",
                    }}
                  />
                ))}
              </div>
              <span className="strength-label" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div className="sidebar-field">
          <label htmlFor="sidebar-confirm-pw">Confirmar contraseña</label>
          <div className="password-field">
            <input
              id="sidebar-confirm-pw"
              className="field__input"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              placeholder="Repite la contraseña"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={onToggleConfirm}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Ocultar" : "Mostrar"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mismatch && (
            <span className="sidebar-field-error" role="alert">
              Las contraseñas no coinciden
            </span>
          )}
        </div>
      </div>

      <button
        className="btn btn-primary btn--block"
        onClick={onSave}
        disabled={isSaving || !passwordForm.newPassword || !passwordForm.confirmPassword}
        type="button"
        aria-busy={isSaving}
      >
        <Lock size={18} aria-hidden="true" />
        <span className="btn__label">
          {isSaving ? "Actualizando..." : "Actualizar Contraseña"}
        </span>
      </button>
    </div>
  );
}
