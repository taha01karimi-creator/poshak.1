

const GENDERS = {
  men: {
    label: "مردانه",
    emoji: "",
    image: "images/gender/men.jpg",
    gradient: "linear-gradient(120deg,#6b8ca6,#2b4353)",
    brands: ["ویلدا", "آرتینا", "ملورا", "سوین"],
  },
  women: {
    label: "زنانه",
    emoji: "",
    image: "images/gender/women.jpg",
    gradient: "linear-gradient(120deg,#c48d84,#703a32)",
    brands: ["آرتینا", "بارانا", "ملورا", "ویلدا"],
  },
  kids: {
    label: "بچگانه",
    emoji: "",
    image: "images/gender/kids.jpg",
    gradient: "linear-gradient(120deg,#e0b478,#b56a45)",
    brands: ["کیدزو", "بارانا", "آرتینا"],
  },
};

const TYPE_LABELS = {
  shoe: "کفش",
  top: "لباس",
  pants: "شلوار",
  cold: "لباس‌های پاییز و زمستان",
  warm: "لباس‌های بهار و تابستان",
};

const SECTIONS = [
  { type: "shoe", title: "کفش" },
  { type: "top", title: "لباس" },
  { type: "pants", title: "شلوار" },
  { type: "cold", title: "لباس‌های پاییز و زمستان" },
  { type: "warm", title: "لباس‌های بهار و تابستان" },
];

const TYPE_KEYWORDS = {
  shoe: "کفش کتانی اسپرت رانینگ بوت نیم‌بوت",
  top: "لباس تیشرت تی‌شرت پیراهن پولو پولوشرت شومیز هودی سویشرت",
  pants: "شلوار جین کتان کارگو ساپورت",
  cold: "پالتو پافر بارانی اورکت کت پلیور",
  warm: "تابستانی سارافون پیراهن میدی دامن شلوارک",
};

const TYPE_IMAGES = {
  shoe: "images/products/shoe.jpg",
  top: "images/products/top.jpg",
  pants: "images/products/pants.jpg",
  cold: "images/products/cold.jpg",
  warm: "images/products/warm.jpg",
};

