import "./Button.css";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import { IoIosCloseCircleOutline } from "react-icons/io";

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

  const icons = {
    edit: <FiEdit2 />,
    delete: <MdDeleteOutline />,
    details: <CgDetailsMore />,
    close: <IoIosCloseCircleOutline size={28}/>
  };

  return (
    <button
      {...props}
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {icons[variant] || null}
      {loading ? "جاري التحميل..." : children}
    </button>
  );
}