import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../Login/auth.js";

import "./Dashboard.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-US");

export default function Dashboard() {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncedAt, setSyncedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/availableStock", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unexpected response from server"
        );
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Unexpected products data");
      }

      setProducts(data.products);
      setSyncedAt(new Date());
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.message || "Couldn't reach the store data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !products) {
    return (
      <div className="dash">
        <div className="dash-state">
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (error && !products) {
    return (
      <div className="dash">
        <div className="dash-state">
          <b>Couldn't load store data</b>

          <span>{error}</span>

          <button
            type="button"
            className="dash-btn dash-btn-primary dash-retry-btn"
            onClick={load}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const active = products || [];

  const totalQuantity = active.reduce(
    (sum, product) =>
      sum + (Number(product.qty) || 0),
    0
  );

  const low = active.filter((product) => {
    const qty = Number(product.qty);

    return qty > 0 && qty <= 5;
  });

  const negative = active.filter(
    (product) => Number(product.qty) < 0
  );

  const noCategory = active.filter(
    (product) =>
      !product.category ||
      !String(product.category).trim()
  );

  const noImage = active.filter(
    (product) => !product.imagePath
  );

  const categoryMap = {};

  active.forEach((product) => {
    const category =
      product.category &&
      String(product.category).trim()
        ? String(product.category).trim()
        : "Uncategorized";

    categoryMap[category] =
      (categoryMap[category] || 0) + 1;
  });

  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCategory =
    categories[0]?.[1] || 1;

  const manufacturerMap = {};

  active.forEach((product) => {
    if (
      product.manufacturer &&
      String(product.manufacturer).trim()
    ) {
      const manufacturer = String(
        product.manufacturer
      ).trim();

      manufacturerMap[manufacturer] =
        (manufacturerMap[manufacturer] || 0) + 1;
    }
  });

  const manufacturers = Object.entries(
    manufacturerMap
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const withImage =
    active.length - noImage.length;

  const photoPercentage = active.length
    ? Math.round(
        (withImage / active.length) * 100
      )
    : 0;

  const circumference = 251.2;

  const missingDataTotal =
    noImage.length + noCategory.length;

  return (
    <div className="dash">
      <div className="dash-top">
        <div>
          <h1 className="dash-title">
            Dashboard
          </h1>

          <p className="dash-subtitle">
            {syncedAt
              ? `Last updated ${syncedAt.toLocaleTimeString(
                  "en-US"
                )}`
              : "Store overview"}
          </p>
        </div>

        <div className="dash-actions">
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            onClick={load}
            disabled={loading}
          >
            {loading
              ? "Refreshing…"
              : "Refresh"}
          </button>
        </div>
      </div>

      <div className="dash-stats">
        <StatCard
          icon={<BoxIcon />}
          tone="accent"
          label="Total items"
          value={fmt(active.length)}
          hint="Available stock records"
        />

        <StatCard
          icon={<QuantityIcon />}
          tone="success"
          label="Total quantity"
          value={fmt(totalQuantity)}
          hint="Units currently available"
        />

        <StatCard
          icon={<AlertIcon />}
          tone="danger"
          label="Low stock"
          value={fmt(low.length)}
          hint="1–5 units"
        />

        <StatCard
          icon={<ImageIcon />}
          tone="gold"
          label="Missing photo"
          value={fmt(noImage.length)}
          hint={
            active.length
              ? `${Math.round(
                  (noImage.length /
                    active.length) *
                    100
                )}% of items`
              : "No items"
          }
        />

        <StatCard
          icon={<CategoryIcon />}
          tone="neutral"
          label="Missing category"
          value={fmt(noCategory.length)}
          hint={
            active.length
              ? `${Math.round(
                  (noCategory.length /
                    active.length) *
                    100
                )}% of items`
              : "No items"
          }
        />

        <StatCard
          icon={<DatabaseIcon />}
          tone="accent"
          label="Data issues"
          value={fmt(missingDataTotal)}
          hint="Missing photo or category"
        />
      </div>

      <section>
        <div className="dash-section-head">
          <h2>Needs attention</h2>

          <p>
            Items that need review or correction
          </p>
        </div>

        <div className="dash-alert-grid">
          <AlertCard
            title="Negative quantity"
            items={negative}
            tone="danger"
          />

          <AlertCard
            title="No category"
            items={noCategory}
            tone="neutral"
          />

          <AlertCard
            title="Missing photo"
            items={noImage}
            tone="accent"
          />
        </div>
      </section>

      <section className="dash-cols">
        <div className="dash-card">
          <div className="dash-section-head">
            <h2>Stock by category</h2>

            <p>
              {fmt(
                Object.keys(categoryMap).length
              )}{" "}
              categories
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="dash-hint">
              No category data
            </div>
          ) : (
            <div className="dash-swatches">
              {categories.map(
                ([name, count]) => (
                  <div
                    className="dash-swatch-row"
                    key={name}
                  >
                    <div
                      className="dash-swatch-name"
                      title={name}
                    >
                      {name}
                    </div>

                    <div className="dash-swatch-track">
                      <div
                        className="dash-swatch-fill"
                        style={{
                          width: `${
                            (count /
                              maxCategory) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="dash-swatch-count">
                      {fmt(count)}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-section-head">
            <h2>Photo coverage</h2>

            <p>
              Products with uploaded images
            </p>
          </div>

          <div className="dash-ring-box">
            <svg
              width="96"
              height="96"
              viewBox="0 0 96 96"
              aria-label={`${photoPercentage}% photo coverage`}
            >
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                className="dash-ring-track"
                strokeWidth="10"
              />

              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                className="dash-ring-fill"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference -
                  (circumference *
                    photoPercentage) /
                    100
                }
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
              />
            </svg>

            <div className="dash-ring-label">
              <b>{photoPercentage}%</b>

              <span>
                {fmt(withImage)} of{" "}
                {fmt(active.length)} items
                have a photo
              </span>
            </div>
          </div>

          <div className="dash-section-head dash-manufacturers-head">
            <h2>Top manufacturers</h2>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th>Manufacturer</th>

                <th className="dash-table-number">
                  Items
                </th>
              </tr>
            </thead>

            <tbody>
              {manufacturers.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="dash-table-empty"
                  >
                    No manufacturer data
                  </td>
                </tr>
              ) : (
                manufacturers.map(
                  ([name, count]) => (
                    <tr key={name}>
                      <td>{name}</td>

                      <td className="dash-table-number">
                        {fmt(count)}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
}) {
  return (
    <div className="dash-card dash-stat">
      <div
        className={`dash-stat-icon dash-icon-${tone}`}
      >
        {icon}
      </div>

      <div className="dash-label">
        {label}
      </div>

      <div className="dash-value">
        {value}
      </div>

      {hint && (
        <div className="dash-hint">
          {hint}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  title,
  items,
  tone,
}) {
  return (
    <div className="dash-card dash-alert-card">
      <span
        className={`dash-badge dash-badge-${tone}`}
      >
        {fmt(items.length)}
      </span>

      <div className="dash-what">
        {title}
      </div>

      <div className="dash-alert-list">
        {items.length === 0 ? (
          <div className="dash-hint">
            None
          </div>
        ) : (
          items.slice(0, 6).map((product) => (
            <div
              key={
                product._id ||
                product.itemId
              }
            >
              #{product.itemId} —{" "}
              {product.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function BoxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function QuantityIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <path d="M8 4v16" />
      <path d="M16 4v16" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 9v5" />
      <circle
        cx="12"
        cy="17"
        r="0.5"
        fill="currentColor"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <circle
        cx="9"
        cy="10"
        r="1.5"
      />

      <path d="m21 16-5-5-4 4-3-3-6 6" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <path d="M4 5h7v7H4z" />
      <path d="M13 5h7v7h-7z" />
      <path d="M4 14h7v5H4z" />
      <path d="M13 14h7v5h-7z" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <ellipse
        cx="12"
        cy="5"
        rx="8"
        ry="3"
      />

      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />

      <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </svg>
  );
}