const FALLBACK_PRODUCTS = [
  
  {
    id: 1,
    gender: "men",
    type: "shoe",
    brand: "ویلدا",
    title: "کفش رانینگ مردانه",
    price: 17900000,
    discount: 15,
    emoji: "",
    img: "images/products/shoe.jpg",
    desc: "کفش رانینگ سبک با رویهٔ مشبک و کفی نرم؛ برای پیاده‌روی روزانه و ورزش.",
  },
  {
    id: 2,
    gender: "men",
    type: "top",
    brand: "آرتینا",
    title: "پولوشرت پیکه مردانه",
    price: 3400000,
    discount: 10,
    emoji: "",
    img: "images/products/polo-men.jpg",
    desc: "پولوشرت پیکه با یقهٔ سه دکمه و دوخت تمیز؛ مناسب استایل روزمره و نیمه‌رسمی.",
  },
  {
    id: 3,
    gender: "men",
    type: "top",
    brand: "ملورا",
    title: "پیراهن لینن آستین بلند مردانه",
    price: 4200000,
    discount: 0,
    emoji: "",
    img: "images/products/shirt-men.jpg",
    desc: "پیراهن لینن با بافت خنک و برش راسته؛ گزینه‌ای سبک برای روزهای گرم.",
  },
  {
    id: 4,
    gender: "men",
    type: "top",
    brand: "ویلدا",
    title: "تی‌شرت اورسایز مردانه",
    price: 1990000,
    discount: 20,
    emoji: "",
    img: "images/products/tee-men.jpg",
    desc: "تی‌شرت اورسایز با پارچهٔ پنبه‌ای ضخیم که بعد از شست‌وشو فرم خود را حفظ می‌کند.",
  },
  {
    id: 5,
    gender: "men",
    type: "pants",
    brand: "سوین",
    title: "شلوار جین راسته مردانه",
    price: 6850000,
    discount: 0,
    emoji: "",
    img: "images/products/pants-men.jpg",
    desc: "شلوار جین با رنگ نیلی و دوخت مقاوم؛ راسته و بدون کشسانی اضافه.",
  },
  {
    id: 6,
    gender: "men",
    type: "cold",
    brand: "آرتینا",
    title: "کاپشن پافر مردانه",
    price: 18900000,
    discount: 25,
    emoji: "",
    img: "images/categories/jacket.jpg",
    desc: "کاپشن پافر با لایهٔ گرم و یقهٔ بلند؛ سبک و گرم برای روزهای سرد.",
  },
  {
    id: 7,
    gender: "men",
    type: "cold",
    brand: "ملورا",
    title: "پالتو شتری مردانه",
    price: 9800000,
    discount: 10,
    emoji: "",
    img: "images/products/coat-men.jpg",
    desc: "پالتوی بلند شتری با یقهٔ انگلیسی و آستر کامل؛ فرمی مرتب و رسمی.",
  },

  
  {
    id: 9,
    gender: "women",
    type: "shoe",
    brand: "بارانا",
    title: "کفش پاشنه‌دار زنانه",
    price: 9400000,
    discount: 10,
    emoji: "",
    img: "images/products/shoe-women.jpg",
    desc: "کفش پاشنه‌دار با رویهٔ چرم و پاشنهٔ متوسط؛ برای مهمانی و استایل رسمی.",
  },
  {
    id: 10,
    gender: "women",
    type: "top",
    brand: "آرتینا",
    title: "شومیز ابریشمی زنانه",
    price: 2790000,
    discount: 15,
    emoji: "",
    img: "images/products/blouse-women.jpg",
    desc: "شومیز با پارچهٔ نرم و دراپهٔ ملایم؛ مناسب محیط کار و مهمانی.",
  },
  {
    id: 11,
    gender: "women",
    type: "warm",
    brand: "بارانا",
    title: "پیراهن میدی تابستانی زنانه",
    price: 3490000,
    discount: 10,
    emoji: "",
    img: "images/products/warm.jpg",
    desc: "پیراهن میدی با برش ساده و پارچهٔ سبک؛ برای مهمانی روز و استایل روزمره.",
  },
  {
    id: 12,
    gender: "women",
    type: "cold",
    brand: "آرتینا",
    title: "بافت یقه‌گرد زنانه",
    price: 3100000,
    discount: 0,
    emoji: "",
    img: "images/products/knit-women.jpg",
    desc: "بافت یقه‌گرد با کشسانی مناسب و سطح صاف؛ لایه‌ای گرم برای پاییز.",
  },
  {
    id: 13,
    gender: "women",
    type: "pants",
    brand: "ملورا",
    title: "شلوار پارچه‌ای زنانه",
    price: 2900000,
    discount: 15,
    emoji: "",
    img: "images/products/pants-women.jpg",
    desc: "شلوار پارچه‌ای با کمر متوسط و برش راسته؛ ترکیب راحتی و ظاهر رسمی.",
  },
  {
    id: 14,
    gender: "women",
    type: "cold",
    brand: "بارانا",
    title: "پالتو بلند زنانه",
    price: 6900000,
    discount: 20,
    emoji: "",
    img: "images/products/coat-women.jpg",
    desc: "پالتوی بلند با یقهٔ انگلیسی و آستر کامل؛ رنگ شتری خنثی و هماهنگ.",
  },

  
  {
    id: 17,
    gender: "kids",
    type: "top",
    brand: "کیدزو",
    title: "تی‌شرت نخی بچگانه",
    price: 1200000,
    discount: 10,
    emoji: "",
    img: "images/products/tshirt-kids.jpg",
    desc: "تی‌شرت بچگانه با پنبهٔ نرم و یقهٔ کشباف که فرم خود را حفظ می‌کند.",
  },
  {
    id: 18,
    gender: "kids",
    type: "top",
    brand: "بارانا",
    title: "هودی بچگانه",
    price: 3500000,
    discount: 15,
    emoji: "",
    img: "images/products/hoodie-kids.jpg",
    desc: "هودی بچگانه با پارچهٔ مولتون نرم و کلاه دو لایه؛ گرم برای روزهای خنک.",
  },
  {
    id: 19,
    gender: "kids",
    type: "pants",
    brand: "آرتینا",
    title: "شلوار جین بچگانه",
    price: 3200000,
    discount: 0,
    emoji: "",
    img: "images/products/jeans-kids.jpg",
    desc: "شلوار جین بچگانه با کمر کشی و پارچهٔ مقاوم؛ مناسب مدرسه و بازی.",
  },
  {
    id: 20,
    gender: "kids",
    type: "shoe",
    brand: "کیدزو",
    title: "کفش اسپرت بچگانه",
    price: 4800000,
    discount: 20,
    emoji: "",
    img: "images/products/shoe-kids.jpg",
    desc: "کفش اسپرت بچگانه با کفی نرم و بند چسبی؛ راحت برای دویدن و بازی.",
  },
  {
    id: 21,
    gender: "kids",
    type: "cold",
    brand: "بارانا",
    title: "کاپشن بچگانه",
    price: 5900000,
    discount: 10,
    emoji: "",
    img: "images/products/jacket-kids.jpg",
    desc: "کاپشن بچگانهٔ سبک با آستر گرم و کلاه؛ مناسب روزهای خنک مدرسه.",
  },

  
  {
    id: 22,
    gender: "men",
    type: "shoe",
    brand: "سوین",
    title: "کفش رسمی چرم مردانه",
    price: 12900000,
    discount: 0,
    emoji: "",
    img: "images/products/shoe-formal-men.jpg",
    desc: "کفش رسمی چرم با فرم باریک و کفی راحت؛ مناسب محیط کار، مراسم و استایل رسمی.",
  },
  {
    id: 23,
    gender: "men",
    type: "cold",
    brand: "آرتینا",
    title: "بافت یقه‌گرد مردانه",
    price: 4100000,
    discount: 15,
    emoji: "",
    img: "images/products/knit-men.jpg",
    desc: "بافت یقه‌گرد با بافت ریز و گرمای متعادل؛ زیر کت یا به‌تنهایی برای روزهای سرد.",
  },
  {
    id: 24,
    gender: "men",
    type: "warm",
    brand: "ملورا",
    title: "شلوارک کتان مردانه",
    price: 1890000,
    discount: 20,
    emoji: "",
    img: "images/products/shorts-men.jpg",
    desc: "شلوارک کتان با کمر کشی و بند تنظیم؛ سبک و خنک برای روزهای گرم و سفر.",
  },
  {
    id: 25,
    gender: "men",
    type: "cold",
    brand: "ویلدا",
    title: "کاپشن جین مردانه",
    price: 4600000,
    discount: 10,
    emoji: "",
    img: "images/products/jacket-denim-men.jpg",
    desc: "کاپشن جین با شست‌وشوی ملایم و دکمه‌های فلزی؛ لایه‌ای مقاوم برای پاییز و بهار.",
  },
  {
    id: 26,
    gender: "women",
    type: "warm",
    brand: "بارانا",
    title: "دامن میدی پلیسه زنانه",
    price: 2590000,
    discount: 15,
    emoji: "",
    img: "images/products/skirt-women.jpg",
    desc: "دامن میدی پلیسه با کمر کشی و پارچهٔ سبک؛ ترکیب ساده برای استایل روزمره و مهمانی.",
  },
  {
    id: 27,
    gender: "women",
    type: "cold",
    brand: "آرتینا",
    title: "کاپشن کوتاه زنانه",
    price: 5900000,
    discount: 25,
    emoji: "",
    img: "images/products/puffer-women.jpg",
    desc: "کاپشن کوتاه با لایهٔ گرم و دوخت عرضی؛ سبک، گرم و مناسب روزهای سرد شهری.",
  },
  {
    id: 28,
    gender: "kids",
    type: "warm",
    brand: "بارانا",
    title: "پیراهن نخی دخترانه",
    price: 1990000,
    discount: 10,
    emoji: "",
    img: "images/products/dress-kids.jpg",
    desc: "پیراهن نخی دخترانه با برش راحت و پارچهٔ خنک؛ مناسب مدرسه، مهمانی و روزهای گرم.",
  },
  {
    id: 30,
    gender: "men",
    type: "cold",
    brand: "ویلدا",
    title: "هودی یقه‌دار مردانه",
    price: 4200000,
    discount: 15,
    emoji: "",
    img: "images/products/hoodie-men.jpg",
    desc: "هودی با پارچهٔ مولتون نرم و کلاه دو لایه؛ گرم و راحت برای روزهای خنک.",
  },
  {
    id: 31,
    gender: "men",
    type: "cold",
    brand: "آرتینا",
    title: "سویشرت یقه‌گرد مردانه",
    price: 3800000,
    discount: 10,
    emoji: "",
    img: "images/products/sweatshirt-men.jpg",
    desc: "سویشرت یقه‌گرد با بافت داخلی صاف و کشباف مقاوم؛ لایه‌ای ساده برای پاییز.",
  },
  {
    id: 32,
    gender: "men",
    type: "pants",
    brand: "سوین",
    title: "شلوار کتان مردانه",
    price: 4900000,
    discount: 0,
    emoji: "",
    img: "images/products/chino-men.jpg",
    desc: "شلوار کتان با برش راسته و کمر متوسط؛ ترکیب راحتی و ظاهر مرتب.",
  },
  {
    id: 33,
    gender: "men",
    type: "cold",
    brand: "ملورا",
    title: "کاپشن بادگیر مردانه",
    price: 6900000,
    discount: 20,
    emoji: "",
    img: "images/products/windbreaker-men.jpg",
    desc: "بادگیر سبک با زیپ سرتاسری و یقهٔ ایستاده؛ مناسب روزهای خنک و بادی.",
  },
  {
    id: 34,
    gender: "men",
    type: "warm",
    brand: "ویلدا",
    title: "پیراهن آستین کوتاه مردانه",
    price: 3600000,
    discount: 10,
    emoji: "",
    img: "images/products/shirt-ss-men.jpg",
    desc: "پیراهن نخی آستین کوتاه با یقهٔ کلاسیک؛ خنک و مناسب روزهای گرم.",
  },
  {
    id: 35,
    gender: "men",
    type: "cold",
    brand: "سوین",
    title: "کت تک مردانه",
    price: 12900000,
    discount: 0,
    emoji: "",
    img: "images/products/blazer-men.jpg",
    desc: "کت تک با برش باریک و آستر کامل؛ مناسب محیط کار و مراسم.",
  },
  {
    id: 36,
    gender: "men",
    type: "shoe",
    brand: "سوین",
    title: "کفش کتانی چرم مردانه",
    price: 14500000,
    discount: 15,
    emoji: "",
    img: "images/products/sneaker-men.jpg",
    desc: "کفش کتانی با رویهٔ چرم و کفی طبی؛ ترکیب استایل روزمره و راحتی.",
  },
  {
    id: 37,
    gender: "women",
    type: "cold",
    brand: "بارانا",
    title: "پالتو کمری زنانه",
    price: 8900000,
    discount: 15,
    emoji: "",
    img: "images/products/coat-belt-women.jpg",
    desc: "پالتوی کمری با کمربند هم‌رنگ و یقهٔ انگلیسی؛ فرمی جمع‌وجور و رسمی.",
  },
  {
    id: 38,
    gender: "women",
    type: "top",
    brand: "آرتینا",
    title: "تی‌شرت اورسایز زنانه",
    price: 2400000,
    discount: 10,
    emoji: "",
    img: "images/products/tee-women.jpg",
    desc: "تی‌شرت اورسایز نخی با آستین کوتاه و یقهٔ کشباف؛ استایل سادهٔ روزمره.",
  },
  {
    id: 39,
    gender: "women",
    type: "top",
    brand: "بارانا",
    title: "شومیز ابریشمی آستین بلند زنانه",
    price: 3290000,
    discount: 0,
    emoji: "",
    img: "images/products/blouse-ls-women.jpg",
    desc: "شومیز با پارچهٔ نرم و دراپهٔ ملایم؛ مناسب محیط کار و مهمانی.",
  },
  {
    id: 40,
    gender: "women",
    type: "pants",
    brand: "ملورا",
    title: "شلوار جین مام استایل زنانه",
    price: 5200000,
    discount: 15,
    emoji: "",
    img: "images/products/jeans-mom-women.jpg",
    desc: "شلوار جین با کمر بلند و برش مام‌استایل؛ راحت و مقاوم برای استفادهٔ روزانه.",
  },
  {
    id: 41,
    gender: "women",
    type: "cold",
    brand: "آرتینا",
    title: "بارانی کوتاه زنانه",
    price: 6400000,
    discount: 20,
    emoji: "",
    img: "images/products/raincoat-women.jpg",
    desc: "بارانی کوتاه با کلاه و پارچهٔ ضدآب سبک؛ مناسب روزهای بارانی.",
  },
  {
    id: 42,
    gender: "women",
    type: "warm",
    brand: "بارانا",
    title: "سارافون میدی گلدار زنانه",
    price: 3190000,
    discount: 10,
    emoji: "",
    img: "images/products/sundress-women.jpg",
    desc: "سارافون میدی با بند نازک و پارچهٔ سبک؛ گزینه‌ای خنک برای تابستان.",
  },
  {
    id: 43,
    gender: "women",
    type: "cold",
    brand: "ویلدا",
    title: "بافت پولو یقه‌دار زنانه",
    price: 3490000,
    discount: 0,
    emoji: "",
    img: "images/products/knit-polo-women.jpg",
    desc: "بافت پولو با یقهٔ برگردان و بافت ریز؛ گرمای متعادل برای پاییز.",
  },
  {
    id: 44,
    gender: "women",
    type: "shoe",
    brand: "آرتینا",
    title: "کفش اسپرت سبک زنانه",
    price: 7900000,
    discount: 15,
    emoji: "",
    img: "images/products/sneaker-women.jpg",
    desc: "کفش اسپرت سبک با کفی نرم و بند پارچه‌ای؛ راحت برای پیاده‌روی روزانه.",
  },
  {
    id: 45,
    gender: "kids",
    type: "top",
    brand: "کیدزو",
    title: "سویشرت یقه‌گرد بچگانه",
    price: 3200000,
    discount: 10,
    emoji: "",
    img: "images/products/sweatshirt-kids.jpg",
    desc: "سویشرت بچگانه با پارچهٔ نرم و کشباف مقاوم؛ مناسب مدرسه و بازی.",
  },
  {
    id: 46,
    gender: "kids",
    type: "shoe",
    brand: "کیدزو",
    title: "کفش کتانی بچگانه",
    price: 4600000,
    discount: 20,
    emoji: "",
    img: "images/products/sneaker-kids.jpg",
    desc: "کفش کتانی بچگانه با بند چسبی و کفی نرم؛ راحت برای دویدن و بازی.",
  },
  {
    id: 47,
    gender: "kids",
    type: "cold",
    brand: "بارانا",
    title: "بارانی کلاه‌دار بچگانه",
    price: 5400000,
    discount: 15,
    emoji: "",
    img: "images/products/raincoat-kids.jpg",
    desc: "بارانی سبک با کلاه و پارچهٔ ضدآب؛ مناسب روزهای بارانی و سفر.",
  },
  {
    id: 48,
    gender: "kids",
    type: "pants",
    brand: "آرتینا",
    title: "شلوار کتان بچگانه",
    price: 2900000,
    discount: 0,
    emoji: "",
    img: "images/products/pants-kids.jpg",
    desc: "شلوار کتان بچگانه با کمر کشی و پارچهٔ مقاوم؛ راحت برای مدرسه.",
  },
  {
    id: 49,
    gender: "kids",
    type: "top",
    brand: "بارانا",
    title: "تی‌شرت آستین بلند دخترانه",
    price: 1890000,
    discount: 10,
    emoji: "",
    img: "images/products/tee-ls-kids.jpg",
    desc: "تی‌شرت آستین بلند نخی با راه‌راه ملایم؛ لایه‌ای راحت برای روزهای خنک.",
  },
];

