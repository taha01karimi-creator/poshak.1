/* صفحه‌ی اصلی */

(() => {
  const SLIDES = [
    {
      tag: "Leather Style",
      title: "انواع محصولات چرمی زنانه و مردانه",
      img: "images/hero/leather.jpg",
      tint: "#241a12",
      link: "category.html?gender=men",
    },
    {
      tag: "Fall Style",
      title: "کلکسیون پاییزه با تخفیف ویژه",
      img: "images/hero/fall.jpg",
      tint: "#3f251e",
      link: "category.html?gender=women",
    },
    {
      tag: "Sport & Travel",
      title: "ورزش و سفر با بهترین برندها",
      img: "images/hero/sport.jpg",
      tint: "#223849",
      link: "category.html?gender=men",
    },
    {
      tag: "Kids Style",
      title: "مد بچگانه، شاد و رنگی",
      img: "images/hero/kids.jpg",
      tint: "#6b4a24",
      link: "category.html?gender=kids",
    },
  ];

  const CATEGORY_CIRCLES = [
    { label: "کفش", img: "images/products/shoe.jpg", query: "کفش" },
    { label: "تیشرت", img: "images/categories/tshirt.jpg", query: "تیشرت" },
    { label: "شلوار", img: "images/categories/pants.jpg", query: "شلوار" },
    { label: "بافت", img: "images/categories/knit.jpg", query: "بافت" },
    { label: "کاپشن", img: "images/categories/jacket.jpg", query: "کاپشن" },
    { label: "کیف", img: "images/categories/bag.jpg", query: "کیف" },
    { label: "ساعت", img: "images/categories/watch.jpg", query: "ساعت" },
  ];

  const BRAND_TILES = [
    ["کدلاین بیسیک", "#3f6a58", "images/brands/columbia.jpg"],
    ["نووا", "#a8563f", "images/brands/lcwaikiki.jpg"],
    ["رها", "#3d5a6b", "images/brands/defacto.jpg"],
    ["آرکا", "#2f3a34", "images/brands/nike.jpg"],
    ["تیارا", "#7a5c3e", "images/brands/elsa.jpg"],
    ["کدلاین کیدز", "#5f4a72", "images/brands/easy2.jpg"],
  ];

  const BRAND_TABS = ["نووا", "رها", "تیارا"];
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
        <div class="slide ${i === 0 ? "on" : ""}"
             style="background-image:linear-gradient(to left,${s.tint}f2 6%,${s.tint}9c 42%,${s.tint}00 80%),url('${s.img}');background-size:cover;background-position:center">
          <div class="t">
            <div class="tag">${s.tag}</div>
            <h2>${s.title}</h2>
            <a class="btn" href="${s.link}">خرید</a>
          </div>
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
          <div class="c"><img src="${c.img}" alt="${c.label}" loading="lazy"></div>${c.label}
        </div>`,
      ).join("")}
    </div>`;

  const brandsHTML = () => `
    <h2 class="h2">برندهای منتخب</h2>
    <div class="brands">
      ${BRAND_TILES.map(
        ([name, color, img]) => `
        <div class="brand" data-action="search" data-query="${name}"
             style="background-image:linear-gradient(to top,${color}e6 4%,${color}55 45%,${color}00 85%),url('${img}');background-size:cover;background-position:center">
          <span>${name}</span>
        </div>`,
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
        <a href="category.html?gender=${key}"
           style="background-image:linear-gradient(to top,#0b0b0be0 2%,#0b0b0b40 55%,#0b0b0b00 90%),url('${g.image}');background-size:cover;background-position:center">
          استایل ${g.label}
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
      UI.railSection("کیف", ofType("bag")),
      UI.railSection("ساعت", ofType("watch")),
      UI.railSection("بهار و تابستان", ofType("warm")),
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

  async function start() {
    // کاتالوگ از API خوانده می‌شود؛ اگر سرور در دسترس نباشد دادهٔ نمونه می‌ماند
    await loadCatalog();
    UI.mount({ active: currentTab, onTabChange: changeTab });
    render();
    setInterval(tickCountdown, 1000);
  }

  start();
})();
