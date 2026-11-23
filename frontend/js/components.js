/* مؤلفه‌های مشترک همه‌ی صفحه‌ها: هدر، کارت محصول، ردیف محصولات، سبد، مودال، جستجو */

const UI = (() => {
  const PASTELS = [
    "#eeeadf",
    "#e5ecf0",
    "#f0e5df",
    "#e5ecdf",
    "#f2ead5",
    "#e9e5ef",
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

  const SIZES = {
    kids: ["28", "30", "32", "34"],
    adult: ["38", "40", "42", "44"],
    clothing: ["S", "M", "L", "XL"],
  };

  let drawerMode = "cart";
  let onTabChange = null;

  /* ---------- پیگیری سفارش ---------- */

  const STATUS_LABELS = {
    pending: "در انتظار بررسی",
    processing: "در حال آماده‌سازی",
    shipped: "ارسال شده",
    delivered: "تحویل شده",
    cancelled: "لغو شده",
  };
  const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

  const statusLabel = (key) => STATUS_LABELS[key] || key || "";
  const dateFa = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d) ? "—" : d.toLocaleDateString("fa-IR");
  };

  /* ---------- قالب‌های HTML ---------- */

  const tabsHTML = (active) =>
    TABS.map(
      (t) => `
      <a href="${t.href}" class="${t.key === active ? "on" : ""}"
         data-action="tab" data-tab="${t.key}">${t.label}</a>`,
    ).join("");

  const subHTML = (active) =>
    (SUB_LINKS[active] || SUB_LINKS.all)
      .map((word) => `<a data-action="search" data-query="${escapeHTML(word)}">${escapeHTML(word)}</a>`)
      .join("");

  const headerHTML = (active) => `
    <div class="promo">${escapeHTML(Settings.get().promoText)}</div>
    <header class="hd">
      <div class="bar">
        <a class="logo" href="index.html">CODELAINE</a>
        <nav class="tabs" id="tabs">${tabsHTML(active)}<a href="about.html">درباره</a><a href="#" data-action="contact">تماس</a></nav>
        <div class="search" id="searchBox">
          <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg></span>
          <input id="q" placeholder="جستجو در کدلاین" autocomplete="off">
          <button class="search-close" data-action="searchClose" aria-label="بستن جستجو">✕</button>
          <div id="sug"></div>
        </div>
        <button class="ib search-toggle" data-action="searchOpen" aria-label="جستجو" title="جستجو">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>
        </button>
        <button class="login" id="loginBtn" data-action="login">
          <span class="login-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.4a7.4 7.4 0 0 1 14.4 0"/></svg></span><span class="login-txt"></span>
        </button>
        <button class="ib" data-action="wishlist" aria-label="علاقه‌مندی‌ها" title="علاقه‌مندی‌ها">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/></svg><b id="wishCount">0</b>
        </button>
        <button class="ib track-btn" data-action="trackOpen" aria-label="پیگیری سفارش" title="پیگیری سفارش">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></svg>
        </button>
        <button class="ib" data-action="cart" aria-label="سبد خرید" title="سبد خرید">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1 12H5L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg><b id="cartCount">0</b>
        </button>
      </div>
      <div class="sub" id="sub">${subHTML(active)}</div>
    </header>`;

  const trackFormHTML = () => `
    <div class="tk">
      <h3 style="margin-bottom:6px">📦 پیگیری سفارش</h3>
      <p class="tk-mut">کد رهگیری و شمارهٔ موبایلی که هنگام خرید دادید را وارد کنید.</p>
      <input id="trackCode" class="tk-in" placeholder="کد رهگیری (مثال: CL-A1B2C3)" maxlength="32" autocomplete="off">
      <input id="trackPhone" class="tk-in" placeholder="شماره موبایل" maxlength="11" inputmode="numeric">
      <button class="pb" data-action="track">جستجوی سفارش</button>
      ${
        Store.lastOrder
          ? `<button class="tk-link" data-action="myOrder">آخرین سفارش این مرورگر: ${escapeHTML(Store.lastOrder.id)}</button>`
          : ""
      }
    </div>`;

  function openTrackForm() {
    openModal(trackFormHTML(), true);
    const last = Store.lastOrder;
    if (last) {
      $("#trackCode").value = last.id;
      if (last.phone) $("#trackPhone").value = last.phone;
    } else if (Store.phone) {
      $("#trackPhone").value = Store.phone;
    }
    $("#trackCode").focus();
  }

  const overlaysHTML = () => `
    <div class="ov" id="ov"><div class="md" id="md"></div></div>
    <aside id="drawer">
      <header><span id="drawerTitle"></span><button data-action="close">✕</button></header>
      <div id="drawerBody"></div>
      <div class="cf" id="drawerFooter"></div>
    </aside>
    <div id="toast"></div>`;

  const thumb = (p) =>
    productImage(p)
      ? `<img src="${escapeHTML(productImage(p))}" alt="">`
      : escapeHTML(p.emoji);

  function productCard(p) {
    const wished = Store.isWished(p.id);
    const image = productImage(p);
    const discountRow = p.discount
      ? `<s>${formatNumber(p.price)}</s><i class="off">${formatNumber(p.discount)}٪</i>`
      : "";

    return `
      <article class="card" data-id="${p.id}">
        <a class="card-link" href="product.html?id=${p.id}" aria-label="${escapeHTML(p.title)}"></a>
        <button class="wish ${wished ? "on" : ""}" data-action="wish" data-id="${p.id}">${wished ? "♥" : "♡"}</button>
        <div class="img" style="background:${PASTELS[p.id % PASTELS.length]}">
          ${
            image
              ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(p.title)}" loading="lazy">`
              : `<span>${escapeHTML(p.emoji)}</span>`
          }
        </div>
        <b>${escapeHTML(p.brand)}</b>
        <p>${escapeHTML(p.title)}</p>
        <div class="pr">${discountRow}</div>
        <div class="now">${formatNumber(finalPrice(p))} <small>تومان</small></div>
      </article>`;
  }

  function railSection(title, products, { extra = "" } = {}) {
    if (!products.length) return "";
    return `
      <section class="sec">
        <div class="sh">
          ${title ? `<h3>${escapeHTML(title)}</h3>` : ""}
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
      <div><i>🎧</i>پشتیبانی در پیج و ربات</div>
      <div><i>📦</i>۷ روز ضمانت بازگشت کالا</div>
      <div><i>✅</i>ضمانت اصالت کالا</div>
    </div>
    <footer class="ft">
      <div class="row">
        <div>
          <h4>فروشگاه اینترنتی مد و لباس کدلاین</h4>
          هر آنچه مرتبط با مد و پوشاک است؛ از انواع لباس، کیف و کفش تا لوازم جانبی.
        </div>
        <div>سفارش، هماهنگی و پاسخ به سؤال‌ها فقط از طریق پیج اینستاگرام یا ربات تلگرام انجام می‌شود.</div>
      </div>
      <div class="ft-social">
        <a href="https://instagram.com/codelaine_dev" target="_blank" rel="noopener noreferrer" aria-label="صفحهٔ اینستاگرام کدلاین">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none"></circle></svg>
          <span>ما را در اینستاگرام دنبال کنید</span><b>@codelaine_dev</b>
        </a>
        <a href="https://t.me/TiTi_02460_bot" target="_blank" rel="noopener noreferrer" aria-label="ربات تلگرام کدلاین">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 4.5 2.9 11.2c-.8.3-.8 1.4 0 1.7l4.6 1.5 1.7 5.2c.2.7 1.1.8 1.6.3l2.4-2.4 4.5 3.3c.6.4 1.4.1 1.6-.6l3-14.2c.2-.8-.6-1.5-1.3-1.5Z"></path><path d="m7.5 14.4 10-7.4-7.3 8.1"></path></svg>
          <span>ربات ما در تلگرام</span><b>@TiTi_02460_bot</b>
        </a>
      </div>
      <div class="ft-links">
        <a href="about.html">دربارهٔ نمونه‌کار</a>
        <a href="help.html">راهنمای خرید و سایز</a>
        <a href="#" data-action="trackOpen">پیگیری سفارش</a>
        <a href="help.html#returns">بازگشت کالا</a>
        <a href="help.html#privacy">حریم خصوصی</a>
        <a href="#" data-action="contact">تماس با ما</a>
      </div>
      <div style="margin-top:14px">کدلاین | Codelaine Dev - ۲۰۲۶ © Copyright · <a href="admin.html" style="color:inherit">پنل مدیریت</a></div>
    </footer>`;

  /* ---------- پیام، مودال و کشو ---------- */

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("on");
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => el.classList.remove("on"), 2600);
  }

  function openModal(html, small = false) {
    $("#md").className = small ? "md sm" : "md";
    $("#md").innerHTML = `<button class="x" data-action="close">✕</button>${html}`;
    $("#ov").classList.add("on");
  }

  function closeAll() {
    $("#ov")?.classList.remove("on");
    $("#drawer")?.classList.remove("on");
  }

  function sizesFor(p) {
    if (p.type === "bag" || p.type === "watch" || p.type === "acc") return ["تک‌سایز"];
    if (p.type === "shoe") return p.gender === "kids" ? SIZES.kids : SIZES.adult;
    return SIZES.clothing;
  }

  function openQuickView(id) {
    const p = getProduct(id);
    if (!p) return;
    const sizes = sizesFor(p);
    const hasDiscount = p.discount > 0;
    const image = productImage(p);

    openModal(`
      <div class="img" style="background:${PASTELS[id % PASTELS.length]};font-size:140px;aspect-ratio:auto;min-height:300px">
        ${
          image
            ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(p.title)}">`
            : `<span>${escapeHTML(p.emoji)}</span>`
        }
      </div>
      <div class="info">
        <small style="color:var(--mut)">${escapeHTML(p.brand)}</small>
        <h3>${escapeHTML(p.title)}</h3>
        ${hasDiscount ? `<div class="pr" style="padding:0"><s>${formatNumber(p.price)}</s><i class="off">${formatNumber(p.discount)}٪</i></div>` : ""}
        <div class="now" style="padding:0;font-size:24px">${formatNumber(finalPrice(p))} <small>تومان</small></div>
        <div>انتخاب سایز:</div>
        <div class="chips" id="sizes">
          ${sizes.map((s, i) => `<button class="${i === 0 ? "on" : ""}" data-action="size">${escapeHTML(s)}</button>`).join("")}
        </div>
        <button class="pb" data-action="addFromModal" data-id="${id}">افزودن به سبد خرید</button>
        <button class="wish-text" data-action="wish" data-id="${id}" style="color:var(--mut)">
          ${Store.isWished(id) ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی"}
        </button>
        <a href="product.html?id=${id}" style="display:block;text-align:center;margin-top:10px;color:var(--mut);font-size:13px">مشاهدهٔ صفحهٔ کامل محصول ›</a>
      </div>`);
  }

  function openContact() {
    openModal(
      `
      <div class="ct">
        <h3 style="margin-bottom:6px">تماس با ما</h3>
        <p style="color:var(--mut);font-size:13px;margin:0 0 14px">
          برای سفارش، هماهنگی و پشتیبانی از راه‌های زیر با ما در تماس باشید.
        </p>
        <a class="ct-link" href="https://t.me/TiTi_02460_bot" target="_blank" rel="noopener noreferrer">
          <span>پشتیبانی تلگرام</span><b dir="ltr">@TiTi_02460_bot</b>
        </a>
        <a class="ct-link" href="https://instagram.com/codelaine_dev" target="_blank" rel="noopener noreferrer">
          <span>اینستاگرام</span><b dir="ltr">@codelaine_dev</b>
        </a>
        <p style="color:var(--mut);font-size:12px;margin:12px 0 0">
          با زدن روی آیدی تلگرام، مستقیم وارد چت با پشتیبانی می‌شوید.
          <a href="about.html" style="display:inline-block;margin-top:8px">دربارهٔ این نمونه‌کار</a>
        </p>
      </div>`,
      true,
    );
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

  /* ---------- نتیجهٔ پیگیری ---------- */

  function trackResultHTML(order) {
    const stepIndex = STATUS_STEPS.indexOf(order.status);
    const cancelled = order.status === "cancelled";

    const steps = cancelled
      ? `<div class="tk-cancel">این سفارش لغو شده است</div>`
      : `<div class="tk-steps">
          ${STATUS_STEPS.map(
            (s, i) => `
            <div class="st ${i <= stepIndex ? "on" : ""}">
              <i></i><span>${statusLabel(s)}</span>
            </div>`,
          ).join("")}
        </div>`;

    const items = (order.items || [])
      .map(
        (it) => `
        <div class="tk-item">
          <span>${escapeHTML(it.title)}</span>
          <span>سایز ${escapeHTML(it.size)}</span>
          <span>×${formatNumber(it.qty)}</span>
          <b>${formatNumber(it.price * it.qty)} تومان</b>
        </div>`,
      )
      .join("");

    return `
      <div class="tk">
        <p class="tk-mut">کد رهگیری</p>
        <div class="tk-code"><b>${escapeHTML(order.id)}</b><button data-action="copy" data-code="${escapeHTML(order.id)}">کپی</button></div>
        <div class="tk-meta">
          <span>تاریخ ثبت: ${dateFa(order.date)}</span>
          <span class="tk-badge ${cancelled ? "bad" : ""}">${statusLabel(order.status)}</span>
        </div>
        ${steps}
        <h4 class="tk-h">اقلام سفارش</h4>
        ${items || '<p class="tk-mut">قلمی ثبت نشده است</p>'}
        <div class="tk-sum">
          <div><span>مبلغ کالاها</span><b>${formatNumber(order.total)} تومان</b></div>
          ${order.discount ? `<div><span>تخفیف</span><b style="color:var(--red)">${formatNumber(order.discount)}- تومان</b></div>` : ""}
          <div class="tk-pay"><span>قابل پرداخت</span><b>${formatNumber(order.payable)} تومان</b></div>
        </div>
      </div>`;
  }

  function showTrackResult(order) {
    openModal(trackResultHTML(order));
  }

  function showOrderPlaced(order) {
    openModal(`
      <div class="tk">
        <h3 style="margin-bottom:6px">سفارش شما ثبت شد 🎉</h3>
        <p class="tk-mut">این کد رهگیری را ذخیره کنید؛ با آن وضعیت سفارش را می‌بینید.</p>
        <div class="tk-code"><b>${escapeHTML(order.id)}</b><button data-action="copy" data-code="${escapeHTML(order.id)}">کپی</button></div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="pb" data-action="myOrder">مشاهدهٔ وضعیت سفارش</button>
        </div>
      </div>`);
  }

  /* ---------- پرداخت (این نمونه‌کار درگاه پرداخت ندارد) ---------- */

  function openPayment() {
    if (!Store.cartEntries().length) return toast("سبد خرید خالی است");
    const payable = Math.max(0, Store.cartTotal() - Store.discount());

    openModal(
      `
      <div class="pay">
        <div class="pay-hd"><b>پرداخت سفارش</b><span class="pay-secure">🔒 پرداخت امن</span></div>
        <div class="pay-total">
          <span>مبلغ قابل پرداخت</span>
          <b>${formatNumber(payable)} <small>تومان</small></b>
        </div>
        <div class="pay-card pay-off">
          <div class="pc-top"><span>درگاه پرداخت</span><span>نسخهٔ نمایشی</span></div>
          <div class="pay-off-ttl">پرداخت در این نمونه‌کار وجود ندارد</div>
          <p class="pay-off-txt">
            این فروشگاه یک نمونه‌کار کدلاین است و به هیچ درگاه بانکی یا کارت واقعی وصل نیست؛
            امکان پرداخت آنلاین و واریز وجه در آن فراهم نبوده و هیچ مبلغی از حساب شما کم نمی‌شود.
          </p>
        </div>
        <p class="pay-hint">
          برای دیدن کامل جریان خرید، سفارش را به‌صورت نمایشی ثبت کنید.
          اطلاعات کارت بانکی هم هیچ‌جا از شما گرفته نمی‌شود.
        </p>
        <button class="pb" data-action="confirmPay">ثبت سفارش نمایشی</button>
        <p class="pay-demo">نمونه‌کار کدلاین — بدون تراکنش واقعی</p>
      </div>`,
      true,
    );
  }

  function showResults(query) {
    const results = searchProducts(query);
    const html = results.length
      ? results.map(productCard).join("")
      : `<div class="empty" style="padding:26px 0;text-align:center">
           <p style="font-size:15px;margin-bottom:10px">برای «${escapeHTML(query)}» محصولی پیدا نشد.</p>
           <p style="font-size:13px;line-height:2">
             نام محصول، برند یا دسته را جدا بنویسید؛ مثلاً «ساعت»، «کیف چرم» یا «کاپشن زنانه».
           </p>
         </div>`;

    openModal(`
      <div class="search-results">
        <h3 style="margin-bottom:14px">نتایج «${escapeHTML(query)}» (${formatNumber(results.length)})</h3>
        <div class="search-results__grid">
          ${html}
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
            <div class="th">${thumb(p)}</div>
            <div style="flex:1"><b>${escapeHTML(p.brand)}</b><br>${escapeHTML(p.title)}<br>${formatNumber(finalPrice(p))} تومان</div>
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
        <div class="th">${thumb(p)}</div>
        <div style="flex:1">
          <b>${escapeHTML(p.brand)}</b><br>${escapeHTML(p.title)}<br>سایز: ${escapeHTML(size)} | ${formatNumber(finalPrice(p))} تومان
          <div class="q">
            <button data-action="qty" data-key="${escapeHTML(key)}" data-delta="1">+</button>
            ${formatNumber(qty)}
            <button data-action="qty" data-key="${escapeHTML(key)}" data-delta="-1">−</button>
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
            : `🎉 تخفیف ${formatNumber(Store.DISCOUNT_AMOUNT)} تومانی فعال شد`
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
    const cartCount = $("#cartCount");
    const wishCount = $("#wishCount");
    const loginBtn = $("#loginBtn");
    if (cartCount) {
      const n = Store.cartCount();
      cartCount.textContent = formatNumber(n);
      cartCount.style.display = n ? "" : "none";
    }
    if (wishCount) {
      const n = Store.wishlist().length;
      wishCount.textContent = formatNumber(n);
      wishCount.style.display = n ? "" : "none";
    }
    if (loginBtn) {
      const label = Store.user || "ورود | ثبت نام";
      const text = loginBtn.querySelector(".login-txt");
      if (text) text.textContent = label;
      else loginBtn.textContent = label;
    }



    $$(".wish").forEach((btn) => {
      const wished = Store.isWished(+btn.dataset.id);
      btn.classList.toggle("on", wished);
      btn.textContent = wished ? "♥" : "♡";
    });

    if ($("#drawer")?.classList.contains("on")) renderDrawer();
  }

  /* ---------- جستجوی زنده ---------- */

  function bindSearch() {
    const input = $("#q");
    const box = $("#sug");
    if (!input || !box) return;

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
          ${
            productImage(p)
              ? `<img src="${escapeHTML(productImage(p))}" alt="" style="width:36px;height:44px;object-fit:cover;border-radius:8px;flex:none">`
              : `<span style="font-size:28px">${escapeHTML(p.emoji)}</span>`
          }
          <span style="flex:1;font-size:13px">${escapeHTML(p.title)}</span>
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
        $(".search")?.classList.remove("is-open");
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
      const query = el.dataset.query || "";
      $("#q").value = query;
      $(".search")?.classList.remove("is-open");
      showResults(query);
    },

    searchOpen() {
      const box = $(".search");
      if (!box) return;
      box.classList.add("is-open");
      $("#q")?.focus();
    },

    searchClose() {
      $(".search")?.classList.remove("is-open");
      $("#sug").style.display = "none";
    },

    open(el) {
      const box = $("#sug");
      if (box) box.style.display = "none";
      $(".search")?.classList.remove("is-open");
      openQuickView(+el.dataset.id);
    },

    wish(el, e) {
      e.stopPropagation();
      const added = Store.toggleWish(+el.dataset.id);
      if (added) toast("به علاقه‌مندی‌ها اضافه شد ♥");
      if (el.classList.contains("wish-text")) {
        el.textContent = added ? "♥ در علاقه‌مندی‌ها" : "♡ افزودن به علاقه‌مندی";
      }
    },

    rail(el) {
      const rail = $(".rail", el.closest(".sec"));
      if (!rail) return;
      rail.scrollBy({
        left: -el.dataset.dir * rail.clientWidth * 0.8,
        behavior: "smooth",
      });
    },

    expand(el) {
      const section = el.closest(".sec");
      section.classList.toggle("expanded");
      const expanded = section.classList.contains("expanded");
      $("span", el).textContent = expanded ? "جمع کردن" : "مشاهده همه";
    },

    size(el) {
      $$("#sizes button").forEach((b) => b.classList.toggle("on", b === el));
    },

    addFromModal(el) {
      const size = $("#sizes .on")?.textContent || "تک‌سایز";
      Store.addToCart(+el.dataset.id, size);
      toast("به سبد خرید اضافه شد ✓");
      closeAll();
      openDrawer("cart");
    },

    cart: () => openDrawer("cart"),
    wishlist: () => openDrawer("wishlist"),
    close: closeAll,
    login: openLogin,
    contact(el, e) {
      e.preventDefault();
      openContact();
    },

    qty: (el) => Store.changeQty(el.dataset.key, +el.dataset.delta),
    clear: () => Store.clearCart(),

    pay: openPayment,

    async confirmPay(el) {
      if (el.disabled) return;
      el.disabled = true;
      el.textContent = "در حال ثبت سفارش…";

      const result = await Store.placeOrder();
      closeAll();

      if (result.ok) {
        showOrderPlaced(result.order);
        toast(`سفارش ${result.order.id} ثبت شد 🎉`);
      } else {
        toast(result.error);
        el.disabled = false;
        el.textContent = "ثبت سفارش نمایشی";
      }
    },

    trackOpen: openTrackForm,

    async track() {
      const code = $("#trackCode").value.trim();
      const phone = $("#trackPhone").value.trim();
      if (!code) return toast("کد رهگیری را وارد کنید");
      if (phone && !/^09\d{9}$/.test(phone)) return toast("شماره موبایل معتبر نیست");

      const result = await Store.trackOrder(code, phone);
      if (!result.ok) return toast(result.error);
      showTrackResult(result.order);
    },

    myOrder() {
      const last = Store.lastOrder;
      if (!last) return toast("سفارشی برای این مرورگر ثبت نشده");
      openTrackForm();
      actions.track();
    },

    copy(el) {
      const code = el.dataset.code || "";
      const done = () => toast(el.dataset.toast || "کد رهگیری کپی شد ✓");
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(() => toast(code));
      } else {
        toast(code);
      }
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
      if (!e.target.closest(".search")) {
        const box = $("#sug");
        if (box) box.style.display = "none";
      }
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
    // هدر و نوار بالای صفحه مستقیم داخل body قرار می‌گیرند؛ اگر داخل یک
    // پوشش display:contents باشند، چسبیدن هدر در اسکرول موبایل به‌هم می‌خورد.
    const placeholder = $("#site-header");
    if (placeholder) placeholder.outerHTML = headerHTML(active);
    else $(".hd")?.before(headerHTML(active));
    $("#site-overlays").innerHTML = overlaysHTML();
    bindSearch();
    bindGlobalEvents();
    Store.subscribe(onStoreChange);
    onStoreChange();
    autoHideHeader();
  }

  // در موبایل با اسکرول به پایین هدر مخفی و با اسکرول به بالا دوباره نمایان می‌شود
  function autoHideHeader() {
    const hd = $(".hd");
    if (!hd) return;

    let lastY = window.scrollY;
    let anchorY = lastY;
    let dir = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      const mobile = matchMedia("(max-width: 800px)").matches;
      const typing = document.activeElement === $("#q");

      if (!mobile || typing || y < 160) {
        hd.classList.remove("away");
        anchorY = y;
        dir = 0;
        return;
      }

      // نقطهٔ شروع هر حرکت؛ تا از چشمک‌زدن هدر جلوگیری شود
      if (delta > 0 && dir !== 1) {
        dir = 1;
        anchorY = y;
      } else if (delta < 0 && dir !== -1) {
        dir = -1;
        anchorY = y;
      }

      if (dir === 1 && y - anchorY > 40) hd.classList.add("away");
      if (dir === -1 && anchorY - y > 8) hd.classList.remove("away");
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", update);
  }

  function setActiveTab(key) {
    $("#tabs").innerHTML = tabsHTML(key);
    $("#sub").innerHTML = subHTML(key);
  }

  return { mount, setActiveTab, railSection, productCard, footerHTML, toast, sizesFor };
})();
