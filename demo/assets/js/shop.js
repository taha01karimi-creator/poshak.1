/* ============================================
   صفحه فروشگاه: فیلتر، مرتب‌سازی و نوع نمایش
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const startCat = params.get("cat");
  const startSort = params.get("sort");
  const startSearch = params.get("q");

  /* وضعیت فیلترها */
  const state = {
    cats: new Set(),
    sizes: new Set(),
    colors: new Set(),
    maxPrice: 9000000,
    saleOnly: false,
    sort: "newest",
    search: (startSearch || "").trim(),
    view: "grid"
  };

  if (startCat && CATEGORIES.some(function (c) { return c.id === startCat; })) {
    state.cats.add(startCat);
  }
  if (startSort) state.sort = startSort;

  /* ---------- ساخت کنترل‌های فیلتر ---------- */

  const catsBox = document.querySelector("[data-filter-cats]");
  catsBox.innerHTML = CATEGORIES.map(function (cat) {
    const count = PRODUCTS.filter(function (p) { return p.category === cat.id; }).length;
    return (
      '<label class="check">' +
      '<input type="checkbox" value="' + cat.id + '" data-cat>' +
      '<span class="check__box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></span>' +
      cat.title + "<em>" + faNum(count) + "</em></label>"
    );
  }).join("");

  /* سایزها: همهٔ سایزهای موجود در محصولات */
  const allSizes = [];
  PRODUCTS.forEach(function (p) {
    p.sizes.forEach(function (size) {
      if (allSizes.indexOf(size) === -1) allSizes.push(size);
    });
  });
  const sizeOrder = ["S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38", "فری‌سایز"];
  allSizes.sort(function (a, b) {
    return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
  });

  const sizesBox = document.querySelector("[data-filter-sizes]");
  sizesBox.innerHTML = allSizes.map(function (size) {
    return '<button type="button" class="size-chip" data-size="' + size + '">' + size + "</button>";
  }).join("");

  /* رنگ‌ها: فقط رنگ‌های موجود در محصولات */
  const usedColors = [];
  PRODUCTS.forEach(function (p) {
    p.colors.forEach(function (color) {
      if (usedColors.indexOf(color) === -1) usedColors.push(color);
    });
  });

  const colorsBox = document.querySelector("[data-filter-colors]");
  colorsBox.innerHTML = usedColors.map(function (key) {
    const color = COLORS[key];
    return '<button type="button" class="color-chip" data-color="' + key +
      '" style="background:' + color.hex + '" title="' + color.name +
      '" aria-label="' + color.name + '"></button>';
  }).join("");

  const priceInput = document.querySelector("[data-filter-price]");
  const priceLabel = document.querySelector("[data-price-label]");
  const saleCheck = document.querySelector("[data-filter-sale]");
  const sortSelect = document.querySelector("[data-sort]");
  const countEl = document.querySelector("[data-result-count]");
  const titleEl = document.querySelector("[data-page-title]");
  const crumbEl = document.querySelector("[data-crumb]");
  const descEl = document.querySelector("[data-page-desc]");

  sortSelect.value = state.sort;

  /* ---------- فیلتر و رندر ---------- */

  function matches(product) {
    if (state.cats.size && !state.cats.has(product.category)) return false;
    if (state.maxPrice < 9000000 && product.price > state.maxPrice) return false;
    if (state.saleOnly && percentOff(product) === 0) return false;
    if (state.search && product.name.indexOf(state.search) === -1) return false;

    if (state.sizes.size) {
      const hasSize = product.sizes.some(function (size) {
        return state.sizes.has(size);
      });
      if (!hasSize) return false;
    }

    if (state.colors.size) {
      const hasColor = product.colors.some(function (color) {
        return state.colors.has(color);
      });
      if (!hasColor) return false;
    }

    return true;
  }

  function sortList(list) {
    const sorted = list.slice();
    switch (state.sort) {
      case "cheap":
        return sorted.sort(function (a, b) { return a.price - b.price; });
      case "expensive":
        return sorted.sort(function (a, b) { return b.price - a.price; });
      case "popular":
        return sorted.sort(function (a, b) { return b.sales - a.sales; });
      case "discount":
        return sorted.sort(function (a, b) { return percentOff(b) - percentOff(a); });
      default:
        return sorted.sort(function (a, b) {
          return a.addedAt < b.addedAt ? 1 : -1;
        });
    }
  }

  function render() {
    const list = sortList(PRODUCTS.filter(matches));

    countEl.textContent = faNum(list.length);
    grid.classList.toggle("is-list", state.view === "list");

    if (!list.length) {
      grid.innerHTML =
        '<div class="no-result"><strong>محصولی با این فیلترها پیدا نشد</strong>' +
        "فیلترها را تغییر دهید یا همه را حذف کنید.</div>";
    } else {
      grid.innerHTML = list.map(productCard).join("");
    }
  }

  function syncHeader() {
    const cat = Array.from(state.cats)[0];
    if (state.cats.size === 1) {
      const title = categoryTitle(cat);
      titleEl.textContent = title;
      crumbEl.textContent = title;
      descEl.textContent = "محصولات دستهٔ «" + title + "»؛ همه با ارسال سریع و امکان بازگشت تا ۷ روز.";
      document.title = title + " | کدلاین";
    } else {
      titleEl.textContent = "لباس مردانه";
      crumbEl.textContent = "لباس مردانه";
      descEl.textContent =
        "مجموعه‌ای از پوشاک ساده و کاربردی با پارچه‌های طبیعی. برای پیدا کردن سریع‌تر، از فیلترهای سمت راست استفاده کنید.";
      document.title = "فروشگاه | کدلاین";
    }
  }

  /* ---------- رویدادها ---------- */

  catsBox.addEventListener("change", function (event) {
    const box = event.target.closest("[data-cat]");
    if (!box) return;
    if (box.checked) state.cats.add(box.value);
    else state.cats.delete(box.value);
    syncHeader();
    render();
  });

  sizesBox.addEventListener("click", function (event) {
    const chip = event.target.closest("[data-size]");
    if (!chip) return;
    const size = chip.getAttribute("data-size");
    if (state.sizes.has(size)) {
      state.sizes.delete(size);
      chip.classList.remove("is-active");
    } else {
      state.sizes.add(size);
      chip.classList.add("is-active");
    }
    render();
  });

  colorsBox.addEventListener("click", function (event) {
    const chip = event.target.closest("[data-color]");
    if (!chip) return;
    const color = chip.getAttribute("data-color");
    if (state.colors.has(color)) {
      state.colors.delete(color);
      chip.classList.remove("is-active");
    } else {
      state.colors.add(color);
      chip.classList.add("is-active");
    }
    render();
  });

  priceInput.addEventListener("input", function () {
    state.maxPrice = Number(priceInput.value);
    const isMax = state.maxPrice >= Number(priceInput.max);
    priceLabel.textContent = isMax ? "بدون محدودیت" : toman(state.maxPrice);
    render();
  });

  saleCheck.addEventListener("change", function () {
    state.saleOnly = saleCheck.checked;
    render();
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    render();
  });

  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.view = btn.getAttribute("data-view");
      document.querySelectorAll("[data-view]").forEach(function (other) {
        other.classList.toggle("is-active", other === btn);
      });
      render();
    });
  });

  document.querySelector("[data-reset]").addEventListener("click", function () {
    state.cats.clear();
    state.sizes.clear();
    state.colors.clear();
    state.maxPrice = 9000000;
    state.saleOnly = false;

    catsBox.querySelectorAll("input").forEach(function (input) { input.checked = false; });
    sizesBox.querySelectorAll(".size-chip").forEach(function (chip) { chip.classList.remove("is-active"); });
    colorsBox.querySelectorAll(".color-chip").forEach(function (chip) { chip.classList.remove("is-active"); });
    saleCheck.checked = false;
    priceInput.value = 9000000;
    priceLabel.textContent = "بدون محدودیت";

    syncHeader();
    render();
  });

  /* باز و بسته کردن فیلتر در موبایل */
  const filters = document.querySelector("[data-filters]");
  const backdrop = document.querySelector("[data-filters-backdrop]");
  const openBtn = document.querySelector("[data-filters-open]");
  const closeBtn = document.querySelector("[data-filters-close]");

  function setFilters(open) {
    filters.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtn.addEventListener("click", function () { setFilters(true); });
  closeBtn.addEventListener("click", function () { setFilters(false); });
  backdrop.addEventListener("click", function () { setFilters(false); });

  /* مقدار اولیه */
  catsBox.querySelectorAll("[data-cat]").forEach(function (input) {
    input.checked = state.cats.has(input.value);
  });
  priceLabel.textContent = "بدون محدودیت";

  syncHeader();
  render();
});
