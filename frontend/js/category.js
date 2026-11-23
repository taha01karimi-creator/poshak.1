/* صفحه‌ی دسته‌بندی: category.html?gender=men | women | kids */

(() => {
  const gender = getParam("gender");
  const info = GENDERS[gender];

  // اگر پارامتر نامعتبر بود، به صفحه‌ی اصلی برگرد
  if (!info) {
    location.replace("index.html");
    return;
  }

  document.title = `استایل ${info.label} | کدلاین`;

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
    const rows = SECTIONS.map(({ type, title }) => {
      const label =
        type === "cold" || type === "warm" ? title : `${title} ${info.label}`;
      return UI.railSection(label, productsOfType(type));
    }).filter(Boolean);

    return (
      rows.join("") ||
      `<p class="empty" style="padding:40px 4%">محصولی با این فیلتر پیدا نشد.</p>`
    );
  }

  function render() {
    const all = PRODUCTS.filter((p) => p.gender === gender);
    const total = all.length;
    const rowTitles = SECTIONS.filter(({ type }) =>
      PRODUCTS.some((p) => p.gender === gender && p.type === type),
    ).map(({ title }) => title);

    app.innerHTML = `
      <div class="cat-hero" style="background-image:linear-gradient(to left,#000000b8 5%,#0000004d 50%,#0000001a 95%),url('${info.image}');background-size:cover;background-position:center">
        <div>
          <h1>استایل ${info.label}</h1>
          <p>${formatNumber(total)} کالا در ${formatNumber(rowTitles.length)} دسته‌ی ${rowTitles.join("، ")}</p>
        </div>
        
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

  async function start() {
    await loadCatalog();
    UI.mount({ active: gender });
    render();
  }

  start();
})();
