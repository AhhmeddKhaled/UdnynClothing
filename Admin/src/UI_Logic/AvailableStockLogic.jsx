
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authFetch } from "../pages/Login/auth.js";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function useAvailableStockLogic() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");

  const [importing, setImporting] = useState(false);
  const [imageUploadingFor, setImageUploadingFor] = useState(null);

  const fileInputRefs = useRef({});
  const currentUser = useMemo(() => getCurrentUser(), []);

  const canManageImages = ["admin", "owner"].includes(
    currentUser?.role?.toLowerCase()
  );

  const canImport = canManageImages;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/availableStock");
      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Failed to load available stock."
        );
      }

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];

      setProducts(productList);
      return productList;
    } catch (err) {
      console.error("Available Stock fetch error:", err);

      setError(err.message || "Failed to load available stock.");
      setProducts([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.category).filter(Boolean)
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), "en"));
  }, [products]);

  const manufacturers = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.manufacturer).filter(Boolean)
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), "en"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        String(product.itemId ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.name ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.manufacturer ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      const matchesManufacturer =
        !manufacturerFilter ||
        product.manufacturer === manufacturerFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesManufacturer
      );
    });
  }, [products, search, categoryFilter, manufacturerFilter]);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath || typeof imagePath !== "string") {
      return null;
    }

    const path = imagePath.trim();

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  }, []);

  const openImagePicker = useCallback((itemId, view) => {
    fileInputRefs.current[`${String(itemId)}-${view}`]?.click();
  }, []);

  const handleImageUpload = useCallback(async (event, product) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      window.alert("Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      window.alert("The image size must not exceed 5 MB.");
      return;
    }

    if (product.itemId == null || product.itemId === "") {
      window.alert("Product ID is missing.");
      return;
    }

    const productId = String(product.itemId);

    setImageUploadingFor(productId);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await authFetch(
        `/api/availableStock/${encodeURIComponent(productId)}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to upload image.");
      }

      const newImagePath =
        data.imagePath ??
        data.product?.imagePath ??
        data.product?.image ??
        data.image;

      if (!newImagePath) {
        throw new Error(
          "The server did not return the saved image path."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          String(item.itemId) === productId
            ? {
                ...item,
                imagePath: newImagePath,
                image: newImagePath,
              }
            : item
        )
      );

      window.alert("Product image saved successfully.");
    } catch (err) {
      console.error("Image upload error:", err);
      window.alert(err.message || "An error occurred while uploading the image.");
    } finally {
      setImageUploadingFor(null);
    }
  }, []);

  const handleImport = useCallback(async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    const allowedExtensions = /\.(xlsx|xls)$/i;

    if (!allowedExtensions.test(file.name)) {
      window.alert("Please select an Excel file (.xlsx or .xls).");
      return;
    }

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await authFetch(
        "/api/availableStock/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to import Excel file.");
      }

      await fetchProducts();

      window.alert(data.message || "Products imported successfully.");
    } catch (err) {
      console.error("Excel import error:", err);
      window.alert(err.message || "An error occurred while importing the file.");
    } finally {
      setImporting(false);
    }
  }, [fetchProducts]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCategoryFilter("");
    setManufacturerFilter("");
  }, []);

  return {
    products,
    filteredProducts,
    categories,
    manufacturers,

    loading,
    error,
    importing,
    imageUploadingFor,

    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    manufacturerFilter,
    setManufacturerFilter,

    canManageImages,
    canImport,

    fileInputRefs,
    fetchProducts,
    getImageUrl,
    openImagePicker,
    handleImageUpload,
    handleImport,
    clearFilters,
  };
}