const KNOWN_IMAGES = new Set([
  ...Object.values(TYPE_IMAGES),
  ...FALLBACK_PRODUCTS.map((p) => p.img).filter(Boolean),
  ...Object.values(GENDERS).map((g) => g.image).filter(Boolean),
]);

const productImage = (p) => {
  const img = p.img;
  if (typeof img === "string" && img) {
    if (/^(https?:|data:)/.test(img) || KNOWN_IMAGES.has(img)) return img;
  }
  return TYPE_IMAGES[p.type] || "";
};

let PRODUCTS = FALLBACK_PRODUCTS.map((p) => ({ ...p }));
let CATALOG_SOURCE = "fallback";

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

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

function searchProducts(query) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const full = tokens.join(" ");

  return PRODUCTS.map((p) => {
    const text = searchText(p);
    const hits = tokens.filter((token) => text.includes(token));
    return { p, hard: hits.length === tokens.length, hits: hits.length };
  })
    .filter((item) => item.hard || item.hits > 0)
    .sort((a, b) => {
      if (a.hard !== b.hard) return a.hard ? -1 : 1;
      if (a.hits !== b.hits) return b.hits - a.hits;
      const aTitle = normalize(a.p.title).startsWith(full) ? 0 : 1;
      const bTitle = normalize(b.p.title).startsWith(full) ? 0 : 1;
      return aTitle - bTitle;
    })
    .map((item) => item.p);
}

