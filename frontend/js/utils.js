

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const API_BASE = "/api/v1";

const DEMO_DB_KEY = "codelaine:demo-db";
const DEMO_ORDERS_KEY = "codelaine:orders";
const DEMO_SCHEMA_VERSION = 4;

const formatNumber = (n) => Number(n).toLocaleString("fa-IR");
const finalPrice = (p) => Math.round((p.price * (100 - p.discount)) / 100);
const getParam = (name) => new URLSearchParams(location.search).get(name);

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const normalize = (text) =>
  String(text ?? "")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ۀة]/g, "ه")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ؤ]/g, "و")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[\u200c\u200e\u200f\u0640]/g, " ")
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

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
