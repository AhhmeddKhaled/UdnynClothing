import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, status = "success", options = {}) => {
    setToast({ id: `${Date.now()}-${Math.random()}`, message, status, ...options });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
}