const DEFAULT_SETTINGS = {
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

function readDemoCatalog() {
  try {
    const demo = JSON.parse(localStorage.getItem(DEMO_DB_KEY) || "null");
    if (!demo || Number(demo.version) !== DEMO_SCHEMA_VERSION) return null;
    const valid = Array.isArray(demo.products)
      ? demo.products.filter((p) => p && GENDERS[p.gender] && TYPE_LABELS[p.type])
      : [];
    return { products: valid, settings: demo.settings || null };
  } catch (error) {
    return null;
  }
}

function loadLocalCatalog() {
  const demo = readDemoCatalog();
  if (demo) {
    if (demo.products.length) {
      PRODUCTS = demo.products.map((p) => ({
        ...p,
        id: Number(p.id),
        img: productImage(p),
      }));
      CATALOG_SOURCE = "demo";
    }
    if (demo.settings) applySettingsPayload(demo.settings);
  }
  return { source: CATALOG_SOURCE, products: PRODUCTS, settings: Settings.get() };
}

async function loadCatalog() {
  // روی میزبانی استاتیک اصلاً سراغ API نمی‌رویم تا صفحه فوری بالا بیاید
  if (STATIC_HOSTING) return loadLocalCatalog();

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
    
  }

  if (CATALOG_SOURCE === "fallback") return loadLocalCatalog();

  return { source: CATALOG_SOURCE, products: PRODUCTS, settings: Settings.get() };
}
