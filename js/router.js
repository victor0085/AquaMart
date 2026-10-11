/* =====================================================================
 * js/router.js
 * Hash router: route() picks a view from location.hash and renders it into #app.
 * ===================================================================== */
"use strict";

/* ---------- router ---------- */
// Runs on every URL change: reads the hash, picks a view from the map, shows a loading skeleton, then renders the view into #app.
function route() {
  timers.splice(0).forEach(clearInterval);
  $("#ld")?.remove();
  const h = location.hash.slice(1) || "/",
    [p, qs] = h.split("?"),
    q = Object.fromEntries(new URLSearchParams(qs || "")),
    s = p.split("/").filter(Boolean),
    k = s[0] || "home";
  $("#nav").classList.remove("open");
  $("#scrim").classList.remove("on");
  const map = {
    home: () => V.home(),
    categories: () => V.categories(),
    shop: () => V.shop(q),
    product: () => V.product(s[1]),
    cart: () => V.cart(),
    wishlist: () => V.wishlist(),
    login: () => V.login(q),
    signup: () => V.signup(),
    "forgot-password": () => V.forgot(),
    account: () => V.account(s[1]),
    orders: () => V.orders(),
    order: () => V.order(s[1], q),
    track: () => V.track(s[1]),
    help: () => V.help(),
    contact: () => V.contact(),
    about: () => V.page("about"),
    terms: () => V.page("terms"),
    privacy: () => V.page("privacy"),
    returns: () => V.page("returns"),
    page: () => V.page(s[1]),
    seller: () => V.seller(s[1]),
    checkout: () => V.checkout(q)
  };
  if (k !== "checkout" && ck.step === 5)
    ck = {
      ...ck,
      step: 1
    };
  const app = $("#app");
  app.innerHTML = `<div class="grid">${'<div class="sk"></div>'.repeat(4)}</div>`;
  clearTimeout(T);
  T = setTimeout(() => {
    try {
      app.innerHTML = (map[k] || (() => V[404]()))()
    } catch (e) {
      console.error(e);
      app.innerHTML = empty("⚠️", "Something went wrong.", "Please try again.", "Back to home", "#/")
    }
    refresh();
    if (k === "home")
      V.afterHome();
    window.scrollTo(0, 0);
    $("#main").focus({preventScroll: true})
  }, k === "shop" || k === "home" ? 160 : 30)
}

addEventListener("hashchange", route);
