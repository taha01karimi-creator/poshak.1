/* داده‌های فروشگاه: دسته‌ها، بخش‌ها و کاتالوگ (از API؛ در نبود سرور، دادهٔ نمونه) */

const GENDERS = {
  men: {
    label: "مردانه",
    emoji: "👔",
    gradient: "linear-gradient(120deg,#4a6fa5,#1d2f4d)",
    brands: ["ال سی وایکیکی", "دیفکتو", "نایکی", "کلمبیا"],
  },
  women: {
    label: "زنانه",
    emoji: "🕶️",
    gradient: "linear-gradient(120deg,#c9788f,#6e2a43)",
    brands: ["السا", "ایزی دو", "دیفکتو", "نایکی", "ال سی وایکیکی"],
  },
  kids: {
    label: "بچگانه",
    emoji: "🧸",
    gradient: "linear-gradient(120deg,#e7a53a,#c4552b)",
    brands: ["ال سی وایکیکی", "دیفکتو", "نایکی"],
  },
};

// ۵ ردیفی که در صفحه هر دسته نمایش داده می‌شود
const SECTIONS = [
  { type: "shoe", title: "کفش" },
  { type: "top", title: "لباس" },
  { type: "pants", title: "شلوار" },
  { type: "cold", title: "لباس‌های پاییز و زمستان" },
  { type: "warm", title: "لباس‌های بهار و تابستان" },
];

// [عنوان، ایموجی، قیمت پایه]
const TEMPLATES = {
  men: {
    shoe: [
      ["کفش رانینگ مردانه", "👟", 17900000],
      ["کفش رسمی چرم مردانه", "👞", 23400000],
      ["نیم‌بوت مردانه", "🥾", 14500000],
    ],
    top: [
      ["تی‌شرت آستین کوتاه مردانه", "👕", 1990000],
      ["پولوشرت مردانه", "👕", 3400000],
      ["پیراهن آستین بلند مردانه", "👔", 4200000],
    ],
    pants: [
      ["شلوار جین راسته مردانه", "👖", 6850000],
      ["شلوار کتان مردانه", "👖", 5200000],
      ["شلوار اسلک مردانه", "👖", 7100000],
    ],
    cold: [
      ["کاپشن پافر مردانه", "🧥", 18900000],
      ["پلیور بافت مردانه", "🧶", 6300000],
      ["کت چرم مردانه", "🧥", 34000000],
    ],
    warm: [
      ["شلوارک مردانه", "🩳", 2700000],
      ["پیراهن کتان مردانه", "👔", 3900000],
      ["تی‌شرت نخی تابستانی مردانه", "👕", 1500000],
    ],
    acc: [
      ["ساعت مچی مردانه", "⌚", 15900000],
      ["کیف دوشی مردانه", "👜", 6200000],
    ],
  },
  women: {
    shoe: [
      ["کفش رانینگ زنانه", "👟", 17900000],
      ["کفش پاشنه‌دار زنانه", "👠", 9400000],
      ["نیم‌بوت زنانه", "🥾", 22700000],
    ],
    top: [
      ["شومیز زنانه", "👚", 1990000],
      ["تی‌شرت اورسایز زنانه", "👕", 1990000],
      ["کراپ‌تاپ زنانه", "👚", 1460000],
    ],
    pants: [
      ["شلوار جین زنانه", "👖", 2040000],
      ["شلوار پارچه‌ای زنانه", "👖", 2900000],
      ["ساپورت ورزشی زنانه", "👖", 1200000],
    ],
    cold: [
      ["کاپشن بلند زنانه", "🧥", 5000000],
      ["پالتو زنانه", "🧥", 8800000],
      ["ژاکت بافت زنانه", "🧶", 3100000],
    ],
    warm: [
      ["سارافون تابستانی زنانه", "👗", 2600000],
      ["مانتو کتان زنانه", "👘", 3700000],
      ["شلوارک زنانه", "🩳", 1300000],
    ],
    acc: [
      ["کیف دوشی چرم زنانه", "👜", 6200000],
      ["ساعت مچی زنانه", "⌚", 8800000],
    ],
  },
  kids: {
    shoe: [
      ["کفش اسپرت بچگانه", "👟", 5600000],
      ["کفش دخترانه", "👟", 4800000],
      ["چکمه بچگانه", "🥾", 5200000],
    ],
    top: [
      ["تی‌شرت پسرانه", "👕", 1200000],
      ["بلوز دخترانه", "👚", 1500000],
      ["سویشرت بچگانه", "🧒", 3500000],
    ],
    pants: [
      ["شلوار جین پسرانه", "👖", 3200000],
      ["شلوار کتان دخترانه", "👖", 2800000],
      ["ساپورت دخترانه", "👖", 1100000],
    ],
    cold: [
      ["بارانی پسرانه", "🧥", 5900000],
      ["کاپشن دخترانه", "🧥", 7300000],
      ["پلیور بچگانه", "🧶", 2900000],
    ],
    warm: [
      ["پیراهن دخترانه گلدار", "👗", 1700000],
      ["شلوارک پسرانه", "🩳", 1300000],
      ["ست تابستانی نوزادی", "🍼", 2500000],
    ],
  },
};

