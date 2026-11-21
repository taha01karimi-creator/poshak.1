/* ============================================
   صفحه سبد خرید: تغییر تعداد، حذف، کد تخفیف
   و ثبت سفارش
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  const listEl = document.querySelector("[data-cart-list]");
  if (!listEl) return;

  const emptyEl = document.querySelector("[data-cart-empty]");
  const footEl = document.querySelector("[data-cart-foot]");
  const summaryEl = document.querySelector("[data-summary]");
  const subtotalEl = document.querySelector("[data-subtotal]");
  const savedEl = document.querySelector("[data-saved]");
  const shippingEl = document.querySelector("[data-shipping]");
  const totalEl = document.querySelector("[data-total]");
  const shippingBar = document.querySelector("[data-shipping-bar]");

  const couponInput = document.querySelector("[data-coupon-input]");
  const couponMsg = document.querySelector("[data-coupon-msg]");
  const couponRow = document.querySelector("[data-coupon-row]");
  const couponAmountEl = document.querySelector("[data-coupon-amount]");

  const modal = document.querySelector("[data-checkout-modal]");
  const form = document.querySelector("[data-checkout-form]");
  const modalBox = modal.querySelector(".modal__box");

  const COUPON_KEY = "rega_coupon";
  let coupon = readStore(COUPON_KEY, "");

  /* ---------- ابزار ---------- */

  /** تبدیل ارقام فارسی/عربی به لاتین */
  function toLatinDigits(value) {
    const fa = "۰۱۲۳۴۵۶۷۸۹";
    const ar = "٠١٢٣٤٥٦٧٨٩";
    return String(value).replace(/[۰-۹٠-٩]/g, function (char) {
      const faIndex = fa.indexOf(char);
      return faIndex > -1 ? String(faIndex) : String(ar.indexOf(char));
    });
  }

  function couponPercent() {
    const found = COUPONS[coupon];
    return found ? found.percent : 0;
  }

  /* ---------- رندر ---------- */

  function render() {
    const items = cartDetailed();
    const isEmpty = items.length === 0;

    emptyEl.hidden = !isEmpty;
    footEl.hidden = isEmpty;
    summaryEl.hidden = isEmpty;

    if (isEmpty) {
      listEl.innerHTML = "";
      coupon = "";
      writeStore(COUPON_KEY, "");
      updateCartCount();
      return;
    }

    listEl.innerHTML = items
      .map(function (item) {
        const product = item.product;
        const color = COLORS[item.line.color];
        return (
          '<div class="cart-row" data-key="' + item.key + '">' +
          '<a class="cart-row__img" href="product.html?id=' + product.id + '">' +
          '<img src="' + product.images[0] + '" alt="' + product.name + '"></a>' +
          "<div>" +
          '<a class="cart-row__title" href="product.html?id=' + product.id + '">' + product.name + "</a>" +
          '<div class="cart-row__variant">' +
          "<span>" + (color ? '<span class="cart-row__color" style="background:' + color.hex + '"></span>' + color.name : "—") + "</span>" +
          "<span>سایز: " + item.line.size + "</span>" +
          "<span>کد: " + product.id.toUpperCase() + "</span>" +
          "</div>" +
          '<div class="cart-row__price">' + toman(item.total) + "</div>" +
          "</div>" +
          '<div class="cart-row__actions">' +
          '<div class="qty">' +
          '<button type="button" data-inc="' + item.key + '" aria-label="افزایش تعداد">+</button>' +
          "<span>" + faNum(item.line.qty) + "</span>" +
          '<button type="button" data-dec="' + item.key + '" aria-label="کاهش تعداد">−</button>' +
          "</div>" +
          '<button class="cart-remove" type="button" data-remove="' + item.key + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>' +
          "حذف</button>" +
          "</div></div>"
        );
      })
      .join("");

    updateTotals(items);
  }

  function updateTotals(items) {
    const subtotal = items.reduce(function (sum, item) {
      return sum + item.total;
    }, 0);

    const saved = items.reduce(function (sum, item) {
      const oldPrice = item.product.oldPrice || item.product.price;
      return sum + (oldPrice - item.product.price) * item.line.qty;
    }, 0);

    const percent = couponPercent();
    const couponOff = percent ? Math.round((subtotal * percent) / 100) : 0;
    const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    const total = Math.max(0, subtotal - couponOff) + shipping;

    subtotalEl.textContent = toman(subtotal);
    savedEl.textContent = saved > 0 ? "− " + toman(saved) : "—";
    shippingEl.textContent = shipping === 0 ? "رایگان" : toman(shipping);
    totalEl.textContent = toman(total);

    if (subtotal >= FREE_SHIPPING_FROM) {
      shippingBar.textContent = "ارسال این سفارش رایگان است ✓";
    } else {
      shippingBar.textContent =
        toman(FREE_SHIPPING_FROM - subtotal) +
        " تا ارسال رایگان باقی مانده است.";
    }

    if (percent) {
      couponRow.hidden = false;
      couponAmountEl.textContent = "− " + toman(couponOff);
      couponMsg.classList.remove("is-error");
      couponMsg.textContent = "کد «" + coupon + "» فعال است: " + COUPONS[coupon].label;
    } else {
      couponRow.hidden = true;
      couponMsg.textContent = "";
      couponMsg.classList.remove("is-error");
    }
  }

  /* ---------- رویدادهای سبد ---------- */

  listEl.addEventListener("click", function (event) {
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    const remove = event.target.closest("[data-remove]");

    if (inc) {
      const key = inc.getAttribute("data-inc");
      const line = getCart().find(function (item) {
        return cartLineKey(item) === key;
      });
      if (line && line.qty < 10) {
        setLineQty(key, line.qty + 1);
        render();
      }
    }

    if (dec) {
      const key = dec.getAttribute("data-dec");
      const line = getCart().find(function (item) {
        return cartLineKey(item) === key;
      });
      if (line) {
        if (line.qty <= 1) {
          removeLine(key);
          showToast("محصول از سبد حذف شد");
        } else {
          setLineQty(key, line.qty - 1);
        }
        render();
      }
    }

    if (remove) {
      removeLine(remove.getAttribute("data-remove"));
      showToast("محصول از سبد حذف شد");
      render();
    }
  });

  document.querySelector("[data-cart-clear]").addEventListener("click", function () {
    if (!getCart().length) return;
    saveCart([]);
    showToast("سبد خرید خالی شد");
    render();
  });

  /* ---------- کد تخفیف ---------- */

  document.querySelector("[data-coupon-apply]").addEventListener("click", applyCoupon);
  couponInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyCoupon();
    }
  });

  function applyCoupon() {
    const code = toLatinDigits(couponInput.value).trim().toUpperCase();

    if (!code) {
      couponMsg.classList.add("is-error");
      couponMsg.textContent = "کد تخفیف را وارد کنید.";
      return;
    }

    if (!COUPONS[code]) {
      coupon = "";
      writeStore(COUPON_KEY, "");
      couponMsg.classList.add("is-error");
      couponMsg.textContent = "این کد معتبر نیست یا منقضی شده است.";
      couponRow.hidden = true;
      updateTotals(cartDetailed());
      return;
    }

    coupon = code;
    writeStore(COUPON_KEY, coupon);
    couponInput.value = code;
    updateTotals(cartDetailed());
  }

  /* ---------- مودال ثبت سفارش ---------- */

  function openModal() {
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelector("[data-checkout]").addEventListener("click", function () {
    if (!cartDetailed().length) return;
    if (coupon) couponInput.value = coupon;
    openModal();
    setTimeout(function () {
      const first = form.querySelector("input");
      if (first) first.focus();
    }, 180);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.closest("[data-modal-close]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  /* اعتبارسنجی ساده */
  function setError(field, hasError) {
    field.classList.toggle("has-error", hasError);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const nameField = form.querySelector('[name="name"]').closest(".field");
    const phoneField = form.querySelector('[name="phone"]').closest(".field");
    const cityField = form.querySelector('[name="city"]').closest(".field");
    const addressField = form.querySelector('[name="address"]').closest(".field");

    const name = form.querySelector('[name="name"]').value.trim();
    const phone = toLatinDigits(form.querySelector('[name="phone"]').value).replace(/[\s-]/g, "");
    const city = form.querySelector('[name="city"]').value.trim();
    const address = form.querySelector('[name="address"]').value.trim();

    const validName = name.length >= 3;
    const validPhone = /^09\d{9}$/.test(phone);
    const validCity = city.length >= 2;
    const validAddress = address.length >= 10;

    setError(nameField, !validName);
    setError(phoneField, !validPhone);
    setError(cityField, !validCity);
    setError(addressField, !validAddress);

    if (!(validName && validPhone && validCity && validAddress)) {
      const firstError = form.querySelector(".field.has-error input, .field.has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    /* شمارهٔ سفارش نمونه */
    const orderCode = "RG-" + Math.floor(1000 + Math.random() * 9000);
    const total = totalEl.textContent;

    modalBox.innerHTML =
      '<div class="order-success">' +
      '<div class="order-success__icon">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>' +
      "</div>" +
      "<h3>سفارش شما ثبت شد</h3>" +
      "<p>شمارهٔ پیگیری سفارش:</p>" +
      "<p><code>" + orderCode + "</code></p>" +
      "<p>" + name + " عزیز، مبلغ " + total + " ثبت شد و همکاران ما برای هماهنگی ارسال تماس می‌گیرند.</p>" +
      '<a class="btn btn--primary" style="margin-top:16px" href="shop.html">ادامهٔ خرید</a>' +
      "</div>";

    saveCart([]);
    coupon = "";
    writeStore(COUPON_KEY, "");
    render();
  });

  /* ---------- شروع ---------- */
  render();
  if (cartCount() === 0) {
    coupon = "";
    writeStore(COUPON_KEY, "");
  }
  if (coupon) couponInput.value = coupon;
  updateCartCount();
});
