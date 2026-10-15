import "./Button.css";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";

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

      {
      variant == 
      "edit" ? <FiEdit2 /> 
      : "delet" ? <MdDeleteOutline /> 
      : "details" ? <CgDetailsMore /> : ''}
      {loading ? "جاري التحميل..." : children}
    </button>
  );
}