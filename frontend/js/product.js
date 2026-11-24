

(() => {
  const app = $("#app");
  let selectedSize = null;

  const TYPE_LABELS = {
    shoe: "کفش",
    top: "لباس",
    pants: "شلوار",
    cold: "پاییز و زمستان",
    warm: "بهار و تابستان",
    bag: "کیف",
    watch: "ساعت",
  };

  const notFoundHTML = `
    <div class="pd-empty">
      <h1>این محصول پیدا نشد</h1>
      <p>ممکن است آدرس اشتباه باشد یا محصول از کاتالوگ حذف شده باشد.</p>
      <a class="pb" href="index.html">بازگشت به فروشگاه</a>
    </div>`;

  function setMeta(product) {
    document.title = `${product.title} | کدلاین`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        `${product.title} از ${product.brand} — ${formatNumber(finalPrice(product))} تومان در فروشگاه نمونه‌کار کدلاین.`,
      );
    }
  }

  function galleryHTML(product) {
    const image = productImage(product);
    return `
      <div class="pd__media">
        <div class="pd__img">
          ${
            image
              ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(product.title)}" width="600" height="800">`
              : `<span>${escapeHTML(product.emoji)}</span>`
          }
        </div>
        <p class="pd__note">تصویر نمونه است؛ این فروشگاه یک نمونه‌کار طراحی وب است.</p>
      </div>`;
  }

  function infoHTML(product, sizes) {
    const image = productImage(product);
    const off = product.discount > 0;
    const wished = Store.isWished(product.id);

    return `
      <div class="pd__info">
        <a class="pd__brand" href="category.html?gender=${product.gender}">${escapeHTML(product.brand)}</a>
        <h1>${escapeHTML(product.title)}</h1>
        <p class="pd__cat">${escapeHTML(GENDERS[product.gender].label)} · ${escapeHTML(TYPE_LABELS[product.type] || "")}</p>

        <div class="pd__price">
          ${off ? `<s>${formatNumber(product.price)}</s><i class="off">${formatNumber(product.discount)}٪</i>` : ""}
          <b>${formatNumber(finalPrice(product))} <small>تومان</small></b>
        </div>

        <div class="pd__sizes">
          <span>انتخاب سایز:</span>
          <div class="chips" id="pd-sizes">
            ${sizes
              .map(
                (size, index) =>
                  `<button class="${index === 0 ? "on" : ""}" data-size="${escapeHTML(size)}">${escapeHTML(size)}</button>`,
              )
              .join("")}
          </div>
        </div>

        <button class="pb" data-add>افزودن به سبد خرید</button>
        <button class="pd__wish" data-wish>${wished ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی"}</button>

        <div class="pd__desc">
          <h2>دربارهٔ این محصول</h2>
          <p>
            ${escapeHTML(product.desc || product.title + " از برند " + product.brand + "؛ انتخابی ساده برای استایل روزمره.")}
            این محصول بخشی از کاتالوگ نمونهٔ کدلاین است و موجودی واقعی ندارد.
          </p>
          <ul class="pd__perks">
            <li>۷ روز ضمانت بازگشت کالا</li>
            <li>ارسال سراسر کشور</li>
            <li>پشتیبانی از طریق پیج و ربات</li>
          </ul>
        </div>
      </div>`;
  }

  function relatedHTML(product) {
    const related = PRODUCTS.filter(
      (item) => item.id !== product.id && item.gender === product.gender,
    ).slice(0, 6);

    if (!related.length) return "";

    return `
      <section class="sec" style="padding-inline:4%">
        <div class="sh"><h3>محصولات مرتبط</h3><hr></div>
        <div class="rail">${related.map(UI.productCard).join("")}</div>
      </section>`;
  }

  function bindEvents(product, sizes) {
    selectedSize = sizes[0];

    $("#pd-sizes")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-size]");
      if (!button) return;
      selectedSize = button.dataset.size;
      $$("#pd-sizes button").forEach((item) =>
        item.classList.toggle("on", item === button),
      );
    });

    $("[data-add]")?.addEventListener("click", () => {
      Store.addToCart(product.id, selectedSize);
      UI.toast("به سبد خرید اضافه شد");
    });

    const wish = $("[data-wish]");
    wish?.addEventListener("click", () => {
      const added = Store.toggleWish(product.id);
      wish.textContent = added ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی";
    });
  }

  async function start() {
    await loadCatalog();

    const product = getProduct(Number(getParam("id")));

    if (!product) {
      UI.mount({ active: "all" });
      app.innerHTML = notFoundHTML + UI.footerHTML();
      return;
    }

    setMeta(product);

    const sizes = UI.sizesFor(product);
    UI.mount({ active: product.gender });

    app.innerHTML = `
      <nav class="pd-crumbs" aria-label="مسیر صفحه">
        <a href="index.html">خانه</a><span>‹</span>
        <a href="category.html?gender=${product.gender}">${escapeHTML(GENDERS[product.gender].label)}</a><span>‹</span>
        <strong>${escapeHTML(product.title)}</strong>
      </nav>
      <div class="pd">
        ${galleryHTML(product)}
        ${infoHTML(product, sizes)}
      </div>
      ${relatedHTML(product)}
      ${UI.footerHTML()}`;

    bindEvents(product, sizes);
  }

  start();
})();
