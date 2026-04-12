const statusColors = {
  new: "#1b7f79",
  in_progress: "#f39c12",
  won: "#2d9b52",
  lost: "#d64545"
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function toPercent(value, max) {
  if (!max || max <= 0) {
    return 0;
  }
  return Math.round((value / max) * 100);
}

function renderMetricRows(items, metricKey, metricFormatter, maxValue) {
  return items.map((item) => {
    const value = Number(item[metricKey] || 0);
    const width = toPercent(value, maxValue);
    return (
      <div className="chart-row" key={`${metricKey}-${item.status}`}>
        <div className="chart-row-head">
          <span>{item.label}</span>
          <strong>{metricFormatter(value)}</strong>
        </div>
        <div className="bar-track">
          <div
            className="bar-fill"
            style={{
              width: `${width}%`,
              backgroundColor: statusColors[item.status] || "#1b7f79"
            }}
          />
        </div>
      </div>
    );
  });
}

export default function ChartsPanel({ charts }) {
  const statusCounts = charts?.statusCounts || [];
  const statusValues = charts?.statusValues || [];
  const monthlyWonValues = charts?.monthlyWonValues || [];

  const maxCount = Math.max(...statusCounts.map((item) => Number(item.count || 0)), 0);
  const maxStatusValue = Math.max(...statusValues.map((item) => Number(item.value || 0)), 0);
  const maxMonthlyValue = Math.max(...monthlyWonValues.map((item) => Number(item.value || 0)), 0);

  return (
    <section className="charts-grid">
      <article className="panel chart-card">
        <h3>Leads by status</h3>
        <div className="chart-list">
          {renderMetricRows(statusCounts, "count", (value) => value.toLocaleString(), maxCount)}
        </div>
      </article>

      <article className="panel chart-card">
        <h3>Pipeline value by status</h3>
        <div className="chart-list">
          {renderMetricRows(statusValues, "value", formatMoney, maxStatusValue)}
        </div>
      </article>

      <article className="panel chart-card chart-card-wide">
        <h3>Won value trend (6 months)</h3>
        <div className="trend-chart">
          {monthlyWonValues.map((item) => {
            const height = toPercent(Number(item.value || 0), maxMonthlyValue);
            return (
              <div className="trend-item" key={`trend-${item.label}`}>
                <div className="trend-bar-wrap">
                  <div
                    className="trend-bar"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${formatMoney(item.value)}`}
                  />
                </div>
                <small>{item.label}</small>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
