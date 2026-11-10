/* صفحه‌ی اصلی */

(() => {
  const SLIDES = [
    {
      tag: "Leather Style",
      title: "انواع محصولات چرمی زنانه و مردانه",
      emoji: "🧥",
      link: "category.html?gender=men",
      gradient: "linear-gradient(110deg,#d8a878,#8a5a32 70%,#5b3a1f)",
    },
    {
      tag: "Fall Style",
      title: "کلکسیون پاییزه با تخفیف ویژه",
      emoji: "🧣",
      link: "category.html?gender=women",
      gradient: "linear-gradient(110deg,#7a1f3a,#3d0f20)",
    },
    {
      tag: "Sport & Travel",
      title: "ورزش و سفر با بهترین برندها",
      emoji: "👟",
      link: "category.html?gender=men",
      gradient: "linear-gradient(110deg,#2f6f8f,#143a52)",
    },
    {
      tag: "Kids Style",
      title: "مد بچگانه، شاد و رنگی",
      emoji: "🧒",
      link: "category.html?gender=kids",
      gradient: "linear-gradient(110deg,#e7a53a,#c4552b)",
    },
  ];

  const CATEGORY_CIRCLES = [
    { label: "بافت و پلیور", emoji: "🧶", query: "بافت" },
    { label: "شلوار", emoji: "👖", query: "شلوار" },
    { label: "کاپشن", emoji: "🧥", query: "کاپشن" },
    { label: "کیف", emoji: "👜", query: "کیف" },
    { label: "ساعت", emoji: "⌚", query: "ساعت" },
    { label: "تیشرت", emoji: "👕", query: "شرت" },
  ];

  const BRAND_TILES = [
    ["کلمبیا", "#35566b"],
    ["ال سی وایکیکی", "#a8322d"],
    ["دیفکتو", "#2b3a55"],
    ["نایکی", "#222222"],
    ["السا", "#6b4a2f"],
    ["ایزی دو", "#5a3a6b"],
  ];

  const BRAND_TABS = ["ال سی وایکیکی", "دیفکتو", "نایکی"];
  const VALID_TABS = ["all", "women", "men", "kids"];

  const app = $("#app");
  let currentTab = VALID_TABS.includes(getParam("tab"))
    ? getParam("tab")
    : "all";
  let currentBrand = BRAND_TABS[0];
  let slider = null;

  /* ---------- اسلایدر ---------- */

  class HeroSlider {
    constructor(root, delay = 5000) {
      this.root = root;
      this.slides = $$(".slide", root);
      this.dots = $$(".dots i", root);
      this.delay = delay;
      this.index = 0;
      this.timer = null;
      this.bindEvents();
      this.play();
    }

    show(i) {
      this.index = (i + this.slides.length) % this.slides.length;
      this.slides.forEach((s, n) => s.classList.toggle("on", n === this.index));
      this.dots.forEach((d, n) => d.classList.toggle("on", n === this.index));
    }

    play() {
      this.stop();
      this.timer = setInterval(() => this.show(this.index + 1), this.delay);
    }

    stop() {
      clearInterval(this.timer);
    }

    bindEvents() {
      this.root.addEventListener("mouseenter", () => this.stop());
      this.root.addEventListener("mouseleave", () => this.play());

      this.root.addEventListener("click", (e) => {
        const step = e.target.closest("[data-step]");
        const dot = e.target.closest("[data-goto]");
        if (step) this.show(this.index + +step.dataset.step);
        if (dot) this.show(+dot.dataset.goto);
      });

      let startX = 0;
      this.root.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
      });
      this.root.addEventListener("touchend", (e) => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 50) this.show(this.index + (diff > 0 ? -1 : 1));
      });
    }
  }

  /* ---------- بخش‌ها ---------- */

  const heroHTML = () => `
    <div class="hero" id="hero">
      ${SLIDES.map(
        (s, i) => `
        <div class="slide ${i === 0 ? "on" : ""}" style="background:${s.gradient}">
          <div class="t">
            <div class="tag">${s.tag}</div>
            <h2>${s.title}</h2>
            <a class="btn" href="${s.link}">خرید</a>
          </div>
          <div class="em">${s.emoji}</div>
        </div>`,
      ).join("")}
      <button class="hn" style="right:14px" data-step="-1">›</button>
      <button class="hn" style="left:14px" data-step="1">‹</button>
      <div class="dots">${SLIDES.map((_, i) => `<i class="${i === 0 ? "on" : ""}" data-goto="${i}"></i>`).join("")}</div>
    </div>`;

  const categoriesHTML = () => `
    <div class="cats">
      ${CATEGORY_CIRCLES.map(
        (c) => `
        <div class="cat" data-action="search" data-query="${c.query}">
          <div class="c">${c.emoji}</div>${c.label}
        </div>`,
      ).join("")}
    </div>`;

  const brandsHTML = () => `
    <h2 class="h2">برندهای منتخب</h2>
    <div class="brands">
      ${BRAND_TILES.map(
        ([name, color]) => `
        <div class="brand" data-action="search" data-query="${name}"
             style="background:linear-gradient(160deg,${color},#000a)">${name}</div>`,
      ).join("")}
    </div>`;

  const dealsHTML = (list) => {
    const deals = list.filter((p) => p.discount >= 15);
    if (!deals.length) return "";
    const section = UI.railSection("خوش‌قیمت‌های امروز 🏷️", deals, {
      extra: '<span class="cd" id="countdown"></span>',
    });
    return `<div class="deal">${section}</div>`;
  };

  const brandTabsHTML = () => `
    <div class="sec">
      <div class="sh"><h3>برندهای محبوب</h3><hr></div>
      <div class="bt">
        ${BRAND_TABS.map((b) => `<button class="${b === currentBrand ? "on" : ""}" data-brand="${b}">${b}</button>`).join("")}
      </div>
    </div>
    <div id="brandRail">${brandRailHTML()}</div>`;

  function brandRailHTML() {
    const byBrand = (p) => p.brand === currentBrand;
    let items = PRODUCTS.filter(
      (p) => byBrand(p) && (currentTab === "all" || p.gender === currentTab),
    );
    if (!items.length) items = PRODUCTS.filter(byBrand);
    return UI.railSection("", items);
  }

  const bannersHTML = () => `
    <div class="ban">
      ${Object.entries(GENDERS)
        .map(
          ([key, g]) => `
        <a href="category.html?gender=${key}" style="background:${g.gradient}">
          <span>${g.emoji}</span>استایل ${g.label}
        </a>`,
        )
        .join("")}
    </div>`;

  /* ---------- رندر اصلی ---------- */

  function render() {
    const list = PRODUCTS.filter(
      (p) => currentTab === "all" || p.gender === currentTab,
    );
    const ofType = (type) => list.filter((p) => p.type === type);

    if (slider) slider.stop();

    app.innerHTML = [
      heroHTML(),
      categoriesHTML(),
      brandsHTML(),
      dealsHTML(list),
      UI.railSection("پاییز و زمستان", ofType("cold")),
      UI.railSection("کفش", ofType("shoe")),
      UI.railSection("لباس", ofType("top")),
      UI.railSection("شلوار", ofType("pants")),
      UI.railSection("کیف و ساعت", ofType("acc")),
      brandTabsHTML(),
      bannersHTML(),
      UI.footerHTML(),
    ].join("");

    slider = new HeroSlider($("#hero"));
  }

  function changeTab(tab) {
    currentTab = tab;
    UI.setActiveTab(tab);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // آدرس صفحه را هم به‌روز می‌کنیم؛ روی file:// ممکن است مرورگر اجازه ندهد
    try {
      history.replaceState(
        null,
        "",
        tab === "all" ? "index.html" : `?tab=${tab}`,
      );
    } catch (error) {}
  }

  /* ---------- شمارش معکوس تا پایان روز ---------- */

  function tickCountdown() {
    const el = $("#countdown");
    if (!el) return;

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const left = Math.floor((midnight - now) / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    el.textContent = `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  }

  /* ---------- شروع ---------- */

  app.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-brand]");
    if (!tab) return;
    currentBrand = tab.dataset.brand;
    $$(".bt button").forEach((b) => b.classList.toggle("on", b === tab));
    $("#brandRail").innerHTML = brandRailHTML();
  });

  UI.mount({ active: currentTab, onTabChange: changeTab });
  render();
  setInterval(tickCountdown, 1000);
})();
