import { useCallback, useEffect, useState } from "react";
import { getToken } from "../services/UsersServices.js";

const API_URL = import.meta.env.VITE_API_URL;

export function useFetchData(url, options = {}) {
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
      const token = getToken();

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${url}`, {
        method: "GET",
        cache: "no-store",
        headers,
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
          result?.error ||
          "Unexpected response from server"
        );
      }

      console.log(result);
      
      setData(result);

      return result;
    } catch (err) {
      setError(err.message || "Couldn't reach the data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    load,
  };
}