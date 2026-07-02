import { Search, X, CalendarDays, User, FileText, Filter } from "lucide-react";

export function SearchSidebar({
  filters,
  onFilterChange,
  onClear,
  onSearch,
  isOpen,
  onToggle,
}) {
  const handleChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const hasActiveFilters =
    filters.query ||
    filters.documentNumber ||
    filters.fullName ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.status;

  return (
    <>
      <button
        className="search-sidebar-toggle"
        onClick={onToggle}
        aria-label="Abrir filtros de búsqueda"
        style={isOpen ? { display: "none" } : undefined}
      >
        <Filter size={20} />
      </button>

      <aside
        className={`search-sidebar ${isOpen ? "search-sidebar--open" : ""}`}
        role="search"
        aria-label="Filtros de búsqueda de citas"
      >
        <div className="search-sidebar__header">
          <h2 className="search-sidebar__title">
            <Search size={18} aria-hidden="true" />
            Filtros de Búsqueda
          </h2>
          <button
            className="search-sidebar__close"
            onClick={onToggle}
            aria-label="Cerrar filtros"
          >
            <X size={18} />
          </button>
        </div>

        <div className="search-sidebar__body">
          <div className="search-sidebar__field">
            <label className="search-sidebar__label">
              <Search size={14} aria-hidden="true" />
              Búsqueda general
            </label>
            <input
              type="text"
              className="search-sidebar__input"
              placeholder="Nombre o documento..."
              value={filters.query || ""}
              onChange={(e) => handleChange("query", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
            />
          </div>

          <div className="search-sidebar__divider" />

          <div className="search-sidebar__field">
            <label className="search-sidebar__label">
              <FileText size={14} aria-hidden="true" />
              Número de documento
            </label>
            <input
              type="text"
              className="search-sidebar__input"
              placeholder="Ej: 1234567890"
              value={filters.documentNumber || ""}
              onChange={(e) => handleChange("documentNumber", e.target.value)}
            />
          </div>

          <div className="search-sidebar__field">
            <label className="search-sidebar__label">
              <User size={14} aria-hidden="true" />
              Nombre completo
            </label>
            <input
              type="text"
              className="search-sidebar__input"
              placeholder="Nombre del aprendiz..."
              value={filters.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>

          <div className="search-sidebar__divider" />

          <div className="search-sidebar__field">
            <label className="search-sidebar__label">
              <CalendarDays size={14} aria-hidden="true" />
              Fecha desde
            </label>
            <input
              type="date"
              className="search-sidebar__input"
              value={filters.dateFrom || ""}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>

          <div className="search-sidebar__field">
            <label className="search-sidebar__label">
              <CalendarDays size={14} aria-hidden="true" />
              Fecha hasta
            </label>
            <input
              type="date"
              className="search-sidebar__input"
              value={filters.dateTo || ""}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>

          <div className="search-sidebar__divider" />

          <div className="search-sidebar__field">
            <label className="search-sidebar__label">Estado</label>
            <select
              className="search-sidebar__select"
              value={filters.status || ""}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistió</option>
            </select>
          </div>
        </div>

        <div className="search-sidebar__footer">
          <button
            className="search-sidebar__btn search-sidebar__btn--primary"
            onClick={onSearch}
          >
            <Search size={16} aria-hidden="true" />
            Buscar
          </button>
          {hasActiveFilters && (
            <button
              className="search-sidebar__btn search-sidebar__btn--secondary"
              onClick={onClear}
            >
              <X size={16} aria-hidden="true" />
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
