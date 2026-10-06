import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login.jsx'
import Layout from './Layout/Layout.jsx'
import ProtectedRoute from './Layout/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import AvailableStock from './pages/AvailableStock/AvailableStock.jsx'
import Products from './pages/Products/Products'
import Users from './pages/Users/Users.jsx'
import Catalog from './pages/Catalog/Catalog.jsx'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onSuccess={() => window.location.replace("/dashboard")} />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="availableStock" element={<AvailableStock />} />
        <Route path="products" element={<Products />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App