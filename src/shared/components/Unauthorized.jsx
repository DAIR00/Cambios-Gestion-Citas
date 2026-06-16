import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>403 - Acceso Denegado</h1>
      <p>No tienes permisos para ver esta página.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}
