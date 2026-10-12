
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://udnyn.com"
).replace(/\/+$/, "") + "/api";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "حدث خطأ أثناء تسجيل الدخول"
    );
  }

  return data;
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "حدث خطأ أثناء إنشاء الحساب"
    );
  }

  return data;
}

export function saveAuth(data) {
  if (!data?.token) {
    throw new Error("لم يتم استلام Token من السيرفر");
  }

  localStorage.setItem("token", data.token);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function authFetch(url, options = {}) {
  const token = getToken();

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // استخدم FormData بدون تحديد Content-Type يدويًا
  // حتى يضيف المتصفح multipart boundary تلقائيًا.
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
