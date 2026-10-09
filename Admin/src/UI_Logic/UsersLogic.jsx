import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "../pages/Login/auth.js";

export function useUsersLogic() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch("/api/users", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Couldn't load users");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || "Couldn't load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return users || [];

    return (users || []).filter(
      (item) =>
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search),
    );
  }, [users, q]);

  return {
    users,
    filteredUsers,
    loading,
    error,
    q,
    setQ,
    load,
  };
}