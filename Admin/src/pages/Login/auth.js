const API_URL = import.meta.env.VITE_API_URL;

export async function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // لو التوكن انتهى أو غير صالح
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // لو عندك React Router، ممكن بدل دي تستخدم navigate
    window.location.href = "/login";
  }

  return response;
}