const COLORS = ["مشکی", "سرمه‌ای", "طوسی", "کرم", "سبز", "قهوه‌ای", "آبی"];
const DISCOUNTS = [0, 10, 15, 0, 25, 30, 20, 0];

/* ---------- کاتالوگ نمونه (فقط وقتی سرور در دسترس نیست) ---------- */

const FALLBACK_PRODUCTS = [];

Object.entries(TEMPLATES).forEach(([gender, types]) => {
  const { brands } = GENDERS[gender];

  Object.entries(types).forEach(([type, templates]) => {
    templates.forEach(([title, emoji, price]) => {
      for (let variant = 0; variant < 2; variant++) {
        const id = FALLBACK_PRODUCTS.length;
        FALLBACK_PRODUCTS.push({
          id,
          gender,
          type,
          emoji,
          title: `${title} ${COLORS[id % COLORS.length]}`,
          brand: brands[id % brands.length],
          price: price + variant * 150000,
          discount: DISCOUNTS[id % DISCOUNTS.length],
        });
      }
    });
  });
});

/* کاتالوگ فعال؛ با loadCatalog() از سرور پر می‌شود */
let PRODUCTS = FALLBACK_PRODUCTS.map((p) => ({ ...p }));
let CATALOG_SOURCE = "fallback";

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

function searchProducts(query) {
  const term = normalize(query);
  if (!term) return [];
  return PRODUCTS.filter((p) => `${p.title} ${p.brand}`.includes(term));
}

/* ---------- تنظیمات فروشگاه ---------- */

const DEFAULT_SETTINGS = {
  promoText: "یک میلیون تومان تخفیف برای خرید بالای ۵ میلیون تومان",
  threshold: 5000000,
  discountAmount: 1000000,
};

const Settings = (() => {
  let values = { ...DEFAULT_SETTINGS };
  return {
    get: () => values,
    apply(patch) {
      values = { ...values, ...patch };
    },
  };
})();

/* محصولات و تنظیمات از سرور خوانده می‌شوند؛ خطا یعنی فروشگاه آفلاین است */
async function loadCatalog() {
  try {
    const response = await fetch(`${API_BASE}/products?per_page=100`, {
      credentials: "same-origin",
    });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.products) && payload.products.length) {
        PRODUCTS = payload.products.map((p) => ({ ...p, id: Number(p.id) }));
        CATALOG_SOURCE = "api";
      }
    }
  } catch (error) {
    /* آفلاین: کاتالوگ نمونه */
  }

  try {
    const response = await fetch(`${API_BASE}/settings`, {
      credentials: "same-origin",
    });
    if (response.ok) {
      const payload = await response.json();
      const s = payload.settings || {};
      Settings.apply({
        promoText: s.promoText || DEFAULT_SETTINGS.promoText,
        threshold:
          Number(s.threshold) > 0
            ? Number(s.threshold)
            : DEFAULT_SETTINGS.threshold,
        discountAmount:
          Number(s.discountAmount) >= 0
            ? Number(s.discountAmount)
            : DEFAULT_SETTINGS.discountAmount,
      });
    }
  } catch (error) {
    /* آفلاین: پیش‌فرض‌ها */
  }

  return { source: CATALOG_SOURCE, products: PRODUCTS, settings: Settings.get() };
}
