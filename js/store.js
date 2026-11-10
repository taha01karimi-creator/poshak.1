/* وضعیت برنامه: سبد خرید، علاقه‌مندی‌ها، کاربر و سفارش‌ها (ذخیره در localStorage) */

const Store = (() => {
  const STORAGE_KEY = "digistyle:state";
  const ORDERS_KEY = "digistyle:orders";

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

  let state = { cart: {}, wishlist: [], user: null, ...read(STORAGE_KEY, {}) };
  let orders = read(ORDERS_KEY, []);
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

    login(phone) {
      state.user = `${phone.slice(0, 4)}***${phone.slice(-2)}`;
      commit();
    },

    /* ---------- سفارش‌ها (پنل مدیریت هم از همین‌ها استفاده می‌کند) ---------- */

    placeOrder() {
      const entries = cartEntries();
      if (!entries.length) return null;

      const total = cartTotal();
      const off = discount();
      const order = {
        id: Date.now().toString(36).toUpperCase(),
        date: new Date().toISOString(),
        customer: state.user || "مهمان",
        status: "pending",
        total,
        discount: off,
        payable: total - off,
        items: entries.map((e) => ({
          title: e.product.title,
          size: e.size,
          qty: e.qty,
          price: finalPrice(e.product),
        })),
      };

      orders.unshift(order);
      write(ORDERS_KEY, orders);
      state.cart = {};
      commit();
      return order;
    },

    orders: () => orders,
    reloadOrders() {
      orders = read(ORDERS_KEY, []);
    },
    updateOrder(id, status) {
      const order = orders.find((o) => o.id === id);
      if (order) order.status = status;
      write(ORDERS_KEY, orders);
    },
    deleteOrder(id) {
      orders = orders.filter((o) => o.id !== id);
      write(ORDERS_KEY, orders);
    },
    clearOrders() {
      orders = [];
      write(ORDERS_KEY, orders);
    },
  };
})();
