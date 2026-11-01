
import { useCallback, useState } from "react";
import { getToken } from "../services/UsersServices.js";

export default function useDeleteItem() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteItem = useCallback(async (id) => {
    if (!id) {
      throw new Error("Order ID is required");
    }

    const token = getToken();

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/orders/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
          data?.error ||
          `Failed to delete: ${response.status}`
        );
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deleteItem,
    isDeleting,
    error,
  };
}
