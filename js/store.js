/* وضعیت محلی مشتری: سبد خرید، علاقه‌مندی‌ها و نام کاربر.
   سفارش‌ها روی سرور ثبت می‌شوند و در مرورگر ذخیره نمی‌شوند. */

const Store = (() => {
  const STORAGE_KEY = "digistyle:state";
  const ORDERS_KEY = "codelaine:orders";

  const read = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  };

  let state = {
    cart: {},
    wishlist: [],
    user: null,
    phone: null, // شمارهٔ کامل موبایل (برای پیگیری سفارش)
    lastOrder: null, // { id, phone } آخرین سفارش ثبت‌شده در این مرورگر
    ...read(STORAGE_KEY, {}),
  };
  const listeners = [];

  function commit() {
    write(STORAGE_KEY, state);
    listeners.forEach((fn) => fn());
  }

  // محصولی که مدیر حذف کرده باشد از سبد هم کنار گذاشته می‌شود
  const cartEntries = () =>
    Object.entries(state.cart)
      .map(([key, qty]) => {
        const [id, size] = key.split("|");
        return { key, product: getProduct(+id), size, qty };
      })
      .filter((entry) => entry.product);

  const cartTotal = () =>
    cartEntries().reduce((sum, e) => sum + finalPrice(e.product) * e.qty, 0);

  const discount = () => {
    const { threshold, discountAmount } = Settings.get();
    return cartTotal() >= threshold ? discountAmount : 0;
  };

  /* ---------- سفارش‌های محلی (نسخهٔ نمایشی بدون سرور) ---------- */

  const readOrders = () => read(ORDERS_KEY, []);
  const saveOrders = (list) => write(ORDERS_KEY, list);
  const makeCode = () =>
    "CL-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  function placeLocalOrder(entries) {
    const total = cartTotal();
    const discountValue = discount();
    const order = {
      id: makeCode(),
      date: new Date().toISOString(),
      status: "pending",
      customer: state.user || "مهمان",
      phone: state.phone || null,
      items: entries.map((e) => ({
        title: e.product.title,
        size: e.size,
        qty: e.qty,
        price: finalPrice(e.product),
      })),
      items_count: entries.reduce((sum, e) => sum + e.qty, 0),
      total,
      discount: discountValue,
      payable: Math.max(0, total - discountValue),
    };

    saveOrders([order, ...readOrders()].slice(0, 50));
    state.cart = {};
    state.lastOrder = { id: order.id, phone: state.phone || null };
    commit();
    return { ok: true, order };
  }

  return {
    get DISCOUNT_THRESHOLD() {
      return Settings.get().threshold;
    },
    get DISCOUNT_AMOUNT() {
      return Settings.get().discountAmount;
    },
    get user() {
      return state.user;
    },

    subscribe: (fn) => listeners.push(fn),

    cartEntries,
    cartTotal,
    discount,
    cartCount: () => cartEntries().reduce((sum, e) => sum + e.qty, 0),

    addToCart(id, size) {
      const key = `${id}|${size}`;
      state.cart[key] = (state.cart[key] || 0) + 1;
      commit();
    },
    changeQty(key, delta) {
      state.cart[key] = (state.cart[key] || 0) + delta;
      if (state.cart[key] < 1) delete state.cart[key];
      commit();
    },
    clearCart() {
      state.cart = {};
      commit();
    },

    wishlist: () => state.wishlist.filter((id) => getProduct(id)),
    isWished: (id) => state.wishlist.includes(id),
    toggleWish(id) {
      const index = state.wishlist.indexOf(id);
      index === -1 ? state.wishlist.push(id) : state.wishlist.splice(index, 1);
      commit();
      return index === -1;
    },

    get phone() {
      return state.phone;
    },
    get lastOrder() {
      return state.lastOrder;
    },

    login(phone) {
      state.phone = phone;
      state.user = `${phone.slice(0, 4)}***${phone.slice(-2)}`;
      commit();
    },

    /* ---------- ثبت سفارش روی سرور ---------- */

    async placeOrder() {
      const entries = cartEntries();
      if (!entries.length) return { ok: false, error: "سبد خرید خالی است" };

      // فقط شناسه، سایز و تعداد فرستاده می‌شود؛ قیمت را سرور حساب می‌کند
      const items = entries.map((e) => ({
        product_id: e.product.id,
        size: e.size,
        qty: e.qty,
      }));

      try {
        const response = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            customer: state.user || "مهمان",
            phone: state.phone || null,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.order) {
          state.cart = {};
          state.lastOrder = { id: data.order.id, phone: state.phone || null };
          commit();
          return { ok: true, order: data.order };
        }
        // اگر سرور خطای معتبری داد، همان پیام نمایش داده می‌شود
        if (data && data.error) return { ok: false, error: data.error };
      } catch (error) {
        /* سرور در دسترس نیست؛ سفارش به‌صورت محلی ثبت می‌شود */
      }

      return placeLocalOrder(entries);
    },

    /* ---------- پیگیری سفارش با کد رهگیری ---------- */

    async trackOrder(code, phone) {
      const codeInput = code;
      const params = new URLSearchParams({
        code: String(code || "").trim().toUpperCase(),
      });
      if (phone) params.set("phone", String(phone).trim());

      let serverError = "";
      try {
        const response = await fetch(`${API_BASE}/orders/track?${params}`);
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.order) return { ok: true, order: data.order };
        serverError = (data && data.error) || "";
      } catch (error) {
        /* سرور در دسترس نیست؛ سفارش‌های محلی بررسی می‌شوند */
      }

      // نسخهٔ نمایشی: سفارش‌ها در همین مرورگر نگه‌داری می‌شوند
      const localCode = String(codeInput).trim().toUpperCase();
      const local = readOrders().find((order) => order.id === localCode);
      if (!local) {
        return { ok: false, error: serverError || "سفارشی با این کد یافت نشد" };
      }
      const mobile = String(phone || "").trim();
      if (mobile && local.phone && local.phone !== mobile) {
        return { ok: false, error: "شمارهٔ موبایل با این سفارش نمی‌خواند" };
      }
      return { ok: true, order: local };
    },
  };
})();
