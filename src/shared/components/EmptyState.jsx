function EmptyState({ icon: Icon, title, description, action, compact }) {
  return (
    <div
      className={`empty-state${compact ? ' empty-state--compact' : ''}`}
      role="status"
    >
      {Icon && (
        <div className="empty-state__icon" aria-hidden="true">
          <Icon size={compact ? 32 : 48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export { EmptyState };
