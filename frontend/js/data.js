/* داده‌های فروشگاه: دسته‌ها، بخش‌ها و کاتالوگ (از API؛ در نبود سرور، دادهٔ نمونه) */

const GENDERS = {
  men: {
    label: "مردانه",
    emoji: "👔",
    image: "images/gender/men.jpg",
    gradient: "linear-gradient(120deg,#6b8ca6,#2b4353)",
    brands: ["کدلاین بیسیک", "نووا", "رها", "آرکا"],
  },
  women: {
    label: "زنانه",
    emoji: "🕶️",
    image: "images/gender/women.jpg",
    gradient: "linear-gradient(120deg,#c48d84,#703a32)",
    brands: ["نووا", "تیارا", "رها", "کدلاین بیسیک"],
  },
  kids: {
    label: "بچگانه",
    emoji: "🧸",
    image: "images/gender/kids.jpg",
    gradient: "linear-gradient(120deg,#e0b478,#b56a45)",
    brands: ["کدلاین کیدز", "تیارا", "نووا"],
  },
};

/* نوع محصول = همان ردیف‌هایی که در صفحه هر دسته نمایش داده می‌شود */
const TYPE_LABELS = {
  shoe: "کفش",
  top: "لباس",
  pants: "شلوار",
  cold: "لباس‌های پاییز و زمستان",
  warm: "لباس‌های بهار و تابستان",
  bag: "کیف",
  watch: "ساعت",
};

const SECTIONS = [
  { type: "shoe", title: "کفش" },
  { type: "top", title: "لباس" },
  { type: "pants", title: "شلوار" },
  { type: "bag", title: "کیف" },
  { type: "watch", title: "ساعت" },
  { type: "cold", title: "لباس‌های پاییز و زمستان" },
  { type: "warm", title: "لباس‌های بهار و تابستان" },
];

/* کلمه‌های دیگری که کاربر ممکن است برای هر نوع جستجو کند */
const TYPE_KEYWORDS = {
  shoe: "کفش کتانی اسپرت رانینگ بوت نیم‌بوت",
  top: "لباس تیشرت تی‌شرت پیراهن پولو پولوشرت شومیز هودی سویشرت",
  pants: "شلوار جین کتان کارگو ساپورت",
  cold: "پالتو پافر بارانی اورکت کت پلیور",
  warm: "تابستانی سارافون پیراهن میدی دامن شلوارک",
  bag: "کیف ساک دستی دوشی کوله",
  watch: "ساعت مچی ساعت‌مچی",
};

/* تصویر جایگزین هر نوع؛ هر محصول تصویر اختصاصی خودش را دارد */
const TYPE_IMAGES = {
  shoe: "images/products/shoe.jpg",
  top: "images/products/top.jpg",
  pants: "images/products/pants.jpg",
  cold: "images/products/cold.jpg",
  warm: "images/products/warm.jpg",
  bag: "images/categories/bag.jpg",
  watch: "images/categories/watch.jpg",
};

const productImage = (p) => p.img || TYPE_IMAGES[p.type] || "";

/* ---------- کاتالوگ نمونهٔ فروشگاه ----------
   هر محصول یک عکس اختصاصی و یک نوع مشخص دارد؛ هیچ عکسی بین دو محصول
   تکرار نشده تا کارت‌ها با هم اشتباه گرفته نشوند. */

