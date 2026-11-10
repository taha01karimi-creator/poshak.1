/* مؤلفه‌های مشترک همه‌ی صفحه‌ها: هدر، کارت محصول، ردیف محصولات، سبد، مودال، جستجو */

const UI = (() => {
  const PASTELS = [
    "#e4dcd2",
    "#d7dde6",
    "#e6d6d6",
    "#dbe4d9",
    "#e8e2cf",
    "#dcd6e6",
  ];

  const TABS = [
    { key: "all", label: "همه استایل‌ها", href: "index.html" },
    { key: "women", label: "زنانه", href: "index.html?tab=women" },
    { key: "men", label: "مردانه", href: "index.html?tab=men" },
    { key: "kids", label: "بچگانه", href: "index.html?tab=kids" },
  ];

  // لینک‌های زیرمنو در واقع کلمه‌ی جستجو هستند
  const SUB_LINKS = {
    all: ["زنانه", "مردانه", "بچگانه", "کفش", "کیف", "ساعت"],
    women: ["کفش", "کیف", "ساعت", "شومیز", "شلوار", "کاپشن", "ساپورت"],
    men: ["کفش", "ساعت", "پولوشرت", "پیراهن", "شلوار", "کاپشن"],
    kids: ["کفش", "پسرانه", "دخترانه", "بارانی", "سویشرت", "شلوار"],
  };

  let drawerMode = "cart";
  let onTabChange = null;

  /* ---------- قالب‌های HTML ---------- */

  const tabsHTML = (active) =>
    TABS.map(
      (t) => `
      <a href="${t.href}" class="${t.key === active ? "on" : ""}"
         data-action="tab" data-tab="${t.key}">${t.label}</a>`,
    ).join("");

  const subHTML = (active) =>
    SUB_LINKS[active]
      .map((word) => `<a data-action="search" data-query="${word}">${word}</a>`)
      .join("");

  const headerHTML = (active) => `
    <div class="promo">${Settings.get().promoText}</div>
    <header class="hd">
      <div class="bar">
        <a class="logo" href="index.html">DIGISTYLE</a>
        <nav class="tabs" id="tabs">${tabsHTML(active)}</nav>
        <div class="search">
          <span class="ic">🔍</span>
          <input id="q" placeholder="جستجو در دیجی‌استایل" autocomplete="off">
          <div id="sug"></div>
        </div>
        <button class="login" id="loginBtn" data-action="login"></button>
        <button class="ib" data-action="wishlist" title="علاقه‌مندی‌ها">♡<b id="wishCount">0</b></button>
        <button class="ib" data-action="cart" title="سبد خرید">🛒<b id="cartCount">0</b></button>
      </div>
      <div class="sub" id="sub">${subHTML(active)}</div>
    </header>`;

  const overlaysHTML = () => `
    <div class="ov" id="ov"><div class="md" id="md"></div></div>
    <aside id="drawer">
      <header><span id="drawerTitle"></span><button data-action="close">✕</button></header>
      <div id="drawerBody"></div>
      <div class="cf" id="drawerFooter"></div>
    </aside>
    <div id="toast"></div>`;

  function productCard(p) {
    const wished = Store.isWished(p.id);
    const discountRow = p.discount
      ? `<s>${formatNumber(p.price)}</s><i class="off">${formatNumber(p.discount)}٪</i>`
      : "";

    return `
      <article class="card" data-action="open" data-id="${p.id}">
        <button class="wish ${wished ? "on" : ""}" data-action="wish" data-id="${p.id}">${wished ? "♥" : "♡"}</button>
        <div class="img" style="background:${PASTELS[p.id % PASTELS.length]}"><span>${p.emoji}</span></div>
        <b>${p.brand}</b>
        <p>${p.title}</p>
        <div class="pr">${discountRow}</div>
        <div class="now">${formatNumber(finalPrice(p))} <small>تومان</small></div>
      </article>`;
  }

  function railSection(title, products, { extra = "" } = {}) {
    if (!products.length) return "";
    return `
      <section class="sec">
        <div class="sh">
          ${title ? `<h3>${title}</h3>` : ""}
          ${extra}
          <hr>
          <button class="all" data-action="expand"><i>‹</i><span>مشاهده همه</span></button>
        </div>
        <button class="rn" style="left:2%" data-action="rail" data-dir="-1">‹</button>
        <button class="rn" style="right:2%" data-action="rail" data-dir="1">›</button>
        <div class="rail">${products.map(productCard).join("")}</div>
      </section>`;
  }

  const footerHTML = () => `
    <div class="feat">
      <div><i>🚚</i>تحویل اکسپرس</div>
      <div><i>🎧</i>۷ روز هفته، ۲۴ ساعته</div>
      <div><i>📦</i>۷ روز ضمانت بازگشت کالا</div>
      <div><i>✅</i>ضمانت اصالت کالا</div>
    </div>
    <footer class="ft">
      <div class="row">
        <div>
          <h4>فروشگاه اینترنتی مد و لباس دیجی‌استایل</h4>
          هر آنچه مرتبط با مد و پوشاک است؛ از انواع لباس، کیف و کفش تا لوازم جانبی.
        </div>
        <div>📞 تلفن پشتیبانی: <b style="color:var(--fg)">۰۲۱-۶۱۹۳۰۳۰۰</b><br>۷ روز هفته، ۲۴ ساعته پاسخگوی شما هستیم</div>
      </div>
      <div style="margin-top:14px">digistyle.com - ۲۰۲۶ © Copyright · <a href="admin.html" style="color:inherit">پنل مدیریت</a></div>
    </footer>`;

  /* ---------- پیام، مودال و کشو ---------- */

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("on");
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => el.classList.remove("on"), 2200);
  }

  function openModal(html, small = false) {
    $("#md").className = small ? "md sm" : "md";
    $("#md").innerHTML =
      `<button class="x" data-action="close">✕</button>${html}`;
    $("#ov").classList.add("on");
  }

  function closeAll() {
    $("#ov").classList.remove("on");
    $("#drawer").classList.remove("on");
  }

  function sizesFor(p) {
    if (p.type === "acc") return ["تک‌سایز"];
    if (p.type === "shoe")
      return p.gender === "kids"
        ? ["28", "30", "32", "34"]
        : ["38", "40", "42", "44"];
    return ["S", "M", "L", "XL"];
  }

  function openQuickView(id) {
    const p = getProduct(id);
    const sizes = sizesFor(p);
    const hasDiscount = p.discount > 0;

    openModal(`
      <div class="img" style="background:${PASTELS[id % PASTELS.length]};font-size:140px;aspect-ratio:auto;min-height:300px">
        <span>${p.emoji}</span>
      </div>
      <div class="info">
        <small style="color:var(--mut)">${p.brand}</small>
        <h3>${p.title}</h3>
        ${hasDiscount ? `<div class="pr" style="padding:0"><s>${formatNumber(p.price)}</s><i class="off">${formatNumber(p.discount)}٪</i></div>` : ""}
        <div class="now" style="padding:0;font-size:24px">${formatNumber(finalPrice(p))} <small>تومان</small></div>
        <div>انتخاب سایز:</div>
        <div class="chips" id="sizes">
          ${sizes.map((s, i) => `<button class="${i === 0 ? "on" : ""}" data-action="size">${s}</button>`).join("")}
        </div>
        <button class="pb" data-action="addFromModal" data-id="${id}">افزودن به سبد خرید</button>
        <button class="wish-text" data-action="wish" data-id="${id}" style="color:var(--mut)">
          ${Store.isWished(id) ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی"}
        </button>
      </div>`);
  }

  function openLogin() {
    openModal(
      `
      <h3>ورود | ثبت نام</h3>
      <p style="color:var(--mut);font-size:13px;margin-top:6px">شماره موبایل خود را وارد کنید</p>
      <input id="phone" placeholder="09123456789" maxlength="11" inputmode="numeric">
      <button class="pb" data-action="doLogin">ادامه</button>`,
      true,
    );
    $("#phone").focus();
  }

  function showResults(query) {
    const results = searchProducts(query);
    openModal(`
      <div style="padding:24px;grid-column:1/-1">
        <h3 style="margin-bottom:14px">نتایج «${query}» (${formatNumber(results.length)})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">
          ${results.map(productCard).join("") || '<p class="empty">محصولی پیدا نشد</p>'}
        </div>
      </div>`);
  }

  function openDrawer(mode) {
    drawerMode = mode;
    $("#drawer").classList.add("on");
    renderDrawer();
  }

  function renderDrawer() {
    const body = $("#drawerBody");
    const footer = $("#drawerFooter");

    if (drawerMode === "wishlist") {
      $("#drawerTitle").textContent = "علاقه‌مندی‌ها";
      footer.innerHTML = "";
      body.innerHTML =
        Store.wishlist()
          .map((id) => {
            const p = getProduct(id);
            return `
          <div class="ci">
            <div class="th">${p.emoji}</div>
            <div style="flex:1"><b>${p.brand}</b><br>${p.title}<br>${formatNumber(finalPrice(p))} تومان</div>
            <button data-action="open" data-id="${id}">مشاهده</button>
          </div>`;
          })
          .join("") ||
        '<p class="empty" style="text-align:center">هنوز چیزی اضافه نکرده‌اید ♡</p>';
      return;
    }

    $("#drawerTitle").textContent = "سبد خرید";
    const entries = Store.cartEntries();

    body.innerHTML =
      entries
        .map(
          ({ key, product: p, size, qty }) => `
      <div class="ci">
        <div class="th">${p.emoji}</div>
        <div style="flex:1">
          <b>${p.brand}</b><br>${p.title}<br>سایز: ${size} | ${formatNumber(finalPrice(p))} تومان
          <div class="q">
            <button data-action="qty" data-key="${key}" data-delta="1">+</button>
            ${formatNumber(qty)}
            <button data-action="qty" data-key="${key}" data-delta="-1">−</button>
          </div>
        </div>
      </div>`,
        )
        .join("") ||
      '<p class="empty" style="text-align:center">سبد خرید شما خالی است 🛒</p>';

    if (!entries.length) {
      footer.innerHTML = "";
      return;
    }

    const total = Store.cartTotal();
    const discount = Store.discount();
    const missing = Store.DISCOUNT_THRESHOLD - total;
    const progress = Math.min(100, (total / Store.DISCOUNT_THRESHOLD) * 100);

    footer.innerHTML = `
      <div style="font-size:13px">
        ${
          missing > 0
            ? `${formatNumber(missing)} تومان تا <b>${formatNumber(Store.DISCOUNT_AMOUNT)} تومان تخفیف</b> مانده`
            : "🎉 تخفیف ${formatNumber(Store.DISCOUNT_AMOUNT)} تومانی فعال شد"
        }
      </div>
      <div class="pg"><i style="width:${progress}%"></i></div>
      <div>مبلغ کالاها: ${formatNumber(total)} تومان</div>
      ${discount ? `<div style="color:var(--red)">تخفیف: ${formatNumber(discount)}- تومان</div>` : ""}
      <div style="font-weight:800;margin:6px 0">قابل پرداخت: ${formatNumber(total - discount)} تومان</div>
      <button class="pb" data-action="pay">ثبت سفارش</button>
      <button style="width:100%;margin-top:8px;color:var(--mut)" data-action="clear">خالی کردن سبد</button>`;
  }

  /* ---------- هماهنگ‌سازی با Store ---------- */

  function onStoreChange() {
    $("#cartCount").textContent = formatNumber(Store.cartCount());
    $("#wishCount").textContent = formatNumber(Store.wishlist().length);
    $("#loginBtn").textContent = Store.user
      ? `👤 ${Store.user}`
      : "ورود | ثبت نام";

    $$(".wish").forEach((btn) => {
      const wished = Store.isWished(+btn.dataset.id);
      btn.classList.toggle("on", wished);
      btn.textContent = wished ? "♥" : "♡";
    });

    if ($("#drawer").classList.contains("on")) renderDrawer();
  }

  /* ---------- جستجوی زنده ---------- */

  function bindSearch() {
    const input = $("#q");
    const box = $("#sug");

    input.addEventListener(
      "input",
      debounce(() => {
        const term = input.value.trim();
        box.style.display = term ? "block" : "none";
        if (!term) return;

        const results = searchProducts(term).slice(0, 6);
        box.innerHTML =
          results
            .map(
              (p) => `
        <div data-action="open" data-id="${p.id}">
          <span style="font-size:28px">${p.emoji}</span>
          <span style="flex:1;font-size:13px">${p.title}</span>
          <b style="font-size:13px">${formatNumber(finalPrice(p))}</b>
        </div>`,
            )
            .join("") ||
          '<div style="color:var(--mut)">نتیجه‌ای پیدا نشد</div>';
      }),
    );

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        box.style.display = "none";
        showResults(input.value.trim());
      }
    });
  }

  /* ---------- رویدادها: هر دکمه یک data-action دارد ---------- */

  const actions = {
    tab(el, e) {
      if (!onTabChange) return; // در صفحه‌ی دسته‌بندی لینک عادی کار می‌کند
      e.preventDefault();
      onTabChange(el.dataset.tab);
    },

    search(el) {
      $("#q").value = el.dataset.query;
      showResults(el.dataset.query);
    },

    open(el) {
      $("#sug").style.display = "none";
      openQuickView(+el.dataset.id);
    },

    wish(el, e) {
      e.stopPropagation();
      const added = Store.toggleWish(+el.dataset.id);
      if (added) toast("به علاقه‌مندی‌ها اضافه شد ♥");
      if (el.classList.contains("wish-text")) {
        el.textContent = added
          ? "♥ در علاقه‌مندی‌ها"
          : "♡ افزودن به علاقه‌مندی";
      }
    },

    rail(el) {
      const rail = $(".rail", el.closest(".sec"));
      // در صفحه‌ی راست‌به‌چپ، اسکرول به سمت چپ منفی است
      rail.scrollBy({
        left: -el.dataset.dir * rail.clientWidth * 0.8,
        behavior: "smooth",
      });
    },

    expand(el) {
      const section = el.closest(".sec");
      const expanded = section.classList.toggle("expanded");
      $("span", el).textContent = expanded ? "جمع کردن" : "مشاهده همه";
    },

    size(el) {
      $$("#sizes button").forEach((b) => b.classList.toggle("on", b === el));
    },

    addFromModal(el) {
      const size = $("#sizes .on").textContent;
      Store.addToCart(+el.dataset.id, size);
      toast("به سبد خرید اضافه شد ✓");
      closeAll();
      openDrawer("cart");
    },

    cart: () => openDrawer("cart"),
    wishlist: () => openDrawer("wishlist"),
    close: closeAll,
    login: openLogin,

    qty: (el) => Store.changeQty(el.dataset.key, +el.dataset.delta),
    clear: () => Store.clearCart(),

    pay() {
      const order = Store.placeOrder();
      closeAll();
      if (order) toast(`سفارش ${order.id} ثبت شد 🎉`);
    },

    doLogin() {
      const phone = $("#phone").value.trim();
      if (!/^09\d{9}$/.test(phone)) return toast("شماره موبایل معتبر نیست");
      Store.login(phone);
      closeAll();
      toast("خوش آمدید 👋");
    },
  };

  function bindGlobalEvents() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search")) $("#sug").style.display = "none";
      if (e.target.id === "ov") closeAll();

      const el = e.target.closest("[data-action]");
      const handler = el && actions[el.dataset.action];
      if (handler) handler(el, e);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
  }

  /* ---------- API عمومی ---------- */

  function mount({ active = "all", onTabChange: tabHandler = null } = {}) {
    onTabChange = tabHandler;
    $("#site-header").innerHTML = headerHTML(active);
    $("#site-overlays").innerHTML = overlaysHTML();
    bindSearch();
    bindGlobalEvents();
    Store.subscribe(onStoreChange);
    onStoreChange();
  }

  function setActiveTab(key) {
    $("#tabs").innerHTML = tabsHTML(key);
    $("#sub").innerHTML = subHTML(key);
  }

  return { mount, setActiveTab, railSection, productCard, footerHTML };
})();
