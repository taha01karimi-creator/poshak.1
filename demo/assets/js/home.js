/* ============================================
   صفحه اصلی: اسلایدر، تب محصولات، شمارش معکوس
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  initHeroSlider();
  renderNewProducts();
  renderSaleProducts();
  renderBestSellers();
  fillCategoryCounts();
});

/* شمارش محصولات هر دسته روی کاشی‌های صفحهٔ اصلی */
function fillCategoryCounts() {
  document.querySelectorAll("[data-cat-count]").forEach(function (el) {
    const cat = el.getAttribute("data-cat-count");
    const count = PRODUCTS.filter(function (item) {
      return item.category === cat;
    }).length;
    el.textContent = faNum(count) + " محصول";
  });
}

/* ---------- اسلایدر هیرو ---------- */
const HERO_SLIDES = [
  {
    eyebrow: "کالکشن پاییز ۱۴۰۵",
    title: "سادگی، دوخت تمیز<br>و پارچه‌ای که می‌ماند",
    desc: "کالکشن کپسولی پاییز؛ پارچه‌های پنبه‌ای و پشمی، برش‌های آرام و رنگ‌های خنثی برای استایل روزمره.",
    cta: "مشاهدهٔ کالکشن",
    href: "shop.html",
    image: "assets/img/hero-1.jpg"
  },
  {
    eyebrow: "پیشنهاد ویژه",
    title: "بافت و اورکت،<br>با ۲۰٪ تخفیف",
    desc: "لایه‌های گرم پاییزی؛ از بافت یقه‌گرد تا اورکت بلند شتری، با موجودی محدود.",
    cta: "خرید لباس گرم",
    href: "shop.html?cat=knit",
    image: "assets/img/hero-2.jpg"
  },
  {
    eyebrow: "تازه رسیده",
    title: "پیراهن و تیشرت‌های<br>نخی تازه",
    desc: "پارچهٔ خنک و برش راحت؛ انتخاب اول برای استایل روزمره و سفرهای آخر هفته.",
    cta: "مشاهدهٔ جدیدها",
    href: "shop.html",
    image: "assets/img/hero-3.jpg"
  }
];

function initHeroSlider() {
  const container = document.querySelector("[data-hero]");
  if (!container) return;

  container.innerHTML = HERO_SLIDES.map(function (slide, index) {
    return (
      '<article class="hero__slide' + (index === 0 ? " is-active" : "") + '">' +
      '<div class="container hero__grid">' +
      '<div class="hero__copy">' +
      '<span class="hero__eyebrow">' + slide.eyebrow + "</span>" +
      '<h1 class="hero__title">' + slide.title + "</h1>" +
      '<p class="hero__desc">' + slide.desc + "</p>" +
      '<div class="hero__actions">' +
      '<a class="btn btn--primary" href="' + slide.href + '">' + slide.cta + "</a>" +
      '<a class="btn btn--ghost" href="shop.html">همهٔ محصولات</a>' +
      "</div></div>" +
      '<div class="hero__media"><img src="' + slide.image + '" alt="' + slide.eyebrow + '"' +
      (index === 0 ? "" : ' loading="lazy"') + "></div>" +
      "</div></article>"
    );
  }).join("");

  const dots = HERO_SLIDES.map(function (_, index) {
    return '<button class="hero__dot' + (index === 0 ? " is-active" : "") +
      '" data-dot="' + index + '" aria-label="اسلاید ' + (index + 1) + '"></button>';
  }).join("");

  const controls = document.createElement("div");
  controls.className = "hero__controls";
  controls.innerHTML =
    '<button class="hero__arrow" data-hero-prev aria-label="اسلاید قبلی">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg></button>' +
    '<div class="hero__dots">' + dots + "</div>" +
    '<button class="hero__arrow" data-hero-next aria-label="اسلاید بعدی">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m15 6-6 6 6 6"/></svg></button>';
  container.appendChild(controls);

  let current = 0;
  let timer = null;
  const slides = container.querySelectorAll(".hero__slide");
  const dotEls = container.querySelectorAll(".hero__dot");

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dotEls.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(function () {
      goTo(current + 1);
    }, 6500);
  }

  container.querySelector("[data-hero-next]").addEventListener("click", function () {
    goTo(current + 1);
    restart();
  });

  container.querySelector("[data-hero-prev]").addEventListener("click", function () {
    goTo(current - 1);
    restart();
  });

  dotEls.forEach(function (dot) {
    dot.addEventListener("click", function () {
      goTo(Number(dot.getAttribute("data-dot")));
      restart();
    });
  });

  restart();
}

/* ---------- رندر محصولات صفحه اصلی ---------- */
function renderInto(selector, list) {
  const grid = document.querySelector(selector);
  if (!grid) return;
  grid.innerHTML = list.map(productCard).join("");
}

function newestFirst(a, b) {
  return a.addedAt < b.addedAt ? 1 : -1;
}

function renderNewProducts() {
  const list = PRODUCTS.slice().sort(newestFirst).slice(0, 8);
  renderInto("[data-products-new]", list);
}

function renderSaleProducts() {
  const list = PRODUCTS.filter(function (item) {
    return percentOff(item) > 0;
  })
    .sort(function (a, b) {
      return percentOff(b) - percentOff(a);
    })
    .slice(0, 8);
  renderInto("[data-products-sale]", list);
}

function renderBestSellers() {
  const list = PRODUCTS.slice()
    .sort(function (a, b) {
      return b.sales - a.sales;
    })
    .slice(0, 8);
  renderInto("[data-products-best]", list);
}

/* ---------- شمارش معکوس پیشنهاد ---------- */
/* ---------- فرم خبرنامه ---------- */