const FALLBACK_PRODUCTS = [
  /* ---------- مردانه ---------- */
  {
    id: 1,
    gender: "men",
    type: "shoe",
    brand: "کدلاین بیسیک",
    title: "کفش رانینگ مردانه",
    price: 17900000,
    discount: 15,
    emoji: "👟",
    img: "images/products/shoe.jpg",
    desc: "کفش رانینگ سبک با رویهٔ مشبک و کفی نرم؛ برای پیاده‌روی روزانه و ورزش.",
  },
  {
    id: 2,
    gender: "men",
    type: "top",
    brand: "نووا",
    title: "پولوشرت پیکه مردانه",
    price: 3400000,
    discount: 10,
    emoji: "👕",
    img: "images/products/polo-men.jpg",
    desc: "پولوشرت پیکه با یقهٔ سه دکمه و دوخت تمیز؛ مناسب استایل روزمره و نیمه‌رسمی.",
  },
  {
    id: 3,
    gender: "men",
    type: "top",
    brand: "رها",
    title: "پیراهن لینن آستین بلند مردانه",
    price: 4200000,
    discount: 0,
    emoji: "👔",
    img: "images/products/shirt-men.jpg",
    desc: "پیراهن لینن با بافت خنک و برش راسته؛ گزینه‌ای سبک برای روزهای گرم.",
  },
  {
    id: 4,
    gender: "men",
    type: "top",
    brand: "کدلاین بیسیک",
    title: "تی‌شرت اورسایز مردانه",
    price: 1990000,
    discount: 20,
    emoji: "👕",
    img: "images/products/tee-men.jpg",
    desc: "تی‌شرت اورسایز با پارچهٔ پنبه‌ای ضخیم که بعد از شست‌وشو فرم خود را حفظ می‌کند.",
  },
  {
    id: 5,
    gender: "men",
    type: "pants",
    brand: "آرکا",
    title: "شلوار جین راسته مردانه",
    price: 6850000,
    discount: 0,
    emoji: "👖",
    img: "images/products/pants-men.jpg",
    desc: "شلوار جین با رنگ نیلی و دوخت مقاوم؛ راسته و بدون کشسانی اضافه.",
  },
  {
    id: 6,
    gender: "men",
    type: "cold",
    brand: "نووا",
    title: "کاپشن پافر مردانه",
    price: 18900000,
    discount: 25,
    emoji: "🧥",
    img: "images/categories/jacket.jpg",
    desc: "کاپشن پافر با لایهٔ گرم و یقهٔ بلند؛ سبک و گرم برای روزهای سرد.",
  },
  {
    id: 7,
    gender: "men",
    type: "cold",
    brand: "رها",
    title: "پالتو شتری مردانه",
    price: 9800000,
    discount: 10,
    emoji: "🧥",
    img: "images/products/coat-men.jpg",
    desc: "پالتوی بلند شتری با یقهٔ انگلیسی و آستر کامل؛ فرمی مرتب و رسمی.",
  },
  {
    id: 8,
    gender: "men",
    type: "watch",
    brand: "آرکا",
    title: "ساعت مچی مردانه بند چرم",
    price: 15900000,
    discount: 0,
    emoji: "⌚",
    img: "images/categories/watch.jpg",
    desc: "ساعت مچی با صفحهٔ ساده و بند چرم طبیعی؛ مناسب استفادهٔ روزمره و رسمی.",
  },

  /* ---------- زنانه ---------- */
  {
    id: 9,
    gender: "women",
    type: "shoe",
    brand: "تیارا",
    title: "کفش پاشنه‌دار زنانه",
    price: 9400000,
    discount: 10,
    emoji: "👠",
    img: "images/products/shoe-women.jpg",
    desc: "کفش پاشنه‌دار با رویهٔ چرم و پاشنهٔ متوسط؛ برای مهمانی و استایل رسمی.",
  },
  {
    id: 10,
    gender: "women",
    type: "top",
    brand: "نووا",
    title: "شومیز ابریشمی زنانه",
    price: 2790000,
    discount: 15,
    emoji: "👚",
    img: "images/products/blouse-women.jpg",
    desc: "شومیز با پارچهٔ نرم و دراپهٔ ملایم؛ مناسب محیط کار و مهمانی.",
  },
  {
    id: 11,
    gender: "women",
    type: "warm",
    brand: "تیارا",
    title: "پیراهن میدی تابستانی زنانه",
    price: 3490000,
    discount: 10,
    emoji: "👗",
    img: "images/products/warm.jpg",
    desc: "پیراهن میدی با برش ساده و پارچهٔ سبک؛ برای مهمانی روز و استایل روزمره.",
  },
  {
    id: 12,
    gender: "women",
    type: "cold",
    brand: "نووا",
    title: "بافت یقه‌گرد زنانه",
    price: 3100000,
    discount: 0,
    emoji: "🧶",
    img: "images/products/knit-women.jpg",
    desc: "بافت یقه‌گرد با کشسانی مناسب و سطح صاف؛ لایه‌ای گرم برای پاییز.",
  },
  {
    id: 13,
    gender: "women",
    type: "pants",
    brand: "رها",
    title: "شلوار پارچه‌ای زنانه",
    price: 2900000,
    discount: 15,
    emoji: "👖",
    img: "images/products/pants-women.jpg",
    desc: "شلوار پارچه‌ای با کمر متوسط و برش راسته؛ ترکیب راحتی و ظاهر رسمی.",
  },
  {
    id: 14,
    gender: "women",
    type: "cold",
    brand: "تیارا",
    title: "پالتو بلند زنانه",
    price: 6900000,
    discount: 20,
    emoji: "🧥",
    img: "images/products/coat-women.jpg",
    desc: "پالتوی بلند با یقهٔ انگلیسی و آستر کامل؛ رنگ شتری خنثی و هماهنگ.",
  },
  {
    id: 15,
    gender: "women",
    type: "bag",
    brand: "نووا",
    title: "کیف دوشی چرم زنانه",
    price: 6200000,
    discount: 0,
    emoji: "👜",
    img: "images/categories/bag.jpg",
    desc: "کیف دوشی با چرم طبیعی و بند قابل تنظیم؛ جادار و مناسب استفادهٔ روزمره.",
  },
  {
    id: 16,
    gender: "women",
    type: "watch",
    brand: "تیارا",
    title: "ساعت مچی زنانه بند باریک",
    price: 8800000,
    discount: 15,
    emoji: "⌚",
    img: "images/products/watch-women.jpg",
    desc: "ساعت مچی با قاب کوچک و بند باریک؛ ظاهری مینیمال برای استایل روزمره.",
  },

  /* ---------- بچگانه ---------- */
  {
    id: 17,
    gender: "kids",
    type: "top",
    brand: "کدلاین کیدز",
    title: "تی‌شرت نخی بچگانه",
    price: 1200000,
    discount: 10,
    emoji: "👕",
    img: "images/products/tshirt-kids.jpg",
    desc: "تی‌شرت بچگانه با پنبهٔ نرم و یقهٔ کشباف که فرم خود را حفظ می‌کند.",
  },
  {
    id: 18,
    gender: "kids",
    type: "top",
    brand: "تیارا",
    title: "هودی بچگانه",
    price: 3500000,
    discount: 15,
    emoji: "🧒",
    img: "images/products/hoodie-kids.jpg",
    desc: "هودی بچگانه با پارچهٔ مولتون نرم و کلاه دو لایه؛ گرم برای روزهای خنک.",
  },
  {
    id: 19,
    gender: "kids",
    type: "pants",
    brand: "نووا",
    title: "شلوار جین بچگانه",
    price: 3200000,
    discount: 0,
    emoji: "👖",
    img: "images/products/jeans-kids.jpg",
    desc: "شلوار جین بچگانه با کمر کشی و پارچهٔ مقاوم؛ مناسب مدرسه و بازی.",
  },
  {
    id: 20,
    gender: "kids",
    type: "shoe",
    brand: "کدلاین کیدز",
    title: "کفش اسپرت بچگانه",
    price: 4800000,
    discount: 20,
    emoji: "👟",
    img: "images/products/shoe-kids.jpg",
    desc: "کفش اسپرت بچگانه با کفی نرم و بند چسبی؛ راحت برای دویدن و بازی.",
  },
  {
    id: 21,
    gender: "kids",
    type: "cold",
    brand: "تیارا",
    title: "کاپشن بچگانه",
    price: 5900000,
    discount: 10,
    emoji: "🧥",
    img: "images/products/jacket-kids.jpg",
    desc: "کاپشن بچگانهٔ سبک با آستر گرم و کلاه؛ مناسب روزهای خنک مدرسه.",
  },

  /* ---------- محصولات تکمیلی ---------- */
  {
    id: 22,
    gender: "men",
    type: "shoe",
    brand: "آرکا",
    title: "کفش رسمی چرم مردانه",
    price: 12900000,
    discount: 0,
    emoji: "👞",
    img: "images/products/shoe-formal-men.jpg",
    desc: "کفش رسمی چرم با فرم باریک و کفی راحت؛ مناسب محیط کار، مراسم و استایل رسمی.",
  },
  {
    id: 23,
    gender: "men",
    type: "cold",
    brand: "نووا",
    title: "بافت یقه‌گرد مردانه",
    price: 4100000,
    discount: 15,
    emoji: "🧶",
    img: "images/products/knit-men.jpg",
    desc: "بافت یقه‌گرد با بافت ریز و گرمای متعادل؛ زیر کت یا به‌تنهایی برای روزهای سرد.",
  },
  {
    id: 24,
    gender: "men",
    type: "warm",
    brand: "رها",
    title: "شلوارک کتان مردانه",
    price: 1890000,
    discount: 20,
    emoji: "🩳",
    img: "images/products/shorts-men.jpg",
    desc: "شلوارک کتان با کمر کشی و بند تنظیم؛ سبک و خنک برای روزهای گرم و سفر.",
  },
  {
    id: 25,
    gender: "men",
    type: "cold",
    brand: "کدلاین بیسیک",
    title: "کاپشن جین مردانه",
    price: 4600000,
    discount: 10,
    emoji: "🧥",
    img: "images/products/jacket-denim-men.jpg",
    desc: "کاپشن جین با شست‌وشوی ملایم و دکمه‌های فلزی؛ لایه‌ای مقاوم برای پاییز و بهار.",
  },
  {
    id: 26,
    gender: "women",
    type: "warm",
    brand: "تیارا",
    title: "دامن میدی پلیسه زنانه",
    price: 2590000,
    discount: 15,
    emoji: "👗",
    img: "images/products/skirt-women.jpg",
    desc: "دامن میدی پلیسه با کمر کشی و پارچهٔ سبک؛ ترکیب ساده برای استایل روزمره و مهمانی.",
  },
  {
    id: 27,
    gender: "women",
    type: "cold",
    brand: "نووا",
    title: "کاپشن کوتاه زنانه",
    price: 5900000,
    discount: 25,
    emoji: "🧥",
    img: "images/products/puffer-women.jpg",
    desc: "کاپشن کوتاه با لایهٔ گرم و دوخت عرضی؛ سبک، گرم و مناسب روزهای سرد شهری.",
  },
  {
    id: 28,
    gender: "kids",
    type: "warm",
    brand: "تیارا",
    title: "پیراهن نخی دخترانه",
    price: 1990000,
    discount: 10,
    emoji: "👗",
    img: "images/products/dress-kids.jpg",
    desc: "پیراهن نخی دخترانه با برش راحت و پارچهٔ خنک؛ مناسب مدرسه، مهمانی و روزهای گرم.",
  },
  {
    id: 29,
    gender: "kids",
    type: "bag",
    brand: "کدلاین کیدز",
    title: "کوله‌پشتی بچگانه",
    price: 1290000,
    discount: 0,
    emoji: "🎒",
    img: "images/products/backpack-kids.jpg",
    desc: "کوله‌پشتی سبک با بند قابل تنظیم و جیب جلو؛ جادار برای مدرسه و سفرهای کوتاه.",
  },
];

