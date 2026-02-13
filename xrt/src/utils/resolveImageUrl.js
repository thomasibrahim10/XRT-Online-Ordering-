import { API_BASE_URL } from "../config/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, "");

function getApiOrigin() {
  if (API_ORIGIN && API_ORIGIN !== "http://localhost:3001" && !API_ORIGIN.startsWith("http://127.0.0.1")) {
    return API_ORIGIN;
  }
  if (typeof window !== "undefined" && window.__API_ORIGIN__) {
    return window.__API_ORIGIN__;
  }
  if (typeof window !== "undefined" && window.location?.protocol === "https:") {
    return window.location.origin;
  }
  return API_ORIGIN || "";
}

/** Resolve image URL: relative paths use API origin; localhost URLs rewritten to deployed origin. */
export function resolveImageUrl(url) {
  if (url == null || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  const origin = getApiOrigin();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return `${origin}${u.pathname}${u.search}`;
      }
    } catch (_) {}
    return trimmed;
  }
  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}
