/* ابزارهای کوچک و مشترک */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

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
