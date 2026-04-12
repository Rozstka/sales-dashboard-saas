export default function LeadsFilters({
  filters,
  onChange,
  onReset,
  onSeedDemo,
  onReplaceWithDemo,
  onExportCsv,
  loading
}) {
  return (
    <section className="panel filters-panel">
      <div className="filters-head">
        <h3>Filters</h3>
        <div className="filters-actions">
          <button
            className="ghost-btn"
            type="button"
            onClick={onSeedDemo}
            disabled={loading}
          >
            Add demo leads
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={onReplaceWithDemo}
            disabled={loading}
          >
            Replace with demo
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={onExportCsv}
            disabled={loading}
          >
            Export CSV
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={onReset}
            disabled={loading}
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="filters-grid">
        <label>
          Search
          <input
            placeholder="Company, contact, email"
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
          />
        </label>

        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange("status", event.target.value)}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </label>

        <label>
          Min value
          <input
            type="number"
            min="0"
            value={filters.minValue}
            onChange={(event) => onChange("minValue", event.target.value)}
          />
        </label>

        <label>
          Max value
          <input
            type="number"
            min="0"
            value={filters.maxValue}
            onChange={(event) => onChange("maxValue", event.target.value)}
          />
        </label>

        <label className="sort-field">
          Sort
          <select
            value={filters.sort}
            onChange={(event) => onChange("sort", event.target.value)}
          >
            <option value="created_desc">Created: newest</option>
            <option value="created_asc">Created: oldest</option>
            <option value="value_desc">Value: high to low</option>
            <option value="value_asc">Value: low to high</option>
          </select>
        </label>
      </div>
    </section>
  );
}
