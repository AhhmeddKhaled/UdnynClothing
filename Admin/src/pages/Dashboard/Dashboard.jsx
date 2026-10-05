import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { authFetch } from "../Login/auth.js";
import "./Dashboard.css";

const fmt = (n) => Number(n || 0).toLocaleString("en-US");

export default function Dashboard() {
  const { theme } = useOutletContext() ?? { theme: "light" };

  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncedAt, setSyncedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // authFetch بيضيف Authorization: Bearer <token> تلقائيًا
      const res = await authFetch("/api/products", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Unexpected response from server"
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected data shape");
      }

      setProducts(data);
      setSyncedAt(new Date());
    } catch (err) {
      setError(err.message || "Couldn't reach the store data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !products) {
    return (
      <div className="dash" data-theme={theme}>
        <div className="dash-state">Loading dashboard…</div>
      </div>
    );
  }

  if (error && !products) {
    return (
      <div className="dash" data-theme={theme}>
        <div className="dash-state">
          <b>Couldn't load store data</b>
          <span>{error}</span>

          <br />

          <button
            className="dash-btn dash-btn-primary"
            style={{ marginTop: 14 }}
            onClick={load}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const active = products || [];

  const totalValue = active.reduce(
    (s, p) =>
      s +
      (Number(p.qty) || 0) *
        (Number(p.wholesalePrice ?? p.price ?? 0) || 0),
    0
  );

  // سعر الشراء مش موجود في البيانات لسه؛
  // هيظهر رقم حقيقي أول ما الحقل يتضاف في الباك إند
  const hasPurchaseField = active.some(
    (p) => p.purchasePrice != null
  );

  const totalPurchases = active.reduce(
    (s, p) =>
      s +
      (Number(p.qty) || 0) *
        (Number(p.purchasePrice) || 0),
    0
  );

  const low = active.filter(
    (p) => Number(p.qty) > 0 && Number(p.qty) <= 5
  );

  const neg = active.filter(
    (p) => Number(p.qty) < 0
  );

  const noCat = active.filter(
    (p) => !p.category
  );

  const noImg = active.filter(
    (p) => !p.imagePath
  );

  const noPrice = active.filter(
    (p) =>
      !Number(
        p.wholesalePrice ?? p.price ?? 0
      )
  );

  const catMap = {};

  active.forEach((p) => {
    const c = p.category || "Uncategorized";
    catMap[c] = (catMap[c] || 0) + 1;
  });

  const cats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCat = cats[0]?.[1] || 1;

  const mfrMap = {};

  active.forEach((p) => {
    if (p.manufacturer) {
      mfrMap[p.manufacturer] =
        (mfrMap[p.manufacturer] || 0) + 1;
    }
  });

  const mfrs = Object.entries(mfrMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const withImg = active.length - noImg.length;

  const pct = active.length
    ? Math.round(
        (withImg / active.length) * 100
      )
    : 0;

  const circ = 251.2;

  return (
    <div className="dash" data-theme={theme}>
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
          label="Active items"
          value={fmt(active.length)}
        />

        <StatCard
          icon={<CoinsIcon />}
          tone="success"
          label="Inventory value"
          value={
            totalValue
              ? fmt(Math.round(totalValue))
              : "—"
          }
          hint="EGP, wholesale"
        />

        <StatCard
          icon={<ReceiptIcon />}
          tone="gold"
          label="Total purchases"
          value={
            hasPurchaseField
              ? fmt(
                  Math.round(totalPurchases)
                )
              : "—"
          }
          hint={
            hasPurchaseField
              ? "EGP, cost basis"
              : "Needs purchase price field"
          }
        />

        <StatCard
          icon={<TrendIcon />}
          tone="neutral"
          label="Total sales"
          badge="Coming soon"
        />

        <StatCard
          icon={<AlertIcon />}
          tone="danger"
          label="Low stock"
          value={fmt(low.length)}
          hint="5 units or fewer"
        />

        <StatCard
          icon={<ImageIcon />}
          tone="danger"
          label="Missing photo"
          value={fmt(noImg.length)}
          hint={
            active.length
              ? Math.round(
                  (noImg.length /
                    active.length) *
                    100
                ) + "% of total"
              : ""
          }
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
            items={neg}
            tone="danger"
          />

          <AlertCard
            title="No category"
            items={noCat}
            tone="neutral"
          />

          <AlertCard
            title="No wholesale price"
            items={noPrice}
            tone="accent"
          />
        </div>
      </section>

      <section className="dash-cols">
        <div className="dash-card">
          <div className="dash-section-head">
            <h2>Stock by category</h2>

            <p>
              {Object.keys(catMap).length}{" "}
              categories
            </p>
          </div>

          <div className="dash-swatches">
            {cats.map(([name, count]) => (
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
                        (count / maxCat) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="dash-swatch-count">
                  {fmt(count)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-section-head">
            <h2>Photo coverage</h2>
          </div>

          <div className="dash-ring-box">
            <svg
              width="96"
              height="96"
              viewBox="0 0 96 96"
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
                strokeDasharray={circ}
                strokeDashoffset={
                  circ -
                  (circ * pct) / 100
                }
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
              />
            </svg>

            <div className="dash-ring-label">
              <b>{pct}%</b>

              <span>
                {fmt(withImg)} of{" "}
                {fmt(active.length)} items
                have a photo
              </span>
            </div>
          </div>

          <div
            className="dash-section-head"
            style={{ marginTop: 28 }}
          >
            <h2>Top manufacturers</h2>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th>Manufacturer</th>

                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Items
                </th>
              </tr>
            </thead>

            <tbody>
              {mfrs.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="dash-hint"
                  >
                    No manufacturer data
                  </td>
                </tr>
              ) : (
                mfrs.map(([name, count]) => (
                  <tr key={name}>
                    <td>{name}</td>

                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {fmt(count)}
                    </td>
                  </tr>
                ))
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
  badge,
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

      {badge ? (
        <span
          className="dash-badge dash-badge-neutral"
          style={{ marginTop: 4 }}
        >
          {badge}
        </span>
      ) : (
        <>
          <div className="dash-value">
            {value}
          </div>

          {hint && (
            <div className="dash-hint">
              {hint}
            </div>
          )}
        </>
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
          items
            .slice(0, 6)
            .map((p) => (
              <div key={p.itemId}>
                #{p.itemId} — {p.name}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

/* ===== أيقونات بسيطة ===== */

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

function CoinsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <circle
        cx="9"
        cy="9"
        r="5"
      />

      <path d="M14.5 10a5 5 0 1 0-4.5 7" />

      <circle
        cx="15"
        cy="15"
        r="5"
      />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z" />

      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...strokeProps}
    >
      <path d="m3 17 6-6 4 4 7-8" />
      <path d="M14 7h6v6" />
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
