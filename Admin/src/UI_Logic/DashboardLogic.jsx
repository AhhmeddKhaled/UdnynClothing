import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export function useDashboardLogic(authFetch) {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncedAt, setSyncedAt] = useState(null);

  // Fetch stock data from the API
  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authFetch(
        "/api/availableStock",
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unexpected response from server",
        );
      }

      if (!Array.isArray(data.products)) {
        throw new Error("Unexpected products data");
      }

      setProducts(data.products);
      setSyncedAt(new Date());
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.message ||
          "Couldn't reach the store data",
      );
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Load data when the hook is initialized
  useEffect(() => {
    load();
  }, [load]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const active = products || [];

    // Total available quantity
    const totalQuantity = active.reduce(
      (sum, product) =>
        sum + (Number(product.qty) || 0),
      0,
    );

    // Products with low stock (1–5 units)
    const low = active.filter((product) => {
      const qty = Number(product.qty);

      return qty > 0 && qty <= 5;
    });

    // Products with negative quantity
    const negative = active.filter(
      (product) => Number(product.qty) < 0,
    );

    // Products without a category
    const noCategory = active.filter(
      (product) =>
        !product.category ||
        !String(product.category).trim(),
    );

    // Products without an image
    const noImage = active.filter(
      (product) => !product.imagePath,
    );

    // Count products by category
    const categoryMap = {};

    active.forEach((product) => {
      const category =
        product.category &&
        String(product.category).trim()
          ? String(product.category).trim()
          : "Uncategorized";

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    });

    // Top 10 categories
    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxCategory =
      categories[0]?.[1] || 1;

    // Count products by manufacturer
    const manufacturerMap = {};

    active.forEach((product) => {
      if (
        product.manufacturer &&
        String(product.manufacturer).trim()
      ) {
        const manufacturer = String(
          product.manufacturer,
        ).trim();

        manufacturerMap[manufacturer] =
          (manufacturerMap[manufacturer] || 0) + 1;
      }
    });

    // Top 8 manufacturers
    const manufacturers = Object.entries(
      manufacturerMap,
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // Image coverage
    const withImage =
      active.length - noImage.length;

    const photoPercentage = active.length
      ? Math.round(
          (withImage / active.length) * 100,
        )
      : 0;

    // Total missing data issues
    const missingDataTotal =
      noImage.length + noCategory.length;

    return {
      active,
      totalQuantity,
      low,
      negative,
      noCategory,
      noImage,
      categoryMap,
      categories,
      maxCategory,
      manufacturers,
      withImage,
      photoPercentage,
      missingDataTotal,
    };
  }, [products]);

//   Refresh
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M5.5 9A7 7 0 0 1 18 6l2 6" />
      <path d="M18.5 15A7 7 0 0 1 6 18l-2-6" />
    </svg>
  );
}
  // Expose data and actions to the UI
  return {
    RefreshIcon,
    products,
    loading,
    error,
    syncedAt,
    load,
    ...stats,
  };
}