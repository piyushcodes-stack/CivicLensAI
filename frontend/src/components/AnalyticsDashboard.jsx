import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/complaints/analytics/");
      setAnalytics(data);
    } catch (err) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="analytics-message">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={loadAnalytics}>Try Again</button>
      </div>
    );
  }

  const cards = [
    { label: "Total Complaints", value: analytics.total, icon: "📋" },
    { label: "Resolved", value: analytics.resolved, icon: "✅" },
    { label: "Pending", value: analytics.pending, icon: "⏳" },
    { label: "In Progress", value: analytics.in_progress, icon: "🔄" },
    { label: "Rejected", value: analytics.rejected, icon: "❌" },
  ];

  const maxCategoryCount = Math.max(
    1,
    ...analytics.categories.map((item) => item.count)
  );

  return (
    <section className="analytics-dashboard">
      <div className="analytics-heading">
        <div>
          <p className="analytics-eyebrow">CIVICLENS AI · INSIGHTS</p>
          <h2>Complaints Analytics</h2>
          <p className="analytics-subtitle">
            An overview of complaint activity from your database.
          </p>
        </div>

        <button className="analytics-refresh" onClick={loadAnalytics}>
          ↻ Refresh
        </button>
      </div>

      <div className="analytics-cards">
        {cards.map((card) => (
          <article className="analytics-card" key={card.label}>
            <div className="analytics-card-top">
              <span>{card.label}</span>
              <span className="analytics-icon">{card.icon}</span>
            </div>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="analytics-panel">
        <div className="analytics-panel-heading">
          <h3>Complaints by Category</h3>
          <span>{analytics.categories.length} categories</span>
        </div>

        {analytics.categories.every((item) => item.count === 0) ? (
          <p className="analytics-empty">
            No complaints available for category analysis yet.
          </p>
        ) : (
          <div className="analytics-category-list">
            {analytics.categories.map((item) => (
              <div className="analytics-category" key={item.category}>
                <div className="analytics-category-info">
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar"
                    style={{
                      width: `${(item.count / maxCategoryCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="analytics-footer">
        Data is loaded from the CivicLens AI backend.
      </p>
    </section>
  );
}