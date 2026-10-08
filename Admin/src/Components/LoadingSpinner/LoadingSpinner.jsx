import "./LoadingSpinner.css";

export default function LoadingSpinner() {
  return (
    <div
      className="admin-loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="admin-loading-spinner">
        <span className="admin-loading-ring" />

        <span className="admin-loading-brand">
          يُدنين
        </span>
      </div>
    </div>
  );
}