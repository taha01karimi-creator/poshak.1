/* ابزارهای کوچک و مشترک */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* آدرس API — فروشگاه و پنل هر دو از همین استفاده می‌کنند */
const API_BASE = "/api/v1";

const formatNumber = (n) => Number(n).toLocaleString("fa-IR");
const finalPrice = (p) => Math.round((p.price * (100 - p.discount)) / 100);
const getParam = (name) => new URLSearchParams(location.search).get(name);

// یکسان‌سازی حروف عربی/فارسی تا جستجو دقیق‌تر شود
const normalize = (text) =>
  String(text).replace(/ي/g, "ی").replace(/ك/g, "ک").trim();

const debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/* هر متنی که از کاربر یا دیتابیس می‌آید پیش از innerHTML از این عبور می‌کند */
const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

const readCookie = (name) => {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : "";
};

/* درخواست به API: کوکی نشست + هدر CSRF برای تغییرات */
async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (method !== "GET") {
    let token = readCookie("csrf_token");
    if (!token) {
      await fetch(`${API_BASE}/csrf-token`, { credentials: "same-origin" });
      token = readCookie("csrf_token");
    }
    if (token) headers["X-CSRF-Token"] = token;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "same-origin",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}
