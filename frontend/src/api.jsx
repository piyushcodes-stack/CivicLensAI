const API_BASE_URL = "http://127.0.0.1:8000/api";

export function getToken() {
  return localStorage.getItem("civiclens_token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? Object.entries(data)
            .map(([key, value]) => {
              const detail = Array.isArray(value)
                ? value.join(", ")
                : typeof value === "string"
                  ? value
                  : JSON.stringify(value);

              return `${key}: ${detail}`;
            })
            .join("\n")
        : data;

    throw new Error(message || `Request failed (${response.status})`);
  }

  return data;
}