/* کاتالوگ فعال؛ با loadCatalog() از سرور پر می‌شود */
let PRODUCTS = FALLBACK_PRODUCTS.map((p) => ({ ...p }));
let CATALOG_SOURCE = "fallback";

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

/* ---------- جستجو ---------- */

/* همهٔ محصولات یک متن قابل جستجو می‌گیرند: نام، برند، جنسیت و نوع محصول.
   برای «کدلاین بیسیک» یا «ساعت» هم نتیجه درست برمی‌گردد. */
function searchText(product) {
  const gender = GENDERS[product.gender]?.label || "";
  return normalize(
    [
      product.title,
      product.brand,
      gender,
      TYPE_LABELS[product.type] || "",
      TYPE_KEYWORDS[product.type] || "",
    ].join(" "),
  );
}

/* هر کلمهٔ عبارت باید در متن محصول باشد؛ «کیف چرم» هم کیف‌ها را پیدا می‌کند */
function searchProducts(query) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const full = tokens.join(" ");

  return PRODUCTS.filter((p) => {
    const text = searchText(p);
    return tokens.every((token) => text.includes(token));
  }).sort((a, b) => {
    // محصولی که خودش دقیقاً با عبارت جستجو شروع می‌شود بالاتر می‌آید
    const aTitle = normalize(a.title).startsWith(full) ? 0 : 1;
    const bTitle = normalize(b.title).startsWith(full) ? 0 : 1;
    return aTitle - bTitle;
  });
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

