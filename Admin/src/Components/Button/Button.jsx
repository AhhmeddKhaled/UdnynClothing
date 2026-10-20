import "./Button.css";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline , MdPublishedWithChanges } from "react-icons/md";
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
  radius  = "radius-sm",
  ...props
}) {
  const handleClick = onClick ?? load;
  const isDisabled = disabled || loading;

  const icons = {
    edit: <FiEdit2 size={16}/>,
    delete: <MdDeleteOutline size={16}/>,
    details: <CgDetailsMore size={24}/>,
    close: <IoIosCloseCircleOutline size={28}/>,
    change: <MdPublishedWithChanges size={16}/>
  };

  return (
    <button
      {...props}
      type={type}
      className={`btn btn-${variant} btn-${radius}`.trim()}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {icons[variant] || null}
      {loading ? "جاري التحميل..." : children}
    </button>
  );
}