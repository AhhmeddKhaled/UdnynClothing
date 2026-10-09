import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useSidebarLogic(onLogout) {
  const [open, setOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();

    setSessionTime(
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  function handleNavigation() {
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    onLogout?.();
    navigate("/login");
  }

  function handleSettings() {
    setOpen(false);
    navigate("/settings");
  }

  function handleOpenMenu() {
    setOpen(true);
  }

  function handleCloseMenu() {
    setOpen(false);
  }

  return {
    open,
    sessionTime,
    handleNavigation,
    handleLogout,
    handleSettings,
    handleOpenMenu,
    handleCloseMenu,
  };
}