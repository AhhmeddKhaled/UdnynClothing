const API_URL = "https://udnyn.com";
const TOKEN_KEY = "udnyn_admin_token";
const USER_KEY = "udnyn_admin_user";

// ======================================================
// تسجيل الدخول
// ======================================================
// بيرفض أي حساب دوره customer، لأن ده لوحة الموظفين بس

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "فشل تسجيل الدخول");
  }

  if (data.user.role === "customer") {
    throw new Error("الحساب ده مش عنده صلاحية دخول لوحة التحكم");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

// ======================================================
// تسجيل الخروج
// ======================================================

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ======================================================
// قراءة بيانات المستخدم الحالي والتوكن
// ======================================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

// ======================================================
// fetch بيضيف هيدر الـ Authorization أوتوماتيك
// استخدميها بدل fetch العادي في أي طلب محتاج تسجيل دخول
// ======================================================

export async function authFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // لو التوكن انتهى أو اتلغى، نسجل خروج تلقائي
  if (res.status === 401) {
    logout();
  }

  return res;
}