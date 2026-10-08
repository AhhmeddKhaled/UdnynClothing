import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import "./LoadingContext.css";

const LoadingContext = createContext(null);

function LoadingSpinner() {
  return (
    <div
      className="admin-loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="admin-loading-spinner">
        <span className="admin-loading-ring" />

        <span className="admin-loading-brand">
          يُدنين
        </span>
      </div>
    </div>
  );
}

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] =
    useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((count) =>
      Math.max(0, count - 1)
    );
  }, []);

  const value = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      startLoading,
      stopLoading,
    }),
    [
      loadingCount,
      startLoading,
      stopLoading,
    ]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}

      {loadingCount > 0 && (
        <LoadingSpinner />
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context =
    useContext(LoadingContext);

  if (!context) {
    throw new Error(
      "useLoading must be used inside LoadingProvider"
    );
  }

  return context;
}