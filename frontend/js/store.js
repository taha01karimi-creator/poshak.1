

const Store = (() => {
  const STORAGE_KEY = "digistyle:state";

  
  const DEMO_ONLY =
    window.CODELAINE_DEMO === true ||
    /\.(github\.io|pages\.dev)$/.test(location.hostname) ||
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ||
    location.protocol === "file:";

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
    phone: null,
    lastOrder: null,
    ...read(STORAGE_KEY, {}),
  };
  const listeners = [];

  function commit() {
    write(STORAGE_KEY, state);
    listeners.forEach((fn) => fn());
  }

  
  const readDemoOrders = () => {
    try {
      const list = JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  };

  function saveDemoOrder(order) {
    const rest = readDemoOrders().filter((item) => item.id !== order.id);
    write(DEMO_ORDERS_KEY, [order, ...rest]);
  }

  
  function completeDemoOrder(entries) {
    const total = cartTotal();
    const off = discount();
    const known = new Set(readDemoOrders().map((item) => item.id));
    let id;
    do {
      id = "CL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    } while (known.has(id));

    const order = {
      id,
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
      discount: off,
      payable: Math.max(0, total - off),
    };

    state.cart = {};
    state.lastOrder = { id: order.id, phone: state.phone || null };
    commit();
    saveDemoOrder(order);
    return { ok: true, order, demo: true };
  }

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

    

    async placeOrder() {
      const entries = cartEntries();
      if (!entries.length) return { ok: false, error: "سبد خرید خالی است" };

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
        if (data && data.error) return { ok: false, error: data.error };
        if (DEMO_ONLY) return completeDemoOrder(entries);
      } catch (error) {
        if (DEMO_ONLY) return completeDemoOrder(entries);
        return {
          ok: false,
          error: "سفارش ثبت نشد؛ اتصال به سرور برقرار نیست. دوباره تلاش کنید.",
        };
      }

      return { ok: false, error: "سفارش ثبت نشد، دوباره تلاش کنید" };
    },

    

    async trackOrder(code, phone) {
      const wanted = String(code || "").trim().toUpperCase();
      const params = new URLSearchParams({ code: wanted });
      if (phone) params.set("phone", String(phone).trim());

      const demoLookup = () => {
        const wantedPhone = String(phone || "").trim();
        let list = readDemoOrders();
        try {
          const adminDb = JSON.parse(localStorage.getItem(DEMO_DB_KEY) || "null");
          if (adminDb && Array.isArray(adminDb.orders)) {
            list = [...adminDb.orders, ...list];
          }
        } catch (error) {}

        const order = list.find(
          (item) =>
            String(item.id).toUpperCase() === wanted &&
            (!wantedPhone || !item.phone || String(item.phone) === wantedPhone),
        );
        return order
          ? { ok: true, order, demo: true }
          : { ok: false, error: "سفارشی با این کد یافت نشد" };
      };

      try {
        const response = await fetch(`${API_BASE}/orders/track?${params}`);
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.order) return { ok: true, order: data.order };
        if (data && data.error) return { ok: false, error: data.error };
        if (DEMO_ONLY) return demoLookup();
        return { ok: false, error: "سفارشی با این کد یافت نشد" };
      } catch (error) {
        if (DEMO_ONLY) return demoLookup();
        return {
          ok: false,
          error: "اتصال به سرور برقرار نیست؛ پیگیری سفارش ممکن نشد",
        };
      }
    },
  };
})();
