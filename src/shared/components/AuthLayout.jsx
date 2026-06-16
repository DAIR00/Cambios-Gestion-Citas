import { Heart, Shield, Sparkles } from "lucide-react";
import "../styles/auth-layout.css";

const features = [
  { icon: Sparkles, text: "Agenda tu cita en segundos" },
  { icon: Heart, text: "Bienestar personalizado para ti" },
  { icon: Shield, text: "Datos protegidos, tú tranquilo" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout-brand">
        <div className="auth-brand-decoration" aria-hidden="true" />
        <div className="auth-brand-decoration-2" aria-hidden="true" />

        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
                <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S10 25.523 10 20 14.477 10 20 10z" fill="white" fillOpacity="0.9" />
                <path d="M20 14v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="auth-logo-text">SENA</span>
          </div>

          <h1 className="auth-brand-title">
            Tu bienestar,
            <br />
            más fácil
          </h1>
          <p className="auth-brand-subtitle">
            Gestión de citas para el Sistema de Bienestar
          </p>

          <ul className="auth-features">
            {features.map((f, i) => (
              <li key={i} className="auth-feature-item">
                <div className="auth-feature-icon" aria-hidden="true">
                  <f.icon size={18} />
                </div>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <p className="auth-trust">
            🔒 Datos protegidos bajo la Ley 1581 de 2012
          </p>
        </div>
      </div>

      <div className="auth-layout-form">
        <div className="auth-mobile-header">
          <div className="auth-logo">
            <div className="auth-logo-icon auth-logo-icon-sm" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
                <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S10 25.523 10 20 14.477 10 20 10z" fill="white" fillOpacity="0.9" />
                <path d="M20 14v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="auth-logo-text">Gestión de Citas</span>
          </div>
        </div>

        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
