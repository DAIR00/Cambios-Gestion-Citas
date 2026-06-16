export default function SidebarBackdrop({ isOpen, onClose }) {
  return (
    <div
      className={`sidebar-backdrop ${isOpen ? "open" : ""}`}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
