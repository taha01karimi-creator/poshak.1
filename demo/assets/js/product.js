/* ============================================
   صفحه محصول: گالری، انتخاب رنگ و سایز، تب‌ها
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector("[data-product]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const product = productById(params.get("id"));

  /* اگر شناسهٔ محصول معتبر نباشد */
  if (!product) {
    root.innerHTML =
      '<div class="empty" style="grid-column:1/-1">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      "<h2>این محصول پیدا نشد</h2>" +
      "<p>ممکن است آدرس اشتباه باشد یا محصول از فروشگاه حذف شده باشد.</p>" +
      '<a class="btn btn--primary" href="shop.html">رفتن به فروشگاه</a>' +
      "</div>";
    return;
  }

  const off = percentOff(product);
  const color = product.colors[0];
  const size = product.sizes[0];

  document.title = product.name + " | کدلاین";
  const crumb = document.querySelector("[data-crumb-product]");
  if (crumb) crumb.textContent = product.name;

  const colorOptions = product.colors
    .map(function (key) {
      const info = COLORS[key];
      return '<button type="button" class="color-btn' + (key === color ? " is-active" : "") +
        '" data-color="' + key + '" style="background:' + info.hex +
        '" title="' + info.name + '" aria-label="رنگ ' + info.name + '"></button>';
    })
    .join("");

  const sizeOptions = product.sizes
    .map(function (item) {
      return '<button type="button" class="size-btn' + (item === size ? " is-active" : "") +
        '" data-size="' + item + '">' + item + "</button>";
    })
    .join("");

  const perks = [
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
      label: "ارسال رایگان بالای ۵ میلیون"
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
      label: "۷ روز ضمانت بازگشت"
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
      label: "ضمانت اصالت و کیفیت"
    }
  ];

  root.innerHTML =
    '<div class="gallery">' +
    '<div class="gallery__thumbs" data-thumbs>' +
    product.images
      .map(function (src, index) {
        return '<button type="button" class="gallery__thumb' + (index === 0 ? " is-active" : "") +
          '" data-thumb="' + index + '"><img src="' + src + '" alt="' +
          product.name + ' تصویر ' + (index + 1) + '"></button>';
      })
      .join("") +
    "</div>" +
    '<div class="gallery__main">' +
    '<img src="' + product.images[0] + '" alt="' + product.name + '" data-main-img>' +
    '<span class="gallery__zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg></span>' +
    "</div></div>" +

    '<div class="product__info">' +
    '<span class="product__cat">' + categoryTitle(product.category) + "</span>" +
    '<h1 class="product__title">' + product.name + "</h1>" +
    '<div class="product__meta">' +
    starsHtml(product.rating) +
    "<span>(" + faNum(product.reviews) + " نظر)</span>" +
    "<span>کد کالا: " + product.id.toUpperCase() + "</span>" +
    "</div>" +

    '<div class="product__price">' +
    (off ? '<span class="price-old" style="font-size:14px">' + faNum(product.oldPrice) + "</span>" : "") +
    '<span class="price">' + faNum(product.price) + "<small>تومان</small></span>" +
    (off ? '<span class="save-badge">٪' + faNum(off) + " تخفیف</span>" : "") +
    "</div>" +

    '<div class="option">' +
    '<div class="option__head"><span>رنگ: <b data-color-name>' + COLORS[color].name + "</b></span></div>" +
    '<div class="color-list" data-colors>' + colorOptions + "</div>" +
    "</div>" +

    '<div class="option">' +
    '<div class="option__head"><span>سایز: <b data-size-name>' + size + "</b></span><span>راهنما در پایین</span></div>" +
    '<div class="size-list" data-sizes>' + sizeOptions + "</div>" +
    '<details class="size-guide">' +
    "<summary>جدول اندازه‌ها (سانتی‌متر)</summary>" +
    "<table><thead><tr><th>سایز</th><th>دور سینه</th><th>دور کمر</th><th>قد</th></tr></thead><tbody>" +
    "<tr><td>S</td><td>۹۶</td><td>۸۲</td><td>۶۶</td></tr>" +
    "<tr><td>M</td><td>۱۰۲</td><td>۸۸</td><td>۶۸</td></tr>" +
    "<tr><td>L</td><td>۱۰۸</td><td>۹۴</td><td>۷۰</td></tr>" +
    "<tr><td>XL</td><td>۱۱۴</td><td>۱۰۰</td><td>۷۲</td></tr>" +
    "<tr><td>XXL</td><td>۱۲۰</td><td>۱۰۶</td><td>۷۴</td></tr>" +
    "</tbody></table></details>" +
    "</div>" +

    '<div class="option">' +
    '<div class="option__head"><span>تعداد</span></div>' +
    '<div class="qty" data-qty>' +
    '<button type="button" data-qty-plus aria-label="افزایش">+</button>' +
    '<span data-qty-value>۱</span>' +
    '<button type="button" data-qty-minus aria-label="کاهش">−</button>' +
    "</div></div>" +

    '<div class="buy-row">' +
    '<button class="btn btn--primary" type="button" data-buy>افزودن به سبد خرید</button>' +
    '<button class="btn btn--ghost" type="button" data-wish-product aria-label="افزودن به علاقه‌مندی">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.7-7.7 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>' +
    "</button></div>" +

    '<div class="product__note">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>' +
    "<span>موجود در انبار · ارسال سفارش‌های ثبت‌شده تا ساعت ۱۴ در همان روز کاری انجام می‌شود.</span>" +
    "</div>" +

    '<div class="product__perks">' +
    perks
      .map(function (perk) {
        return '<div class="perk">' + perk.icon + "<span>" + perk.label + "</span></div>";
      })
      .join("") +
    "</div>" +
    "</div>";

  /* ---------- رفتارهای صفحه ---------- */

  let currentColor = color;
  let currentSize = size;
  let qty = 1;

  /* گالری */
  const mainImage = root.querySelector("[data-main-img]");
  root.querySelector("[data-thumbs]").addEventListener("click", function (event) {
    const thumb = event.target.closest("[data-thumb]");
    if (!thumb) return;

    const index = Number(thumb.getAttribute("data-thumb"));
    mainImage.src = product.images[index];
    mainImage.alt = product.name + " تصویر " + (index + 1);

    root.querySelectorAll(".gallery__thumb").forEach(function (item) {
      item.classList.toggle("is-active", item === thumb);
    });
  });

  /* رنگ */
  root.querySelector("[data-colors]").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-color]");
    if (!btn) return;

    currentColor = btn.getAttribute("data-color");
    root.querySelector("[data-color-name]").textContent = COLORS[currentColor].name;
    root.querySelectorAll(".color-btn").forEach(function (item) {
      item.classList.toggle("is-active", item === btn);
    });
  });

  /* سایز */
  root.querySelector("[data-sizes]").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-size]");
    if (!btn) return;

    currentSize = btn.getAttribute("data-size");
    root.querySelector("[data-size-name]").textContent = currentSize;
    root.querySelectorAll(".size-btn").forEach(function (item) {
      item.classList.toggle("is-active", item === btn);
    });
  });

  /* تعداد */
  const qtyValue = root.querySelector("[data-qty-value]");
  root.querySelector("[data-qty-plus]").addEventListener("click", function () {
    qty = Math.min(10, qty + 1);
    qtyValue.textContent = faNum(qty);
  });
  root.querySelector("[data-qty-minus]").addEventListener("click", function () {
    qty = Math.max(1, qty - 1);
    qtyValue.textContent = faNum(qty);
  });

  /* افزودن به سبد */
  root.querySelector("[data-buy]").addEventListener("click", function () {
    addToCart(product.id, currentSize, currentColor, qty);
  });

  /* علاقه‌مندی */
  const wishBtn = root.querySelector("[data-wish-product]");
  if (isWished(product.id)) {
    wishBtn.classList.add("is-active");
    wishBtn.style.color = "var(--brand)";
    wishBtn.style.borderColor = "var(--brand)";
  }

  wishBtn.addEventListener("click", function () {
    const active = toggleWish(product.id);
    wishBtn.classList.toggle("is-active", active);
    wishBtn.style.color = active ? "var(--brand)" : "";
    wishBtn.style.borderColor = active ? "var(--brand)" : "";
  });

  /* ---------- تب‌های اطلاعات ---------- */
  const tabsWrap = document.querySelector("[data-product-tabs]");
  const saved = off ? product.oldPrice - product.price : 0;

  tabsWrap.innerHTML =
    '<div class="tabs-line" role="tablist">' +
    '<button class="is-active" data-tab="desc" role="tab">توضیحات محصول</button>' +
    '<button data-tab="specs" role="tab">مشخصات</button>' +
    '<button data-tab="reviews" role="tab">نظرات (' + faNum(product.reviews) + ")</button>" +
    "</div>" +
    '<div class="tab-panels">' +
    '<div class="tab-panel is-active" data-panel="desc">' +
    '<h3>دربارهٔ این محصول</h3><p>' + product.desc + "</p>" +
    "<h3>نکات نگهداری</h3>" +
    "<p>شست‌وشو با آب سرد و مواد شویندهٔ ملایم، خشک کردن در سایه و اتوی با حرارت متوسط. از سفیدکننده استفاده نکنید تا رنگ پارچه ثابت بماند.</p>" +
    "</div>" +
    '<div class="tab-panel" data-panel="specs">' +
    '<dl class="specs">' +
    "<div><dt>دسته‌بندی</dt><dd>" + categoryTitle(product.category) + "</dd></div>" +
    "<div><dt>جنس</dt><dd>" + product.material + "</dd></div>" +
    "<div><dt>فرم</dt><dd>" + product.fit + "</dd></div>" +
    "<div><dt>سایزهای موجود</dt><dd>" + product.sizes.join(" / ") + "</dd></div>" +
    "<div><dt>رنگ‌ها</dt><dd>" + product.colors.map(function (key) { return COLORS[key].name; }).join(" / ") + "</dd></div>" +
    "<div><dt>کشور تولید</dt><dd>ایران</dd></div>" +
    "<div><dt>کد کالا</dt><dd>" + product.id.toUpperCase() + "</dd></div>" +
    "<div><dt>گارانتی</dt><dd>۷ روز بازگشت کالا</dd></div>" +
    "</dl>" +
    (saved ? '<p style="margin-top:16px">با خرید این محصول ' + toman(saved) + " صرفه‌جویی می‌کنید.</p>" : "") +
    "</div>" +
    '<div class="tab-panel" data-panel="reviews">' +
    '<div class="review"><div class="review__head"><span class="avatar">م</span><div><div class="review__name">مهدی رضایی</div>' +
    starsHtml(5) + '</div><span class="review__date">۱۲ آبان ۱۴۰۵</span></div>' +
    "<p>کیفیت پارچه از انتظارم بهتر بود و سایز دقیقاً مطابق جدول است. بعد از دو بار شست‌وشو هم فرم خودش را حفظ کرده.</p></div>" +
    '<div class="review"><div class="review__head"><span class="avatar">س</span><div><div class="review__name">سعید کاظمی</div>' +
    starsHtml(4) + '</div><span class="review__date">۵ آبان ۱۴۰۵</span></div>' +
    "<p>رنگش خیلی نزدیک به عکس است و دوخت تمیزی دارد. کمی گشادتر از حد معمول است، اگر بدنتان لاغر است یک سایز کوچک‌تر بگیرید.</p></div>" +
    '<div class="review"><div class="review__head"><span class="avatar">ا</span><div><div class="review__name">امیر توکلی</div>' +
    starsHtml(5) + '</div><span class="review__date">۲۸ مهر ۱۴۰۵</span></div>' +
    "<p>ارسال سریع بود و بسته‌بندی مرتب. برای استفادهٔ روزمره انتخاب خوبی است، حتماً باز هم خرید می‌کنم.</p></div>" +
    "</div>" +
    "</div>";

  tabsWrap.hidden = false;

  tabsWrap.querySelector(".tabs-line").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-tab]");
    if (!btn) return;

    const name = btn.getAttribute("data-tab");
    tabsWrap.querySelectorAll("[data-tab]").forEach(function (item) {
      item.classList.toggle("is-active", item === btn);
    });
    tabsWrap.querySelectorAll("[data-panel]").forEach(function (panel) {
      panel.classList.toggle("is-active", panel.getAttribute("data-panel") === name);
    });
  });

  /* ---------- محصولات مرتبط ---------- */
  const related = document.querySelector("[data-related]");
  const others = PRODUCTS.filter(function (item) {
    return item.id !== product.id;
  });
  const sameCategory = others.filter(function (item) {
    return item.category === product.category;
  });
  const rest = others.filter(function (item) {
    return item.category !== product.category;
  });

  related.innerHTML = sameCategory.concat(rest).slice(0, 4).map(productCard).join("");
});
