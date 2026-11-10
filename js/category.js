/* صفحه‌ی دسته‌بندی: category.html?gender=men | women | kids */

(() => {
  const gender = getParam("gender");
  const info = GENDERS[gender];

  // اگر پارامتر نامعتبر بود، به صفحه‌ی اصلی برگرد
  if (!info) {
    location.replace("index.html");
    return;
  }

  document.title = `استایل ${info.label} | دیجی‌استایل`;

  const SORTERS = {
    default: null,
    cheapest: (a, b) => finalPrice(a) - finalPrice(b),
    expensive: (a, b) => finalPrice(b) - finalPrice(a),
    discount: (a, b) => b.discount - a.discount,
  };

  const filters = { sort: "default", onlyDiscount: false };
  const app = $("#app");

  function productsOfType(type) {
    let list = PRODUCTS.filter((p) => p.gender === gender && p.type === type);
    if (filters.onlyDiscount) list = list.filter((p) => p.discount > 0);
    if (SORTERS[filters.sort]) list = [...list].sort(SORTERS[filters.sort]);
    return list;
  }

  function rowsHTML() {
    return SECTIONS.map(({ type, title }) => {
      const label =
        type === "cold" || type === "warm" ? title : `${title} ${info.label}`;
      return (
        UI.railSection(label, productsOfType(type)) ||
        `<section class="sec"><div class="sh"><h3>${label}</h3><hr></div><p class="empty">محصولی با این فیلتر پیدا نشد.</p></section>`
      );
    }).join("");
  }

  function render() {
    const total = PRODUCTS.filter(
      (p) => p.gender === gender && p.type !== "acc",
    ).length;

    app.innerHTML = `
      <div class="cat-hero" style="background:${info.gradient}">
        <div>
          <h1>استایل ${info.label}</h1>
          <p>${formatNumber(total)} کالا در ۵ دسته‌ی کفش، لباس، شلوار و لباس‌های فصلی</p>
        </div>
        <div class="em">${info.emoji}</div>
      </div>

      <div class="pills">
        ${Object.entries(GENDERS)
          .map(
            ([key, g]) =>
              `<a href="category.html?gender=${key}" class="${key === gender ? "on" : ""}">${g.label}</a>`,
          )
          .join("")}
      </div>

      <div class="toolbar">
        <label>مرتب‌سازی:
          <select id="sort">
            <option value="default">پیش‌فرض</option>
            <option value="cheapest">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
            <option value="discount">بیشترین تخفیف</option>
          </select>
        </label>
        <label><input type="checkbox" id="onlyDiscount"> فقط کالاهای تخفیف‌دار</label>
      </div>

      <div id="rows">${rowsHTML()}</div>
      ${UI.footerHTML()}`;

    $("#sort").addEventListener("change", (e) => {
      filters.sort = e.target.value;
      $("#rows").innerHTML = rowsHTML();
    });

    $("#onlyDiscount").addEventListener("change", (e) => {
      filters.onlyDiscount = e.target.checked;
      $("#rows").innerHTML = rowsHTML();
    });
  }

  UI.mount({ active: gender });
  render();
})();
