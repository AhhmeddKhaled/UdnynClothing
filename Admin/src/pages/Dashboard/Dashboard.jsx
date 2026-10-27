import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { authFetch } from "../../services/UsersServices.js";
import { useDashboardLogic } from "../../UI_Logic/DashboardLogic.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

// Import Icons
import { CiExport } from "react-icons/ci";

// Import Components
import Button from "../../Components/Button/Button";
import ContentHeader from "../../Components/ContentHeader/ContentHeader.jsx";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner.jsx";
import StatCard from "../../Components/StatCard/StatCard";
import StatsContainer from "../../Components/StatCard/StatsContainer";
import RevenueChart from "../../Components/Charts/DashboardChart";

export default function Dashboard() {
  const { user } = useOutletContext();
  const { language, t } = useLanguage();

  const [sessionTime, setSessionTime] = useState("");

  useEffect(() => {
    const now = new Date();

    setSessionTime(
      now.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [language]);

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

  const statsData = [
    {
      title: t("dashboard", "totalProducts"),
      value: loading ? "..." : active.length,
      description: t("dashboard", "productsInInventory"),
      icon: <ProductsIcon size={32} />,
    },
    {
      title: t("dashboard", "totalQuantity"),
      value: loading ? "..." : totalQuantity,
      description: t("dashboard", "unitsAcrossProducts"),
      icon: <QuantityIcon />,
    },
    {
      title: t("dashboard", "lowStock"),
      value: loading ? "..." : low.length,
      description: t("dashboard", "productsWithLowStock"),
      icon: <WarningIcon />,
    },
    {
      title: t("dashboard", "negativeQuantity"),
      value: loading ? "..." : negative.length,
      description: t("dashboard", "productsBelowZero"),
      icon: <AlertIcon />,
    },
  ];

  // Loading
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error
  if (error) {
    return (
      <div
        className="dash-state"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <b>{t("dashboard", "loadError")}</b>
        <p>{error}</p>

        <button
          type="button"
          className="dash-btn dash-btn-primary dash-retry-btn"
          onClick={load}
        >
          {t("dashboard", "tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="dashboard"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <ContentHeader
        title={t("dashboard", "title")}
        subTitle={t("dashboard", "subtitle")}
        user={user}
        sessionTime={sessionTime}
        action={
          <Button icon={<CiExport />}>
            {t("dashboard", "exportReport")}
          </Button>
        }
      />

      {/* Statistics */}
      <StatsContainer>
        {statsData.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </StatsContainer>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Product Image Coverage */}
      <section className="dash-cols">
        <article className="dash-card">
          <div className="dash-section-head">
            <h2>{t("dashboard", "imageCoverage")}</h2>
            <p>{t("dashboard", "productsWithImages")}</p>
          </div>

          {loading ? (
            <StateMessage
              message={t("dashboard", "loadingImageData")}
            />
          ) : (
            <div className="dash-ring-box">
              <div
                className="dash-ring"
                role="img"
                aria-label={`${t("dashboard", "imageCoverage")} ${photoPercentage}%`}
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
                  <span>{t("dashboard", "coverage")}</span>
                </div>
              </div>

              <div className="dash-ring-label">
                <div className="dash-coverage-row">
                  <span className="dash-coverage-dot dash-coverage-good" />
                  <span>{t("dashboard", "withImages")}</span>
                  <b>{withImage}</b>
                </div>

                <div className="dash-coverage-row">
                  <span className="dash-coverage-dot dash-coverage-missing" />
                  <span>{t("dashboard", "missingImages")}</span>
                  <b>{noImage.length}</b>
                </div>

                <div className="dash-coverage-row">
                  <span className="dash-coverage-dot dash-coverage-category" />
                  <span>{t("dashboard", "missingCategories")}</span>
                  <b>{noCategory.length}</b>
                </div>
              </div>
            </div>
          )}
        </article>
      </section>

      {/* Manufacturers and Inventory Alerts */}
      <section className="dash-cols dash-cols-bottom">
        {/* Manufacturers */}
        <article className="dash-card">
          <div className="dash-section-head">
            <h2>{t("dashboard", "manufacturers")}</h2>
            <p>{t("dashboard", "productCountByManufacturer")}</p>
          </div>

          {loading ? (
            <StateMessage
              message={t("dashboard", "loadingManufacturers")}
            />
          ) : manufacturers.length === 0 ? (
            <StateMessage
              message={t("dashboard", "noManufacturerData")}
            />
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>{t("dashboard", "manufacturer")}</th>
                    <th className="dash-table-number">
                      {t("dashboard", "products")}
                    </th>
                    <th>{t("dashboard", "distribution")}</th>
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
                                manufacturers[0][1] > 0
                                  ? (count / manufacturers[0][1]) * 100
                                  : 0
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

        {/* Inventory Alerts */}
        <article className="dash-card">
          <div className="dash-section-head">
            <h2>{t("dashboard", "inventoryAlerts")}</h2>
            <p>{t("dashboard", "attentionRequired")}</p>
          </div>

          {loading ? (
            <StateMessage
              message={t("dashboard", "checkingInventory")}
            />
          ) : (
            <div className="dash-alert-list">
              <AlertRow
                title={t("dashboard", "lowStock")}
                description={t("dashboard", "lowStockDescription")}
                count={low.length}
                variant="gold"
              />

              <AlertRow
                title={t("dashboard", "negativeQuantities")}
                description={t(
                  "dashboard",
                  "negativeQuantityDescription"
                )}
                count={negative.length}
                variant="danger"
              />

              <AlertRow
                title={t("dashboard", "missingImages")}
                description={t("dashboard", "productsWithoutImage")}
                count={noImage.length}
                variant="neutral"
              />

              <AlertRow
                title={t("dashboard", "missingCategories")}
                description={t("dashboard", "productsWithoutCategory")}
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