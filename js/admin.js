/* پنل مدیریت دیجی‌استایل — فقط فرانت‌اند؛ داده‌ها در localStorage ذخیره می‌شوند */

(() => {
  const SESSION_KEY = "digistyle:admin-session";

  const STATUSES = {
    pending: "در انتظار",
    processing: "در حال پردازش",
    shipped: "ارسال شده",
    delivered: "تحویل شده",
    cancelled: "لغو شده",
  };

  const TYPE_LABELS = {
    shoe: "کفش",
    top: "لباس",
    pants: "شلوار",
    cold: "پاییز و زمستان",
    warm: "بهار و تابستان",
    acc: "کیف و ساعت",
  };

  const NAV = [
    ["dashboard", "📊", "داشبورد"],
    ["products", "🛍️", "محصولات"],
    ["orders", "📦", "سفارش‌ها"],
    ["settings", "⚙️", "تنظیمات"],
  ];

  const root = $("#admin");
  const filters = { search: "", gender: "", type: "" };

  let session = null;
  let page = "dashboard";
  let loginPending = false;

  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (error) {}
  if (session && !ROLE_PERMISSIONS[session.role]) session = null;

  /* ---------- ابزارها ---------- */

  const can = (permission) =>
    !!session && ROLE_PERMISSIONS[session.role].includes(permission);
  const clean = (text) =>
    String(text)
      .replace(/[<>"`]/g, "")
      .trim();
  const dateFa = (iso) => new Date(iso).toLocaleString("fa-IR");

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("on");
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => el.classList.remove("on"), 2200);
  }

  function openModal(html) {
    closeModal();
    const bg = document.createElement("div");
    bg.className = "adm-modal-bg";
    bg.innerHTML = `<div class="adm-modal">${html}</div>`;
    document.body.appendChild(bg);
  }

  function closeModal() {
    $$(".adm-modal-bg").forEach((el) => el.remove());
  }

  function downloadCSV(filename, rows) {
    const text = rows
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\ufeff" + text], { type: "text/csv" }),
    );
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const options = (map, selected, firstLabel) =>
    (firstLabel ? `<option value="">${firstLabel}</option>` : "") +
    Object.entries(map)
      .map(
        ([key, label]) =>
          `<option value="${key}" ${key === selected ? "selected" : ""}>${label}</option>`,
      )
      .join("");

  const genderLabels = Object.fromEntries(
    Object.entries(GENDERS).map(([k, g]) => [k, g.label]),
  );

  /* ---------- ورود و خروج ---------- */

  const ROLE_TITLES = { owner: "مالک فروشگاه", admin: "مدیر سایت" };

  const readCookie = (name) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : "";
  };

  // هر درخواست به API از همین دامنه و با کوکی نشست ارسال می‌شود
  async function api(path, { method = "GET", body } = {}) {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (method !== "GET") {
      let token = readCookie("csrf_token");
      if (!token) {
        await fetch(`${ADMIN_API_BASE}/csrf-token`, {
          credentials: "same-origin",
        });
        token = readCookie("csrf_token");
      }
      if (token) headers["X-CSRF-Token"] = token;
    }

    const response = await fetch(`${ADMIN_API_BASE}${path}`, {
      method,
      credentials: "same-origin",
      headers,
      body,
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  const saveSession = () => {
    try {
      if (session)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {}
  };

  const sessionFrom = (user) => ({
    role: user.role,
    username: user.username,
    title: user.title || ROLE_TITLES[user.role],
  });

  function renderLogin(message = "") {
    root.innerHTML = `
      <div class="adm-login">
        <div class="adm-box">
          <h1>پنل مدیریت</h1>
          <p class="muted">DIGISTYLE</p>
          <input id="user" class="adm-input" placeholder="نام کاربری" autocomplete="username">
          <input id="pass" class="adm-input" type="password" placeholder="رمز عبور" autocomplete="current-password">
          <p class="err">${message}</p>
          <button class="btn-sm btn-p full" data-act="login">ورود</button>
          <p class="muted">ورود روی سرور بررسی می‌شود.</p>
          <a class="muted" href="index.html">← بازگشت به فروشگاه</a>
        </div>
      </div>`;
  }

  async function doLogin() {
    if (loginPending) return;

    const username = ($("#user")?.value || "").trim();
    const password = $("#pass")?.value || "";
    if (!username || !password)
      return renderLogin("نام کاربری و رمز عبور را وارد کنید");

    loginPending = true;
    const button = document.querySelector('[data-act="login"]');
    if (button) {
      button.disabled = true;
      button.textContent = "در حال ورود…";
    }

    let result;
    try {
      result = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    } catch (error) {
      loginPending = false;
      return renderLogin(
        "به سرور وصل نشد. پنل را از آدرس سرور باز کنید، نه با کلیک روی فایل.",
      );
    }
    loginPending = false;

    const { response, data } = result;
    if (!response.ok || !data.user) {
      if (data.retry_after)
        return renderLogin(
          `حساب موقتاً قفل شده است؛ ${formatNumber(Math.ceil(data.retry_after / 60))} دقیقه دیگر تلاش کنید`,
        );
      return renderLogin(data.error || "نام کاربری یا رمز عبور اشتباه است");
    }

    if (!ROLE_PERMISSIONS[data.user.role]) {
      try {
        await api("/auth/logout", { method: "POST" });
      } catch (error) {}
      return renderLogin("این حساب به پنل مدیریت دسترسی ندارد");
    }

    session = sessionFrom(data.user);
    saveSession();
    page = "dashboard";
    render();
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      /* سرور در دسترس نیست؛ نشست محلی پاک می‌شود */
    }
    session = null;
    saveSession();
    renderLogin();
  }

  // نشست ذخیره‌شده با /auth/me تأیید می‌شود تا کوکی منقضی پنل را باز نکند
  async function init() {
    if (!session) return renderLogin();

    try {
      const { response, data } = await api("/auth/me");
      if (response.ok && data.user && ROLE_PERMISSIONS[data.user.role]) {
        session = sessionFrom(data.user);
        saveSession();
        return render();
      }
      session = null;
      saveSession();
      renderLogin();
    } catch (error) {
      render();
    }
  }

  /* ---------- قاب اصلی ---------- */

  function render() {
    session ? renderShell() : renderLogin();
  }

  function renderShell() {
    const items = NAV.filter(([key]) => key !== "settings" || can("settings"));

    root.innerHTML = `
      <div class="adm-shell">
        <aside class="adm-side">
          <div class="adm-logo">DIGISTYLE</div>
          <small class="muted">${session.title}</small>
          ${items
            .map(
              ([key, icon, label]) =>
                `<button class="${key === page ? "on" : ""}" data-act="nav" data-page="${key}">${icon} ${label}</button>`,
            )
            .join("")}
          <span style="flex:1"></span>
          <a href="index.html">🏬 مشاهده فروشگاه</a>
          <button data-act="logout">🚪 خروج</button>
        </aside>
        <section class="adm-main" id="content"></section>
      </div>`;

    renderPage();
  }

  function renderPage() {
    const pages = {
      dashboard: dashboardHTML,
      products: productsHTML,
      orders: ordersHTML,
      settings: settingsHTML,
    };
    $("#content").innerHTML = pages[page]();
  }

  /* ---------- داشبورد ---------- */

  const barsHTML = (rows) => {
    const max = Math.max(1, ...rows.map(([, n]) => n));
    return `<div class="bars">${rows
      .map(
        ([label, n]) => `
      <div class="row"><span>${label}</span><i style="width:${(n / max) * 100}%"></i><b>${formatNumber(n)}</b></div>`,
      )
      .join("")}</div>`;
  };

  function dashboardHTML() {
    const orders = Store.orders();
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.payable, 0);

    const stats = [
      ["تعداد محصولات", formatNumber(PRODUCTS.length)],
      ["تعداد سفارش‌ها", formatNumber(orders.length)],
      ["درآمد (تومان)", formatNumber(revenue)],
      [
        "کالاهای تخفیف‌دار",
        formatNumber(PRODUCTS.filter((p) => p.discount > 0).length),
      ],
    ];
    const byGender = Object.entries(genderLabels).map(([key, label]) => [
      label,
      PRODUCTS.filter((p) => p.gender === key).length,
    ]);
    const byType = Object.entries(TYPE_LABELS).map(([key, label]) => [
      label,
      PRODUCTS.filter((p) => p.type === key).length,
    ]);

    return `
      <h2>داشبورد</h2>
      <div class="stats">${stats.map(([label, value]) => `<div class="stat">${label}<b>${value}</b></div>`).join("")}</div>
      <div class="two">
        <div class="panel"><h3>محصولات به تفکیک دسته</h3>${barsHTML(byGender)}</div>
        <div class="panel"><h3>محصولات به تفکیک نوع</h3>${barsHTML(byType)}</div>
      </div>
      <div class="panel tbl-wrap"><h3>آخرین سفارش‌ها</h3>${orderTableHTML(orders.slice(0, 5), false)}</div>`;
  }

  /* ---------- محصولات ---------- */

  function productsHTML() {
    return `
      <div class="head">
        <h2>مدیریت محصولات</h2>
        <div>
          <button class="btn-sm" data-act="exportProducts">⬇ CSV</button>
          <button class="btn-sm btn-p" data-act="newProduct">+ محصول جدید</button>
        </div>
      </div>
      <div class="filters">
        <input class="adm-input" data-filter="search" placeholder="جستجوی نام یا برند" value="${filters.search}">
        <select class="adm-input" data-filter="gender">${options(genderLabels, filters.gender, "همه دسته‌ها")}</select>
        <select class="adm-input" data-filter="type">${options(TYPE_LABELS, filters.type, "همه نوع‌ها")}</select>
      </div>
      <div class="panel tbl-wrap" id="productTable">${productTableHTML()}</div>`;
  }

  function filteredProducts() {
    const term = normalize(filters.search);
    return PRODUCTS.filter(
      (p) =>
        (!term || `${p.title} ${p.brand}`.includes(term)) &&
        (!filters.gender || p.gender === filters.gender) &&
        (!filters.type || p.type === filters.type),
    );
  }

  function productTableHTML() {
    const rows = filteredProducts()
      .map(
        (p) => `
      <tr>
        <td style="font-size:22px">${p.emoji}</td>
        <td>${p.title}</td>
        <td>${p.brand}</td>
        <td>${genderLabels[p.gender]}</td>
        <td>${TYPE_LABELS[p.type] || p.type}</td>
        <td>${formatNumber(p.price)}</td>
        <td>${p.discount ? `${formatNumber(p.discount)}٪` : "—"}</td>
        <td>
          <button class="btn-sm" data-act="editProduct" data-id="${p.id}">ویرایش</button>
          ${can("products.delete") ? `<button class="btn-sm btn-d" data-act="deleteProduct" data-id="${p.id}">حذف</button>` : ""}
        </td>
      </tr>`,
      )
      .join("");

    return `
      <table>
        <thead><tr><th></th><th>نام</th><th>برند</th><th>دسته</th><th>نوع</th><th>قیمت (تومان)</th><th>تخفیف</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" class="muted">محصولی پیدا نشد</td></tr>'}</tbody>
      </table>`;
  }

  function openProductForm(id) {
    const p = id
      ? getProduct(id)
      : {
          title: "",
          brand: "",
          emoji: "👕",
          gender: "men",
          type: "shoe",
          price: "",
          discount: 0,
        };

    openModal(`
      <h3>${id ? "ویرایش محصول" : "محصول جدید"}</h3>
      <div class="form-grid">
        <label class="wide">نام محصول<input id="f-title" class="adm-input" value="${p.title}"></label>
        <label>برند<input id="f-brand" class="adm-input" value="${p.brand}"></label>
        <label>ایموجی<input id="f-emoji" class="adm-input" value="${p.emoji}"></label>
        <label>دسته<select id="f-gender" class="adm-input">${options(genderLabels, p.gender)}</select></label>
        <label>نوع<select id="f-type" class="adm-input">${options(TYPE_LABELS, p.type)}</select></label>
        <label>قیمت (تومان)<input id="f-price" class="adm-input" type="number" min="0" value="${p.price}"></label>
        <label>تخفیف ٪<input id="f-discount" class="adm-input" type="number" min="0" max="90" value="${p.discount}"></label>
      </div>
      <div class="actions">
        <button class="btn-sm" data-act="closeModal">انصراف</button>
        <button class="btn-sm btn-p" data-act="saveProduct" data-id="${id || ""}">ذخیره</button>
      </div>`);
  }

  function saveProduct(id) {
    const data = {
      title: clean($("#f-title").value),
      brand: clean($("#f-brand").value),
      emoji: clean($("#f-emoji").value) || "🛍️",
      gender: $("#f-gender").value,
      type: $("#f-type").value,
      price: Math.round(+$("#f-price").value),
      discount: Math.round(+$("#f-discount").value || 0),
    };

    if (!data.title || !data.brand) return toast("نام و برند را وارد کنید");
    if (!(data.price > 0)) return toast("قیمت معتبر نیست");
    if (data.discount < 0 || data.discount > 90)
      return toast("تخفیف باید بین ۰ تا ۹۰ باشد");

    if (id) Object.assign(getProduct(id), data);
    else PRODUCTS.push({ id: nextProductId(), ...data });

    saveProducts();
    closeModal();
    renderPage();
    toast("ذخیره شد ✓");
  }

  /* ---------- سفارش‌ها ---------- */

  function orderTableHTML(list, editable = true) {
    const rows = list
      .map(
        (o) => `
      <tr>
        <td>${o.id}</td>
        <td>${dateFa(o.date)}</td>
        <td>${o.customer}</td>
        <td>${formatNumber(o.items.reduce((n, i) => n + i.qty, 0))}</td>
        <td>${formatNumber(o.payable)}</td>
        <td>${
          editable && can("orders.write")
            ? `<select class="adm-input" data-order="${o.id}">${options(STATUSES, o.status)}</select>`
            : `<span class="badge">${STATUSES[o.status]}</span>`
        }</td>
        ${
          editable
            ? `<td>
          <button class="btn-sm" data-act="orderDetail" data-id="${o.id}">جزئیات</button>
          ${can("orders.delete") ? `<button class="btn-sm btn-d" data-act="deleteOrder" data-id="${o.id}">حذف</button>` : ""}
        </td>`
            : ""
        }
      </tr>`,
      )
      .join("");

    return `
      <table>
        <thead><tr><th>شماره</th><th>تاریخ</th><th>مشتری</th><th>تعداد</th><th>مبلغ (تومان)</th><th>وضعیت</th>${editable ? "<th></th>" : ""}</tr></thead>
        <tbody>${rows || `<tr><td colspan="7" class="muted">هنوز سفارشی ثبت نشده</td></tr>`}</tbody>
      </table>`;
  }

  function ordersHTML() {
    return `
      <div class="head">
        <h2>سفارش‌ها</h2>
        <button class="btn-sm" data-act="exportOrders">⬇ CSV</button>
      </div>
      <div class="panel tbl-wrap">${orderTableHTML(Store.orders())}</div>`;
  }

  function openOrderDetail(id) {
    const order = Store.orders().find((o) => o.id === id);
    if (!order) return;

    openModal(`
      <h3>سفارش ${order.id}</h3>
      <p class="muted">${dateFa(order.date)} | ${order.customer}</p>
      <table style="margin:14px 0">
        <thead><tr><th>کالا</th><th>سایز</th><th>تعداد</th><th>قیمت</th></tr></thead>
        <tbody>${order.items
          .map(
            (i) =>
              `<tr><td style="white-space:normal">${i.title}</td><td>${i.size}</td><td>${formatNumber(i.qty)}</td><td>${formatNumber(i.price)}</td></tr>`,
          )
          .join("")}</tbody>
      </table>
      <p>جمع کالاها: ${formatNumber(order.total)} | تخفیف: ${formatNumber(order.discount)}</p>
      <p><b>قابل پرداخت: ${formatNumber(order.payable)} تومان</b></p>
      <div class="actions"><button class="btn-sm" data-act="closeModal">بستن</button></div>`);
  }

  /* ---------- تنظیمات (فقط مالک) ---------- */

  function settingsHTML() {
    if (!can("settings")) return '<p class="muted">دسترسی ندارید.</p>';
    const s = Settings.get();

    return `
      <h2>تنظیمات فروشگاه</h2>
      <div class="panel">
        <div class="form-grid">
          <label class="wide">متن نوار بالای سایت<input id="s-promo" class="adm-input" value="${s.promoText}"></label>
          <label>حداقل خرید برای تخفیف (تومان)<input id="s-threshold" class="adm-input" type="number" value="${s.threshold}"></label>
          <label>مبلغ تخفیف (تومان)<input id="s-amount" class="adm-input" type="number" value="${s.discountAmount}"></label>
        </div>
        <button class="btn-sm btn-p" data-act="saveSettings">ذخیره تنظیمات</button>
      </div>
      <div class="panel">
        <h3>عملیات خطرناک</h3>
        <button class="btn-sm btn-d" data-act="resetProducts">بازگردانی محصولات به حالت اولیه</button>
        <button class="btn-sm btn-d" data-act="clearOrders">پاک کردن همه سفارش‌ها</button>
        <p class="muted" style="margin-top:12px">حساب‌های مدیریت در دیتابیس سرور هستند و هیچ رمزی در فایل‌های سمت مرورگر ذخیره نمی‌شود.</p>
      </div>`;
  }

  function saveSettings() {
    const threshold = Math.round(+$("#s-threshold").value);
    const discountAmount = Math.round(+$("#s-amount").value);
    if (!(threshold > 0) || !(discountAmount >= 0))
      return toast("مبلغ‌ها معتبر نیستند");

    Settings.set({
      promoText: clean($("#s-promo").value),
      threshold,
      discountAmount,
    });
    toast("تنظیمات ذخیره شد ✓");
  }

  /* ---------- رویدادها ---------- */

  const actions = {
    login: doLogin,
    logout,
    closeModal,
    nav(el) {
      page = el.dataset.page;
      renderShell();
    },

    newProduct: () => openProductForm(),
    editProduct: (el) => openProductForm(+el.dataset.id),
    saveProduct: (el) => saveProduct(el.dataset.id ? +el.dataset.id : null),

    deleteProduct(el) {
      if (!can("products.delete") || !confirm("این محصول حذف شود؟")) return;
      PRODUCTS.splice(PRODUCTS.indexOf(getProduct(+el.dataset.id)), 1);
      saveProducts();
      renderPage();
      toast("محصول حذف شد");
    },

    orderDetail: (el) => openOrderDetail(el.dataset.id),

    deleteOrder(el) {
      if (!can("orders.delete") || !confirm("این سفارش حذف شود؟")) return;
      Store.deleteOrder(el.dataset.id);
      renderPage();
    },

    clearOrders() {
      if (!can("settings") || !confirm("همه سفارش‌ها پاک شوند؟")) return;
      Store.clearOrders();
      toast("سفارش‌ها پاک شدند");
    },

    resetProducts() {
      if (
        !can("settings") ||
        !confirm("همه تغییرات محصولات از بین می‌رود. ادامه می‌دهید؟")
      )
        return;
      resetProducts();
      toast("محصولات به حالت اولیه برگشتند");
    },

    saveSettings,

    exportProducts() {
      downloadCSV("products.csv", [
        ["id", "title", "brand", "gender", "type", "price", "discount"],
        ...PRODUCTS.map((p) => [
          p.id,
          p.title,
          p.brand,
          p.gender,
          p.type,
          p.price,
          p.discount,
        ]),
      ]);
    },

    exportOrders() {
      downloadCSV("orders.csv", [
        ["id", "date", "customer", "status", "total", "discount", "payable"],
        ...Store.orders().map((o) => [
          o.id,
          o.date,
          o.customer,
          o.status,
          o.total,
          o.discount,
          o.payable,
        ]),
      ]);
    },
  };

  // یک شنونده برای کل صفحه؛ مودال‌ها هم بیرون از root ساخته می‌شوند
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("adm-modal-bg")) return closeModal();

    const el = e.target.closest("[data-act]");
    if (el && actions[el.dataset.act]) actions[el.dataset.act](el);
  });

  root.addEventListener("input", (e) => {
    const key = e.target.dataset.filter;
    if (!key) return;
    filters[key] = e.target.value;
    $("#productTable").innerHTML = productTableHTML();
  });

  root.addEventListener("change", (e) => {
    const key = e.target.dataset.filter;
    if (key) {
      filters[key] = e.target.value;
      $("#productTable").innerHTML = productTableHTML();
    }
    const orderId = e.target.dataset.order;
    if (orderId) {
      Store.updateOrder(orderId, e.target.value);
      toast("وضعیت سفارش به‌روز شد ✓");
    }
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && $("#pass")) doLogin();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // وقتی مشتری در تب دیگر سفارش ثبت کرد، لیست خودکار به‌روز شود
  window.addEventListener("storage", () => {
    Store.reloadOrders();
    if (session && (page === "orders" || page === "dashboard")) renderPage();
  });

  init();
})();
