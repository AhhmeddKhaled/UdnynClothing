import "./LoadingSpinner.css";

export default function LoadingSpinner() {
  return (
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="loading-spinner">
        <span className="loading-spinner-ring" />

        <span className="loading-spinner-brand">
          يُدنين
        </span>
      </div>
    </div>
  );
}