const applySettingsPayload = (raw) => {
  const s = raw || {};
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
};

/* محصولات و تنظیمات از سرور خوانده می‌شوند؛ خطا یعنی فروشگاه آفلاین است */
async function loadCatalog() {
  try {
    const response = await fetch(`${API_BASE}/products?per_page=100`, {
      credentials: "same-origin",
    });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.products) && payload.products.length) {
        PRODUCTS = payload.products.map((p) => ({
          ...p,
          id: Number(p.id),
          img: p.img || TYPE_IMAGES[p.type] || "",
        }));
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
      applySettingsPayload(payload.settings);
    }
  } catch (error) {
    /* آفلاین: پیش‌فرض‌ها */
  }

  // نسخهٔ نمایشی: هر چه در پنل ذخیره شده، همین‌جا هم دیده می‌شود
  if (CATALOG_SOURCE === "fallback") {
    try {
      const demo = JSON.parse(localStorage.getItem(DEMO_DB_KEY) || "null");
      if (demo) {
        if (Array.isArray(demo.products) && demo.products.length) {
          PRODUCTS = demo.products.map((p) => ({
            ...p,
            id: Number(p.id),
            img: p.img || TYPE_IMAGES[p.type] || "",
          }));
          CATALOG_SOURCE = "demo";
        }
        if (demo.settings) applySettingsPayload(demo.settings);
      }
    } catch (error) {
      /* دادهٔ نمایشی خراب است؛ کاتالوگ نمونه می‌ماند */
    }
  }

  return { source: CATALOG_SOURCE, products: PRODUCTS, settings: Settings.get() };
}
