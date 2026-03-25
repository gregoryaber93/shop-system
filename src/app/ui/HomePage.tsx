const dashboardMetrics = [
  {
    key: "users",
    label: "Users",
    value: "248",
    description: "Total registered accounts in the platform.",
  },
  {
    key: "shops",
    label: "Shops",
    value: "14",
    description: "Active shops currently managed by the system.",
  },
  {
    key: "products",
    label: "Products",
    value: "1,920",
    description: "Products available across all shops.",
  },
  {
    key: "promotions",
    label: "Promotions",
    value: "37",
    description: "Running promotions configured in the catalog.",
  },
  {
    key: "sales",
    label: "Sales",
    value: "USD 84,500",
    description: "Gross sales generated in the current month.",
  },
] as const;

export const HomePage = () => {
  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of users, shops, products, promotions, and sales.</p>
        </div>
      </header>

      <section className="dashboard-stats" aria-label="Business summary metrics">
        {dashboardMetrics.map((metric) => (
          <article key={metric.key}>
            <h3>{metric.label}</h3>
            <p>{metric.value}</p>
            <small>{metric.description}</small>
          </article>
        ))}
      </section>
    </main>
  );
};
