import { useCallback, useEffect, useRef, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlineX,
} from "react-icons/hi";

import "./Toast.css";

export const TOAST_STATUS = {
  success: { Icon: HiOutlineCheckCircle, title: "Success", role: "status" },
  error: { Icon: HiOutlineXCircle, title: "Error", role: "alert" },
  warning: { Icon: HiOutlineExclamation, title: "Warning", role: "alert" },
  info: { Icon: HiOutlineInformationCircle, title: "Info", role: "status" },
};

const EXIT_MS = 160;

export default function Toast({
  status = "info",
  message,
  title,
  onClose,
  duration = 4000,
  variant = "soft",
  position = "top-center",
}) {

  const config = TOAST_STATUS[status] ?? TOAST_STATUS.info;
 
  const { Icon } = config;

  const [leaving, setLeaving] = useState(false);

  const autoTimer = useRef(null);
  const exitTimer = useRef(null);
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  const close = useCallback(() => {
    clearTimeout(autoTimer.current);
    autoTimer.current = null;
    setLeaving(true);
    exitTimer.current = setTimeout(() => onCloseRef.current?.(), EXIT_MS);
  }, []);

  const start = useCallback(() => {
    if (!duration || autoTimer.current) return;
    startedAt.current = Date.now();
    autoTimer.current = setTimeout(() => {
      autoTimer.current = null;
      close();
    }, remaining.current);
  }, [duration, close]);

  const pause = useCallback(() => {
    if (!duration || !autoTimer.current) return;
    clearTimeout(autoTimer.current);
    autoTimer.current = null;
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
  }, [duration]);

  useEffect(() => {
    remaining.current = duration;
    start();
    return () => {
      clearTimeout(autoTimer.current);
      clearTimeout(exitTimer.current);
      autoTimer.current = null;
    };
  }, [duration, start]);

  const onPointerEnter = (event) => event.pointerType === "mouse" && pause();
  const onPointerLeave = (event) => event.pointerType === "mouse" && start();

  return (
    <div className={`toast-host toast-host--${position}`}>
      <div
        className={`toast toast--${variant} toast--${status}${leaving ? " is-leaving" : ""}`}
        role={config.role}
        style={{ "--toast-duration": `${duration}ms` }}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={pause}
        onBlur={start}
      >
        <span className="toast__icon" aria-hidden="true">
          <Icon />
        </span>

        <div className="toast__body">
          {variant === "card" && (
            <strong className="toast__title">{title ?? config.title}</strong>
          )}
          <span className="toast__message">{message}</span>
        </div>

        <button
          type="button"
          className="toast__close"
          aria-label="Close notification"
          onClick={close}
        >
          <HiOutlineX aria-hidden="true" />
        </button>

        {duration > 0 && <span className="toast__progress" aria-hidden="true" />}
      </div>
    </div>
  );
}