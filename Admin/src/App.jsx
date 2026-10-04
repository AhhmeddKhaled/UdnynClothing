import { useState } from 'react'
import './App.css'
import ExcelUpload from './ExcelUpload/ExcelUpload.jsx';
import ProductImageUpload from './ProductImageUpload/ProductImageUpload.jsx'
import Login from './pages/Login/Login.jsx';
import { isLoggedIn, getUser, logout } from './pages/Login/auth.js';

function App() {
  const [user, setUser] = useState(getUser())

  if (!isLoggedIn()) {
    return <Login onSuccess={setUser} />
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px" }}>
        <span>مرحبًا، {user?.name}</span>
        <button onClick={() => { logout(); setUser(null); }}>
          تسجيل الخروج
        </button>
      </div>
      <ExcelUpload />
      <ProductImageUpload />
    </>
  )
}

export default App