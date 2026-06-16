function Skeleton({ variant = 'text', width, height, count = 1 }) {
  if (count > 1) {
    return (
      <div className="skeleton-group" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={`skeleton skeleton--${variant}`}
            style={{ width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton skeleton--${variant}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export { Skeleton };
