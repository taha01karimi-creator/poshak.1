

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
    bag: "کیف",
    watch: "ساعت",
  };

  const NAV = [
    ["dashboard", "📊", "داشبورد"],
    ["products", "🛍️", "محصولات"],
    ["orders", "📦", "سفارش‌ها"],
    ["settings", "⚙️", "تنظیمات"],
    ["audit", "🗂️", "رویدادها"],
  ];

  const root = $("#admin");
  const filters = { search: "", gender: "", type: "" };

  const data = {
    products: [],
    orders: [],
    settings: {},
    stats: null,
    recent: [],
    audit: [],
  };

  

  const DEMO = {
    role: "owner",
    key: DEMO_DB_KEY,
    ordersKey: DEMO_ORDERS_KEY,
  };

  const STATIC_HOST =
    /\.(github\.io|pages\.dev)$/.test(location.hostname) ||
    location.protocol === "file:";
  const DEMO_ENABLED = window.CODELAINE_DEMO === true || STATIC_HOST;

  let demoMode = false;

  function demoSeed() {
    const products = FALLBACK_PRODUCTS.map((product) => ({ ...product }));
    const makeOrder = (n, id, status, days, phone) => {
      const product = products[n % products.length];
      const price = finalPrice(product);
      const qty = 1 + (n % 2);
      const total = price * qty;
      const payable =
        total >= DEFAULT_SETTINGS.threshold
          ? total - DEFAULT_SETTINGS.discountAmount
          : total;

      return {
        id,
        date: new Date(Date.now() - days * 86400000).toISOString(),
        status,
        customer: `${phone.slice(0, 4)}***${phone.slice(-2)}`,
        phone,
        items: [{ title: product.title, size: "M", qty, price }],
        items_count: qty,
        total,
        discount: total - payable,
        payable,
      };
    };

    return {
      products,
      orders: [
        makeOrder(3, "CL-A1B2C3", "pending", 0.2, "09121234567"),
        makeOrder(9, "CL-D4E5F6", "processing", 1, "09351234567"),
        makeOrder(15, "CL-G7H8I9", "delivered", 4, "09191234567"),
      ],
      settings: { ...DEFAULT_SETTINGS },
      audit: [
        {
          created_at: new Date().toISOString(),
          action: "login",
          user_role: "owner",
          user_id: 1,
          details: "ورود نمایشی به پنل",
          ip_address: "127.0.0.1",
        },
      ],
    };
  }

  function demoDb() {
    try {
      const raw = localStorage.getItem(DEMO.key);
      if (raw) return mergeStoreOrders(JSON.parse(raw));
    } catch (error) {}

    const seed = demoSeed();
    try {
      localStorage.setItem(DEMO.key, JSON.stringify(seed));
    } catch (error) {}
    return mergeStoreOrders(seed);
  }

  const demoDbSave = (db) => {
    try {
      localStorage.setItem(DEMO.key, JSON.stringify(db));
    } catch (error) {}
  };

  function mergeStoreOrders(db) {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem(DEMO.ordersKey) || "[]");
    } catch (error) {}
    if (!Array.isArray(local) || !local.length) return db;

    const known = new Set(db.orders.map((order) => order.id));
    const fresh = local.filter((order) => order && !known.has(order.id));
    if (!fresh.length) return db;

    db.orders = [...fresh, ...db.orders];
    demoDbSave(db);
    return db;
  }

  const okRes = (payload) => ({
    response: { ok: true, status: 200, json: async () => payload },
    data: payload,
  });
  const errRes = (status, error) => ({
    response: { ok: false, status, json: async () => ({ error }) },
    data: { error },
  });

  function demoRequest(path, { method = "GET", body } = {}) {
    const db = demoDb();
    const save = () => demoDbSave(db);
    const route = String(path).split("?")[0];
    const parts = route.split("/").filter(Boolean);

    if (route === "/auth/login" && method === "POST") {
      if (!body.username || !body.password) {
        return errRes(401, "نام کاربری و رمز عبور را وارد کنید");
      }
      return okRes({
        user: {
          username: body.username,
          role: DEMO.role,
          title: "مالک فروشگاه (نمایشی)",
        },
      });
    }
    if (route === "/auth/logout") return okRes({ ok: true });
    if (route === "/auth/me") {
      return okRes({
        user: {
          username: session?.username || "demo",
          role: session?.role || DEMO.role,
        },
      });
    }

    if (route === "/products" && method === "GET")
      return okRes({ products: db.products });
    if (route === "/products" && method === "POST") {
      const id = Math.max(-1, ...db.products.map((p) => Number(p.id))) + 1;
      const product = { ...body, id };
      db.products.push(product);
      save();
      return okRes({ product });
    }
    if (parts[0] === "products" && parts[1]) {
      const id = Number(parts[1]);
      const index = db.products.findIndex((p) => Number(p.id) === id);
      if (index === -1) return errRes(404, "محصول پیدا نشد");
      if (method === "PUT") {
        db.products[index] = { ...db.products[index], ...body, id };
        save();
        return okRes({ product: db.products[index] });
      }
      if (method === "DELETE") {
        db.products.splice(index, 1);
        save();
        return okRes({ ok: true });
      }
    }

    if (route === "/orders" && method === "GET") return okRes({ orders: db.orders });
    if (parts[0] === "orders" && parts[1]) {
      const id = decodeURIComponent(parts[1]);
      const index = db.orders.findIndex((order) => order.id === id);
      if (index === -1) return errRes(404, "سفارش پیدا نشد");
      if (method === "GET") return okRes({ order: db.orders[index] });
      if (method === "PUT") {
        db.orders[index] = { ...db.orders[index], ...body };
        save();
        return okRes({ order: db.orders[index] });
      }
      if (method === "DELETE") {
        db.orders.splice(index, 1);
        save();
        try {
          const local = JSON.parse(
            localStorage.getItem(DEMO.ordersKey) || "[]",
          );
          const rest = local.filter((order) => order.id !== id);
          if (rest.length !== local.length)
            localStorage.setItem(DEMO.ordersKey, JSON.stringify(rest));
        } catch (error) {}
        return okRes({ ok: true });
      }
    }

    if (route === "/settings" && method === "GET") return okRes({ settings: db.settings });
    if (route === "/settings" && method === "PUT") {
      db.settings = { ...db.settings, ...body };
      save();
      return okRes({ settings: db.settings });
    }

    if (route === "/dashboard/stats") {
      const by_gender = {};
      const by_type = {};
      db.products.forEach((p) => {
        by_gender[p.gender] = (by_gender[p.gender] || 0) + 1;
        by_type[p.type] = (by_type[p.type] || 0) + 1;
      });

      return okRes({
        stats: {
          total_products: db.products.length,
          total_orders: db.orders.length,
          revenue_toman: db.orders
            .filter((order) => order.status !== "cancelled")
            .reduce((sum, order) => sum + Number(order.payable || 0), 0),
          discounted_products: db.products.filter((p) => p.discount > 0).length,
          by_gender,
          by_type,
        },
        recent_orders: db.orders.slice(0, 5),
      });
    }

    if (route === "/audit-logs") return okRes({ logs: db.audit });

    return errRes(404, "مسیر پیدا نشد");
  }

  let session = null;
  let page = "dashboard";
  let loginPending = false;

  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (error) {}
  if (session && !ROLE_PERMISSIONS[session.role]) session = null;

  

  const can = (permission) =>
    !!session && (ROLE_PERMISSIONS[session.role] || []).includes(permission);
  const clean = (text) => String(text ?? "").trim();
  const dateFa = (iso) => (iso ? new Date(iso).toLocaleString("fa-IR") : "—");
  const api = (path, options) =>
    demoMode ? Promise.resolve(demoRequest(path, options)) : apiRequest(path, options);

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("on");
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => el.classList.remove("on"), 2600);
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
        row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
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
    (firstLabel ? `<option value="">${escapeHTML(firstLabel)}</option>` : "") +
    Object.entries(map)
      .map(
        ([key, label]) =>
          `<option value="${key}" ${key === selected ? "selected" : ""}>${escapeHTML(label)}</option>`,
      )
      .join("");

  const genderLabels = Object.fromEntries(
    Object.entries(GENDERS).map(([k, g]) => [k, g.label]),
  );

  const ROLE_TITLES = { owner: "مالک فروشگاه", admin: "مدیر سایت" };

  const saveSession = () => {
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
          <p class="muted">CODELAINE</p>
          <input id="user" class="adm-input" placeholder="نام کاربری" autocomplete="username">
          <input id="pass" class="adm-input" type="password" placeholder="رمز عبور" autocomplete="current-password">
          <p class="err">${escapeHTML(message)}</p>
          <button class="btn-sm btn-p full" data-act="login">ورود</button>
          
          ${
            DEMO_ENABLED
              ? `<p class="muted">نسخهٔ نمایشی (بدون سرور) هیچ رمزی ندارد و فقط داده‌های همین مرورگر را نشان می‌دهد.</p>`
              : ""
          }
          <p class="muted">ورود با حساب دیتابیس روی سرور انجام می‌شود.</p>
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

    let result = null;
    if (!demoMode) {
      try {
        result = await apiRequest("/auth/login", {
          method: "POST",
          body: { username, password },
        });
      } catch (error) {
        result = null;
      }
    }

    const noBackend =
      !result ||
      [0, 404, 405, 501].includes(result.response?.status);

    if (noBackend && !DEMO_ENABLED) {
      loginPending = false;
      return renderLogin(
        "سرور در دسترس نیست؛ ورود انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید.",
      );
    }

    if (noBackend) {
      demoMode = true;
      session = {
        role: DEMO.role,
        username,
        title: "مالک فروشگاه (نمایشی)",
        demo: true,
      };
      saveSession();
      loginPending = false;
      page = "dashboard";
      if (!(await loadData())) return renderLogin("داده‌های نمایشی بارگذاری نشد");
      renderShell();
      return;
    }

    loginPending = false;

    const { response, data: payload } = result;
    if (response.status === 429) {
      return renderLogin("تلاش‌های ناموفق زیاد بوده؛ چند دقیقه بعد دوباره امتحان کنید");
    }
    if (!response.ok || !payload.user) {
      return renderLogin("نام کاربری یا رمز عبور اشتباه است");
    }
    if (!ROLE_PERMISSIONS[payload.user.role]) {
      try {
        await api("/auth/logout", { method: "POST" });
      } catch (error) {}
      return renderLogin("این حساب به پنل مدیریت دسترسی ندارد");
    }

    session = sessionFrom(payload.user);
    saveSession();
    page = "dashboard";

    if (!(await loadData())) return;
    renderShell();
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      
    }
    session = null;
    demoMode = false;
    saveSession();
    renderLogin();
  }

  
  function expired(message) {
    session = null;
    demoMode = false;
    saveSession();
    renderLogin(message);
  }

  async function bootstrap() {
    if (!session) return renderLogin();

    if (session.demo) {
      if (!DEMO_ENABLED) {
        return expired("نشست نمایشی در این نسخه غیرفعال است؛ دوباره وارد شوید");
      }
      demoMode = true;
      if (!(await loadData())) return expired("داده‌های نمایشی بارگذاری نشد");
      renderShell();
      return;
    }

    let me;
    try {
      me = await api("/auth/me");
    } catch (error) {
      return expired("به سرور وصل نشد. پنل را از آدرس سرور باز کنید.");
    }

    if (!me.response.ok || !me.data.user) {
      return expired("نشست شما معتبر نیست؛ دوباره وارد شوید");
    }
    if (!ROLE_PERMISSIONS[me.data.user.role]) {
      return expired("این حساب به پنل مدیریت دسترسی ندارد");
    }

    session = sessionFrom(me.data.user);
    saveSession();

    if (!(await loadData())) return;
    renderShell();
  }

  

  async function loadData() {
    try {
      const products = await api("/products?per_page=100");
      data.products = products.data.products || [];

      if (can("orders.read")) {
        const orders = await api("/orders?per_page=100");
        data.orders = orders.data.orders || [];
      }

      const settings = await api("/settings");
      data.settings = settings.data.settings || {};

      if (can("dashboard.read")) {
        const stats = await api("/dashboard/stats");
        data.stats = stats.data.stats || null;
        data.recent = stats.data.recent_orders || [];
      }

      if (can("audit.read")) {
        const audit = await api("/audit-logs?per_page=50");
        data.audit = audit.data.logs || [];
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async function refresh() {
    if (!(await loadData())) {
      toast("به سرور وصل نشد؛ داده‌ها به‌روز نشدند");
      return;
    }
    renderPage();
  }

  

  function renderShell() {
    const items = NAV.filter(([key]) => {
      if (key === "settings") return can("settings.read");
      if (key === "audit") return can("audit.read");
      if (key === "orders") return can("orders.read");
      return true;
    });

    root.innerHTML = `
      <div class="adm-shell">
        <header class="adm-top">
          <div class="adm-logo">CODELAINE</div>
          <small class="muted">${escapeHTML(session.title)}</small>
        </header>
        <aside class="adm-side">
          <div class="adm-logo">CODELAINE</div>
          <small class="muted">${escapeHTML(session.title)}</small>
          ${items
            .map(
              ([key, icon, label]) =>
                `<button class="${key === page ? "on" : ""}" data-act="nav" data-page="${key}"><span class="ni">${icon}</span><span>${label}</span></button>`,
            )
            .join("")}
          <span style="flex:1"></span>
          <a href="index.html"><span class="ni">🏬</span><span>فروشگاه</span></a>
          <button data-act="logout"><span class="ni">🚪</span><span>خروج</span></button>
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
      audit: auditHTML,
    };
    const content = $("#content");
    if (content) content.innerHTML = (pages[page] || dashboardHTML)();
  }

  

  const barsHTML = (rows) => {
    const max = Math.max(1, ...rows.map(([, n]) => n));
    return `<div class="bars">${rows
      .map(
        ([label, n]) => `
      <div class="row"><span>${escapeHTML(label)}</span><i style="width:${(n / max) * 100}%"></i><b>${formatNumber(n)}</b></div>`,
      )
      .join("")}</div>`;
  };

  function dashboardHTML() {
    const stats = data.stats || {};
    const cards = [
      ["تعداد محصولات", formatNumber(stats.total_products ?? data.products.length)],
      ["تعداد سفارش‌ها", formatNumber(stats.total_orders ?? data.orders.length)],
      ["درآمد (تومان)", formatNumber(stats.revenue_toman ?? 0)],
      [
        "کالاهای تخفیف‌دار",
        formatNumber(
          stats.discounted_products ??
            data.products.filter((p) => p.discount > 0).length,
        ),
      ],
    ];

    const byGender = Object.entries(genderLabels).map(([key, label]) => [
      label,
      (stats.by_gender || {})[key] || 0,
    ]);
    const byType = Object.entries(TYPE_LABELS).map(([key, label]) => [
      label,
      (stats.by_type || {})[key] || 0,
    ]);
    const recent = data.recent.length ? data.recent : data.orders.slice(0, 5);

    return `
      <h2>داشبورد</h2>
      <div class="stats">${cards
        .map(([label, value]) => `<div class="stat">${label}<b>${value}</b></div>`)
        .join("")}</div>
      <div class="two">
        <div class="panel"><h3>محصولات به تفکیک دسته</h3>${barsHTML(byGender)}</div>
        <div class="panel"><h3>محصولات به تفکیک نوع</h3>${barsHTML(byType)}</div>
      </div>
      ${
        can("orders.read")
          ? `<div class="panel tbl-wrap"><h3>آخرین سفارش‌ها</h3>${orderTableHTML(recent, false)}</div>`
          : ""
      }`;
  }

  

  function productsHTML() {
    const canWrite = can("products.write");
    return `
      <div class="head">
        <h2>مدیریت محصولات</h2>
        <div>
          <button class="btn-sm" data-act="exportProducts">⬇ CSV</button>
          ${canWrite ? `<button class="btn-sm btn-p" data-act="newProduct">+ محصول جدید</button>` : ""}
        </div>
      </div>
      <div class="filters">
        <input class="adm-input" data-filter="search" placeholder="جستجوی نام یا برند" value="${escapeHTML(filters.search)}">
        <select class="adm-input" data-filter="gender">${options(genderLabels, filters.gender, "همه دسته‌ها")}</select>
        <select class="adm-input" data-filter="type">${options(TYPE_LABELS, filters.type, "همه نوع‌ها")}</select>
      </div>
      <div class="panel tbl-wrap" id="productTable">${productTableHTML()}</div>`;
  }

  function filteredProducts() {
    const term = normalize(filters.search);
    return data.products.filter(
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
        <td data-label="" class="thumb">
          ${p.img ? `<img src="${escapeHTML(p.img)}" alt="">` : escapeHTML(p.emoji)}
        </td>
        <td data-label="نام">${escapeHTML(p.title)}</td>
        <td data-label="برند">${escapeHTML(p.brand)}</td>
        <td data-label="دسته">${escapeHTML(genderLabels[p.gender] || p.gender)}</td>
        <td data-label="نوع">${escapeHTML(TYPE_LABELS[p.type] || p.type)}</td>
        <td data-label="قیمت (تومان)">${formatNumber(p.price)}</td>
        <td data-label="تخفیف">${p.discount ? `${formatNumber(p.discount)}٪` : "—"}</td>
        <td class="act" data-label="">
          ${can("products.write") ? `<button class="btn-sm" data-act="editProduct" data-id="${p.id}">ویرایش</button>` : ""}
          ${can("products.delete") ? `<button class="btn-sm btn-d" data-act="deleteProduct" data-id="${p.id}">حذف</button>` : ""}
        </td>
      </tr>`,
      )
      .join("");

    return `
      <table class="rt">
        <thead><tr><th></th><th>نام</th><th>برند</th><th>دسته</th><th>نوع</th><th>قیمت (تومان)</th><th>تخفیف</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" class="muted">محصولی پیدا نشد</td></tr>'}</tbody>
      </table>`;
  }

  function openProductForm(id = null) {
    const p =
      data.products.find((item) => item.id === id) || {
        title: "",
        brand: "",
        emoji: "👕",
        img: "",
        gender: "men",
        type: "shoe",
        price: "",
        discount: 0,
      };

    openModal(`
      <h3>${id ? "ویرایش محصول" : "محصول جدید"}</h3>
      <div class="form-grid">
        <label class="wide">نام محصول<input id="f-title" class="adm-input" value="${escapeHTML(p.title)}"></label>
        <label>برند<input id="f-brand" class="adm-input" value="${escapeHTML(p.brand)}"></label>
        <label>ایموجی<input id="f-emoji" class="adm-input" value="${escapeHTML(p.emoji)}"></label>
        <label class="wide">آدرس تصویر محصول<input id="f-img" class="adm-input" value="${escapeHTML(p.img || "")}" placeholder="images/products/shoe.jpg"></label>
        <label>دسته<select id="f-gender" class="adm-input">${options(genderLabels, p.gender)}</select></label>
        <label>نوع<select id="f-type" class="adm-input">${options(TYPE_LABELS, p.type)}</select></label>
        <label>قیمت (تومان)<input id="f-price" class="adm-input" type="number" min="0" value="${escapeHTML(p.price)}"></label>
        <label>تخفیف ٪<input id="f-discount" class="adm-input" type="number" min="0" max="90" value="${escapeHTML(p.discount)}"></label>
      </div>
      <div class="actions">
        <button class="btn-sm" data-act="closeModal">انصراف</button>
        <button class="btn-sm btn-p" data-act="saveProduct" data-id="${id ?? ""}">ذخیره</button>
      </div>`);
  }

  async function saveProduct(id) {
    const payload = {
      title: clean($("#f-title").value),
      brand: clean($("#f-brand").value),
      emoji: clean($("#f-emoji").value) || "🛍️",
      img: clean($("#f-img").value),
      gender: $("#f-gender").value,
      type: $("#f-type").value,
      price: Math.round(+$("#f-price").value),
      discount: Math.round(+$("#f-discount").value || 0),
    };

    if (!payload.title || !payload.brand) return toast("نام و برند را وارد کنید");
    if (!(payload.price > 0)) return toast("قیمت معتبر نیست");
    if (payload.discount < 0 || payload.discount > 90)
      return toast("تخفیف باید بین ۰ تا ۹۰ باشد");

    const result =
      id === null
        ? await api("/products", { method: "POST", body: payload })
        : await api(`/products/${id}`, { method: "PUT", body: payload });

    if (result.response.status === 401) return expired("نشست منقضی شد؛ دوباره وارد شوید");
    if (!result.response.ok)
      return toast(result.data.error || "ذخیره نشد");

    closeModal();
    await refresh();
    toast("ذخیره شد ✓");
  }

  

  function orderTableHTML(list, editable = true) {
    const rows = list
      .map(
        (o) => `
      <tr>
        <td data-label="کد رهگیری">${escapeHTML(o.id)}</td>
        <td data-label="تاریخ">${dateFa(o.date)}</td>
        <td data-label="موبایل">${escapeHTML(o.phone || "—")}</td>
        <td data-label="مشتری">${escapeHTML(o.customer)}</td>
        <td data-label="تعداد">${o.items_count === undefined ? "—" : formatNumber(o.items_count)}</td>
        <td data-label="مبلغ (تومان)">${formatNumber(o.payable)}</td>
        <td data-label="وضعیت">${
          editable && can("orders.write")
            ? `<select class="adm-input" data-order="${escapeHTML(o.id)}">${options(STATUSES, o.status)}</select>`
            : `<span class="badge">${escapeHTML(STATUSES[o.status] || o.status)}</span>`
        }</td>
        ${
          editable
            ? `<td class="act" data-label="">
          <button class="btn-sm" data-act="orderDetail" data-id="${escapeHTML(o.id)}">جزئیات</button>
          ${can("orders.delete") ? `<button class="btn-sm btn-d" data-act="deleteOrder" data-id="${escapeHTML(o.id)}">حذف</button>` : ""}
        </td>`
            : ""
        }
      </tr>`,
      )
      .join("");

    return `
      <table class="rt">
        <thead><tr><th>کد رهگیری</th><th>تاریخ</th><th>موبایل</th><th>مشتری</th><th>تعداد</th><th>مبلغ (تومان)</th><th>وضعیت</th>${editable ? "<th></th>" : ""}</tr></thead>
        <tbody>${rows || `<tr><td colspan="${editable ? 8 : 7}" class="muted">هنوز سفارشی ثبت نشده</td></tr>`}</tbody>
      </table>`;
  }

  function ordersHTML() {
    if (!can("orders.read")) return '<p class="muted">دسترسی ندارید.</p>';
    return `
      <div class="head">
        <h2>سفارش‌ها</h2>
        <button class="btn-sm" data-act="exportOrders">⬇ CSV</button>
      </div>
      <div class="panel tbl-wrap">${orderTableHTML(data.orders)}</div>`;
  }

  async function openOrderDetail(id) {
    const result = await api(`/orders/${encodeURIComponent(id)}`);
    if (!result.response.ok) return toast("سفارش پیدا نشد");

    const order = result.data.order;
    openModal(`
      <h3>سفارش ${escapeHTML(order.id)}</h3>
      <p class="muted">
        ${dateFa(order.date)} | مشتری: ${escapeHTML(order.customer)}
        ${order.phone ? ` | موبایل: ${escapeHTML(order.phone)}` : " | بدون شمارهٔ موبایل"}
      </p>
      <p class="muted">کد رهگیری برای مشتری: <b style="color:inherit">${escapeHTML(order.id)}</b>
        <button class="btn-sm" data-act="copyCode" data-id="${escapeHTML(order.id)}">کپی</button>
      </p>
      <div class="tbl-wrap"><table style="margin:14px 0">
        <thead><tr><th>کالا</th><th>سایز</th><th>تعداد</th><th>قیمت</th></tr></thead>
        <tbody>${(order.items || [])
          .map(
            (i) =>
              `<tr><td style="white-space:normal">${escapeHTML(i.title)}</td><td>${escapeHTML(i.size)}</td><td>${formatNumber(i.qty)}</td><td>${formatNumber(i.price)}</td></tr>`,
          )
          .join("")}</tbody>
      </table></div>
      <p>جمع کالاها: ${formatNumber(order.total)} | تخفیف: ${formatNumber(order.discount)}</p>
      <p><b>قابل پرداخت: ${formatNumber(order.payable)} تومان</b></p>
      <div class="actions"><button class="btn-sm" data-act="closeModal">بستن</button></div>`);
  }

  

  function settingsHTML() {
    if (!can("settings.read")) return '<p class="muted">دسترسی ندارید.</p>';
    const s = data.settings;

    return `
      <h2>تنظیمات فروشگاه</h2>
      <div class="panel">
        <div class="form-grid">
          <label>حداقل خرید برای تخفیف (تومان)<input id="s-threshold" class="adm-input" type="number" value="${escapeHTML(s.threshold || "")}"></label>
          <label>مبلغ تخفیف (تومان)<input id="s-amount" class="adm-input" type="number" value="${escapeHTML(s.discountAmount || "")}"></label>
        </div>
        ${
          can("settings.write")
            ? '<button class="btn-sm btn-p" data-act="saveSettings">ذخیره تنظیمات</button>'
            : '<p class="muted">فقط مالک فروشگاه می‌تواند تنظیمات را تغییر دهد.</p>'
        }
      </div>
      <div class="panel">
        <p class="muted">این مقادیر روی سرور ذخیره می‌شوند و بلافاصله در فروشگاه اعمال می‌شوند. حساب‌های مدیریت در جدول کاربران دیتابیس هستند و هیچ رمزی در فایل‌های سمت مرورگر نیست.</p>
      </div>`;
  }

  async function saveSettings() {
    const threshold = Math.round(+$("#s-threshold").value);
    const discountAmount = Math.round(+$("#s-amount").value);

    if (!(threshold > 0) || !(discountAmount >= 0))
      return toast("مبلغ‌ها معتبر نیستند");
    if (discountAmount >= threshold)
      return toast("مبلغ تخفیف باید کمتر از حداقل خرید باشد");

    const result = await api("/settings", {
      method: "PUT",
      body: {
        threshold,
        discountAmount,
      },
    });

    if (result.response.status === 401) return expired("نشست منقضی شد؛ دوباره وارد شوید");
    if (!result.response.ok) return toast(result.data.error || "ذخیره نشد");

    await refresh();
    toast("تنظیمات ذخیره شد ✓");
  }

  

  function auditHTML() {
    if (!can("audit.read")) return '<p class="muted">دسترسی ندارید.</p>';
    const rows = data.audit
      .map(
        (log) => `
      <tr>
        <td>${dateFa(log.created_at)}</td>
        <td>${escapeHTML(log.action)}</td>
        <td>${escapeHTML(log.user_role)} #${escapeHTML(log.user_id)}</td>
        <td>${escapeHTML(log.details || log.target_id || "—")}</td>
        <td>${escapeHTML(log.ip_address || "—")}</td>
      </tr>`,
      )
      .join("");

    return `
      <h2>رویدادهای مدیریتی</h2>
      <div class="panel tbl-wrap">
        <table>
          <thead><tr><th>زمان</th><th>عملیات</th><th>کاربر</th><th>جزئیات</th><th>IP</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5" class="muted">رویدادی ثبت نشده</td></tr>'}</tbody>
        </table>
      </div>`;
  }

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
    saveProduct: (el) =>
      saveProduct(el.dataset.id === "" ? null : +el.dataset.id),

    async deleteProduct(el) {
      if (!can("products.delete") || !confirm("این محصول حذف شود؟")) return;
      const result = await api(`/products/${el.dataset.id}`, { method: "DELETE" });
      if (result.response.status === 401) return expired("نشست منقضی شد؛ دوباره وارد شوید");
      if (!result.response.ok) return toast(result.data.error || "حذف نشد");
      await refresh();
      toast("محصول حذف شد");
    },

    orderDetail: (el) => openOrderDetail(el.dataset.id),

    copyCode(el) {
      const code = el.dataset.id || "";
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).then(() => toast("کد رهگیری کپی شد ✓"));
      } else {
        toast(code);
      }
    },

    async deleteOrder(el) {
      if (!can("orders.delete") || !confirm("این سفارش حذف شود؟")) return;
      const result = await api(`/orders/${encodeURIComponent(el.dataset.id)}`, {
        method: "DELETE",
      });
      if (result.response.status === 401) return expired("نشست منقضی شد؛ دوباره وارد شوید");
      if (!result.response.ok) return toast(result.data.error || "حذف نشد");
      await refresh();
      toast("سفارش حذف شد");
    },

    saveSettings,

    exportProducts() {
      downloadCSV("products.csv", [
        ["id", "title", "brand", "gender", "type", "price", "discount"],
        ...data.products.map((p) => [
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
        ["id", "date", "phone", "customer", "status", "total", "discount", "payable"],
        ...data.orders.map((o) => [
          o.id,
          o.date,
          o.phone || "",
          o.customer,
          o.status,
          o.total,
          o.discount,
          o.payable,
        ]),
      ]);
    },
  };

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("adm-modal-bg")) return closeModal();

    const el = e.target.closest("[data-act]");
    const handler = el && actions[el.dataset.act];
    if (!handler) return;

    try {
      const result = handler(el, e);
      if (result && typeof result.catch === "function") {
        result.catch(() => toast("خطا در ارتباط با سرور"));
      }
    } catch (error) {
      toast("خطا در انجام عملیات");
    }
  });

  root.addEventListener("input", (e) => {
    const key = e.target.dataset.filter;
    if (!key) return;
    filters[key] = e.target.value;
    const table = $("#productTable");
    if (table) table.innerHTML = productTableHTML();
  });

  root.addEventListener("change", async (e) => {
    const key = e.target.dataset.filter;
    if (key) {
      filters[key] = e.target.value;
      const table = $("#productTable");
      if (table) table.innerHTML = productTableHTML();
      return;
    }

    const orderId = e.target.dataset.order;
    if (!orderId) return;

    const result = await api(`/orders/${encodeURIComponent(orderId)}`, {
      method: "PUT",
      body: { status: e.target.value },
    });

    if (result.response.status === 401) return expired("نشست منقضی شد؛ دوباره وارد شوید");
    if (!result.response.ok) return toast(result.data.error || "وضعیت ذخیره نشد");

    await refresh();
    toast("وضعیت سفارش به‌روز شد ✓");
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && $("#pass")) doLogin();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  bootstrap();
})();
