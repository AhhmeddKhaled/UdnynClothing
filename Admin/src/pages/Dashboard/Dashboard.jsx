import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import { authFetch } from "../Login/auth.js";
import { useDashboardLogic } from "../../UI_Logic/DashboardLogic.jsx";
import LoadingSpinner from '../../Components/LoadingSpinner/LoadingSpinner.jsx'

export default function Dashboard() {
  const { user } = useOutletContext();
  const [sessionTime, setSessionTime] = useState("");

  useEffect(() => {
    const now = new Date();

    setSessionTime(
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  const {
    loading,
    error,
    syncedAt,
    load,
    active,
    totalQuantity,
    low,
    negative,
    noCategory,
    noImage,
    categories,
    maxCategory,
    manufacturers,
    withImage,
    photoPercentage,
    missingDataTotal,
  } = useDashboardLogic(authFetch);

  // Loading 
  if(loading) return <LoadingSpinner />

  return (
    <div className="dashboard">
      <ContentHeader
        title="Dashboard"
        subTitle="View all statistics in one place."
        user={user}
        sessionTime={sessionTime}
      />

      {error && (
        <div className="dash-state">
          <b>Couldn't load dashboard data</b>
          <p>{error}</p>
          <button
            type="button"
            className="dash-btn dash-btn-primary dash-retry-btn"
            onClick={load}
          >
            Try again
          </button>
        </div>
      )}

      <section className="dash-stats">
        <StatCard
          title="Total Products"
          value={loading ? "..." : active.length}
          description="Products in inventory"
          icon={<ProductsIcon />}
          iconStyle="accent"
        />

        <StatCard
          title="Total Quantity"
          value={loading ? "..." : totalQuantity}
          description="Units across all products"
          icon={<QuantityIcon />}
          iconStyle="success"
        />

        <StatCard
          title="Low Stock"
          value={loading ? "..." : low.length}
          description="Products with 1–5 units"
          icon={<WarningIcon />}
          iconStyle="gold"
        />

        <StatCard
          title="Negative Quantity"
          value={loading ? "..." : negative.length}
          description="Products below zero"
          icon={<AlertIcon />}
          iconStyle="danger"
        />
      </section>

      <section className="dash-cols">
        <article className="dash-card">
          <div className="dash-section-head">
            <h2>Inventory by Category</h2>
            <p>Product distribution across categories</p>
          </div>

          {loading ? (
            <StateMessage message="Loading categories..." />
          ) : categories.length === 0 ? (
            <StateMessage message="No products available." />
          ) : (
            <div className="dash-swatches">
              {categories.map(([category, count]) => (
                <div className="dash-swatch-row" key={category}>
                  <span className="dash-swatch-name" title={category}>
                    {category}
                  </span>

                  <div className="dash-swatch-track">
                    <div
                      className="dash-swatch-fill"
                      style={{
                        width: `${(count / maxCategory) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="dash-swatch-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-section-head">
            <h2>Product Image Coverage</h2>
            <p>Products with images in the catalog</p>
          </div>

          {loading ? (
            <StateMessage message="Loading image data..." />
          ) : (
            <div className="dash-ring-box">
              <div
                className="dash-ring"
                role="img"
                aria-label={`Image coverage ${photoPercentage}%`}
              >
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle
                    className="dash-ring-track"
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    strokeWidth="10"
                  />

                  <circle
                    className="dash-ring-fill"
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(photoPercentage / 100) * 301.59} 301.59`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>

                <div className="dash-ring-center">
                  <strong>{photoPercentage}%</strong>
                  <span>Coverage</span>
                </div>
              </div>

              <div className="dash-ring-label">
                <div className="dash-coverage-row">
                  <span className="dash-coverage-dot dash-coverage-good" />
                  <span>With images</span>
                  <b>{withImage}</b>
                </div>

                <div className="dash-coverage-row">
                  <span className="dash-coverage-dot dash-coverage-missing" />
                  <span>Missing images</span>
                  <b>{noImage.length}</b>
                </div>

                <div className="dash-coverage-row">
                  <span className="dash-coverage-dot dash-coverage-category" />
                  <span>Missing categories</span>
                  <b>{noCategory.length}</b>
                </div>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="dash-cols dash-cols-bottom">
        <article className="dash-card">
          <div className="dash-section-head">
            <h2>Manufacturers</h2>
            <p>Product count by manufacturer</p>
          </div>

          {loading ? (
            <StateMessage message="Loading manufacturers..." />
          ) : manufacturers.length === 0 ? (
            <StateMessage message="No manufacturer information available." />
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Manufacturer</th>
                    <th className="dash-table-number">Products</th>
                    <th>Distribution</th>
                  </tr>
                </thead>

                <tbody>
                  {manufacturers.map(([manufacturer, count]) => (
                    <tr key={manufacturer}>
                      <td>{manufacturer}</td>
                      <td className="dash-table-number">{count}</td>
                      <td>
                        <div className="dash-table-track">
                          <div
                            className="dash-table-fill"
                            style={{
                              width: `${
                                (count / manufacturers[0][1]) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-section-head">
            <h2>Inventory Alerts</h2>
            <p>Data that may need your attention</p>
          </div>

          {loading ? (
            <StateMessage message="Checking inventory..." />
          ) : (
            <div className="dash-alert-list">
              <AlertRow
                title="Low stock"
                description="Products with 1–5 units remaining"
                count={low.length}
                variant="gold"
              />

              <AlertRow
                title="Negative quantities"
                description="Products with quantity below zero"
                count={negative.length}
                variant="danger"
              />

              <AlertRow
                title="Missing images"
                description="Products without an image"
                count={noImage.length}
                variant="neutral"
              />

              <AlertRow
                title="Missing categories"
                description="Products without a category"
                count={noCategory.length}
                variant="accent"
              />
            </div>
          )}
        </article>
      </section>

    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconStyle = "accent",
}) {
  return (
    <article className="dash-card dash-stat">
      <div className={`dash-stat-icon dash-icon-${iconStyle}`}>
        {icon}
      </div>

      <div className="dash-label">{title}</div>
      <div className="dash-value">{value}</div>
      <div className="dash-hint">{description}</div>
    </article>
  );
}

function AlertRow({ title, description, count, variant }) {
  return (
    <div className="dash-alert-row">
      <div className="dash-alert-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <span className={`dash-badge dash-badge-${variant}`}>
        {count}
      </span>
    </div>
  );
}

function StateMessage({ message }) {
  return <p className="dash-state">{message}</p>;
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  );
}

function QuantityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="8" cy="7" r="1.5" />
      <circle cx="16" cy="12" r="1.5" />
      <circle cx="10" cy="17" r="1.5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="0.7" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <circle cx="12" cy="16.5" r="0.7" />
    </svg>
  );
}



