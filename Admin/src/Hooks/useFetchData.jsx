import { useCallback, useEffect, useState } from "react";

export function useFetchData(url, authFetch, options = {}) {
  const {
    initialData = null,
    enabled = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError("");

    try {
      const response = await authFetch(url, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Unexpected response from server"
        );
      }

      // يدعم أي شكل للاستجابة:
      // Array, Object, String, Number, Boolean
      setData(result);
      return result;
    } catch (err) {
      console.error("Data loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't reach the data"
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, [url, authFetch, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    setData,
    loading,
    error,
    load,
  };
}