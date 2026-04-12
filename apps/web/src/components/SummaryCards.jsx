export default function SummaryCards({ summary }) {
  const cards = [
    { label: "Total leads", value: summary.total || 0 },
    { label: "New", value: summary.new_count || 0 },
    { label: "In progress", value: summary.in_progress_count || 0 },
    { label: "Won", value: summary.won_count || 0 },
    { label: "Lost", value: summary.lost_count || 0 },
    { label: "Won value", value: `$${Number(summary.won_value || 0).toLocaleString()}` }
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <article key={card.label} className="panel summary-card">
          <p>{card.label}</p>
          <h3>{card.value}</h3>
        </article>
      ))}
    </section>
  );
}
