import "../styles/user-sidebar.css";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function UserAvatar({ name, size = "md", onClick, className = "" }) {
  const initials = getInitials(name);
  const sizeClass = `avatar-${size}`;

  return (
    <button
      className={`user-avatar ${sizeClass} ${className}`}
      onClick={onClick}
      title={name}
      type="button"
    >
      <span className="avatar-initials">{initials}</span>
      <span className="avatar-status" />
    </button>
  );
}
