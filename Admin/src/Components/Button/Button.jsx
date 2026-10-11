import "./Button.css";

export default function Button({load,loading}) {
  return (
    <button
      type="button"
      className="dash-btn dash-btn-primary"
      onClick={load}
      disabled={loading}
    >
      {loading ? "Refreshing..." : "Refresh data"}
    </button>
  );
}
