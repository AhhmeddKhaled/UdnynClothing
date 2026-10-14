import "./Button.css";

export default function Button({
  children,
  type = "button",
  className = "",
  onClick,
  load,
  disabled = false,
  loading = false,
  variant = "primary",
  ...props
}) {
  const handleClick = onClick ?? load;
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {loading ? "جاري التحميل..." : children}
    </button>
  );
}