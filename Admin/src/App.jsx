import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login/Login.jsx";
import Layout from "./Layout/Layout.jsx";
import ProtectedRoute from "./Layout/ProtectedRoute.jsx";
import { getUser } from "./pages/Login/auth.js";

import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import AvailableStock from "./pages/AvailableStock/AvailableStock.jsx";
import Products from "./pages/Products/Products";
import Users from "./pages/Users/Users.jsx";
import Catalog from "./pages/Catalog/Catalog.jsx";

import Orders from "./pages/Orders/Orders.jsx";
import AddOrder from "./pages/Orders/AddOrder/AddOrder.jsx";

// Change browser tab title based on current page
function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      "/dashboard": "Udnyn Dashboard",
      "/availableStock": "Udnyn Available Stock",
      "/products": "Udnyn Products",
      "/catalog": "Udnyn Catalog",
      "/orders": "Udnyn Orders",
      "/orders/new": "Udnyn Add Order",
      "/users": "Udnyn Users",
      "/login": "Udnyn Login",
    };

    document.title =
      titles[location.pathname] || "Udnyn Dashboard";
  }, [location.pathname]);

  return null;
}

// Admin-only pages
function AdminOnly({ children }) {
  const user = getUser();
  const role = String(user?.role || "").toLowerCase();

  if (role !== "admin") {
    return <Navigate to="/orders/new" replace />;
  }

  return children;
}

// Redirect users based on role
function HomeRedirect() {
  const user = getUser();
  const role = String(user?.role || "").toLowerCase();

  return (
    <Navigate
      to={role === "admin" ? "/dashboard" : "/orders/new"}
      replace
    />
  );
}

function App() {
  return (
    <>
      <PageTitle />

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            <Login
              onSuccess={() => {
                const user = getUser();
                const role = String(
                  user?.role || ""
                ).toLowerCase();

                window.location.replace(
                  role === "admin"
                    ? "/dashboard"
                    : "/orders/new"
                );
              }}
            />
          }
        />

        {/* Protected application layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Home redirect */}
          <Route index element={<HomeRedirect />} />

          {/* Admin-only pages */}
          <Route
            path="dashboard"
            element={
              <AdminOnly>
                <Dashboard />
              </AdminOnly>
            }
          />

          <Route
            path="availableStock"
            element={
              <AdminOnly>
                <AvailableStock />
              </AdminOnly>
            }
          />

          <Route
            path="products"
            element={
              <AdminOnly>
                <Products />
              </AdminOnly>
            }
          />

          <Route
            path="catalog"
            element={
              <AdminOnly>
                <Catalog />
              </AdminOnly>
            }
          />

          <Route
            path="users"
            element={
              <AdminOnly>
                <Users />
              </AdminOnly>
            }
          />

          {/* Orders available to authenticated users */}
          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="orders/new"
            element={<AddOrder />}
          />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<HomeRedirect />}
        />
      </Routes>
    </>
  );
}

export default App;