/* ============================================
   هدر، جستجو و فوتر مشترک تمام صفحات
   برند: کدلاین — با لوگوی رسمی مجموعه
   ============================================ */

const NAV_LINKS = [
  { href: "index.html", label: "خانه", page: "home" },
  { href: "shop.html", label: "فروشگاه", page: "shop" },
  { href: "shop.html?cat=polo", label: "پولوشرت", page: "polo" },
  { href: "shop.html?cat=shirt", label: "پیراهن", page: "shirt" },
  { href: "shop.html?cat=knit", label: "بافت", page: "knit" },
  { href: "shop.html?cat=pants", label: "شلوار", page: "pants" },
  { href: "shop.html?cat=outer", label: "پالتو", page: "outer" },
  { href: "shop.html?cat=accessory", label: "اکسسوری", page: "accessory" }
];

const LOGO_MARK =
  '<img src="assets/img/codelaine-logo.webp" alt="لوگوی کدلاین" width="46" height="46">' +
  '<span class="logo__text">CODELAINE<small>پوشاک مردانه</small></span>';

const HEADER_HTML =
  '<div class="topbar">ارسال رایگان برای خرید بالای ۵ میلیون تومان — کد تخفیف اولین خرید <b>CODE10</b></div>' +
  '<header class="header">' +
  '<div class="container header__inner">' +
  '<a class="logo" href="index.html" aria-label="کدلاین، صفحه اصلی">' + LOGO_MARK + "</a>" +
  '<nav class="mainnav" aria-label="منوی اصلی">' +
  '<ul class="mainnav__list">' +
  NAV_LINKS.map(function (link) {
    return '<li><a href="' + link.href + '" data-nav="' + link.page + '">' + link.label + "</a></li>";
  }).join("") +
  "</ul></nav>" +
  '<div class="header__side header__side--end">' +
  '<button class="icon-btn" data-search-toggle aria-label="جستجو" title="جستجو">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>' +
  "</button>" +
  '<a class="header__account" href="shop.html">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="3.8"/><path d="M4.8 20.5a7.4 7.4 0 0 1 14.4 0"/></svg>' +
  "<span>ورود / عضویت</span></a>" +
  '<a class="icon-btn" href="cart.html" aria-label="سبد خرید" title="سبد خرید">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7.5h12l1 12H5l1-12Z"/><path d="M9 10.5V6a3 3 0 0 1 6 0v4.5"/></svg>' +
  '<span class="cart-count" data-cart-count>۰</span></a>' +
  '<button class="burger" data-menu-toggle aria-expanded="false" aria-label="منو">' +
  "<span></span></button>" +
  "</div>" +
  "</div></header>";

const SEARCH_HTML =
  '<div class="search" data-search>' +
  '<div class="search__panel" role="dialog" aria-label="جستجوی محصولات">' +
  '<div class="search__head">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>' +
  '<input class="search__input" type="search" placeholder="جستجو در محصولات کدلاین…" aria-label="عبارت جستجو">' +
  '<button class="search__close" type="button">بستن (Esc)</button>' +
  "</div>" +
  '<div class="search__results"></div>' +
  "</div></div>";

const FOOTER_HTML =
  '<footer class="footer">' +
  '<div class="container">' +
  '<div class="footer__grid">' +
  "<div>" +
  '<a class="logo" href="index.html" aria-label="کدلاین">' + LOGO_MARK + "</a>" +
  '<p class="footer__about">کدلاین یک برند مستقل پوشاک مردانه است؛ با تمرکز بر پارچه‌های طبیعی، برش‌های ساده و تولید داخلی. این فروشگاه به‌عنوان نمونه‌کار طراحی و توسعهٔ وب ساخته شده است.</p>' +
  '<div class="socials">' +
  '<a href="https://instagram.com/codelaine_dev" target="_blank" rel="noopener" aria-label="اینستاگرام کدلاین"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg></a>' +
  "</div>" +
  "</div>" +
  "<div>" +
  '<h3 class="footer__title">دسترسی سریع</h3>' +
  '<ul class="footer__list">' +
  '<li><a href="index.html">صفحه اصلی</a></li>' +
  '<li><a href="shop.html">همهٔ محصولات</a></li>' +
  '<li><a href="shop.html?cat=polo">پولوشرت</a></li>' +
  '<li><a href="shop.html?cat=shirt">پیراهن</a></li>' +
  '<li><a href="shop.html?cat=outer">پالتو و کاپشن</a></li>' +
  "</ul>" +
  "</div>" +
  "<div>" +
  '<h3 class="footer__title">خدمات مشتریان</h3>' +
  '<ul class="footer__list">' +
  '<li><a href="shop.html">راهنمای خرید</a></li>' +
  '<li><a href="cart.html">سبد خرید</a></li>' +
  '<li><a href="#">شرایط بازگشت کالا</a></li>' +
  '<li><a href="#">سوالات متداول</a></li>' +
  '<li><a href="#">حریم خصوصی</a></li>' +
  "</ul>" +
  "</div>" +
  "<div>" +
  '<h3 class="footer__title">ارتباط با ما</h3>' +
  '<p class="footer__about" style="margin-top:0">سفارش، هماهنگی و پاسخ به سؤال‌ها فقط از طریق دایرکت اینستاگرام انجام می‌شود.</p>' +
  '<a class="footer__insta" href="https://instagram.com/codelaine_dev" target="_blank" rel="noopener">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>' +
  '<span dir="ltr">@codelaine_dev</span>' +
  "</a>" +
  "</div>" +
  "</div>" +
  '<div class="credit">' +
  '<img class="credit__logo" src="assets/img/codelaine-logo.webp" alt="لوگوی کدلاین" width="52" height="52" loading="lazy">' +
  '<div class="credit__text">' +
  "<strong>طراحی و توسعه: کدلاین</strong>" +
  "<span>اگر به ساخت فروشگاه یا سایت اختصاصی نیاز دارید، در اینستاگرام با ما در تماس باشید.</span>" +
  "</div>" +
  '<a class="credit__btn" href="https://instagram.com/codelaine_dev" target="_blank" rel="noopener">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>' +
  "صفحهٔ کدلاین در اینستاگرام</a>" +
  "</div>" +
  '<div class="footer__bottom">' +
  "<span>© ۱۴۰۵ کدلاین. تمامی حقوق محفوظ است · این سایت نمونه‌کار کدلاین است.</span>" +
  '<div class="footer__pay"><span>پرداخت آنلاین</span><span>ارسال سراسر کشور</span><span>ضمانت اصالت کالا</span></div>' +
  "</div>" +
  "</div></footer>";

/* تزریق هدر و فوتر مشترک */
(function injectLayout() {
  const headerSlot = document.querySelector("[data-site-header]");
  const footerSlot = document.querySelector("[data-site-footer]");

  if (headerSlot) headerSlot.innerHTML = HEADER_HTML + SEARCH_HTML;
  if (footerSlot) footerSlot.innerHTML = FOOTER_HTML;

  const page = document.body.getAttribute("data-page");
  const active = document.querySelector('[data-nav="' + page + '"]');
  if (active) active.classList.add("is-active");
})();
