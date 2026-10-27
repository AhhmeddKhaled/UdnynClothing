import { useState } from "react";
import { getToken } from "../services/UsersServices.js";

const API_URL = import.meta.env.VITE_API_URL;

export default function useUpdateData(id) {
  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          setLoading(false);

          console.error("Server error:", errorData);

          throw new Error(
            errorData?.message ||
              errorData?.error ||
              `Failed to update: ${response.status}`,
          );
        }
      }

      const data = await response.json().catch(() => null);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating, error, loading };
}
