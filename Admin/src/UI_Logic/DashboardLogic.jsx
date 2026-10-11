import { useMemo } from "react";
import { useFetchData } from "../Hooks/useFetchData";

export function useDashboardLogic(authFetch) {
  const {
    data,
    loading,
    error,
    load,
  } = useFetchData("/api/availableStock", authFetch);

const products = Array.isArray(data)
  ? data
  : Array.isArray(data?.products)
    ? data.products
    : [];
    
  const stats = useMemo(() => {
    const active = products;

    const totalQuantity = active.reduce(
      (sum, product) => sum + (Number(product.qty) || 0),
      0
    );

    const low = active.filter((product) => {
      const qty = Number(product.qty);
      return qty > 0 && qty <= 5;
    });

    const negative = active.filter(
      (product) => Number(product.qty) < 0
    );

    const noCategory = active.filter(
      (product) =>
        !product.category || !String(product.category).trim()
    );

    const noImage = active.filter((product) => !product.imagePath);

    const categoryMap = {};

    active.forEach((product) => {
      const category = product.category?.trim() || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxCategory = categories[0]?.[1] || 1;

    const manufacturerMap = {};

    active.forEach((product) => {
      const manufacturer = product.manufacturer?.trim();

      if (manufacturer) {
        manufacturerMap[manufacturer] =
          (manufacturerMap[manufacturer] || 0) + 1;
      }
    });

    const manufacturers = Object.entries(manufacturerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const withImage = active.length - noImage.length;

    const photoPercentage = active.length
      ? Math.round((withImage / active.length) * 100)
      : 0;

    const missingDataTotal = noImage.length + noCategory.length;

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

  return {
    products,
    loading,
    error,
    load,
    ...stats,
  };
}