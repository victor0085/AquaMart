/* =====================================================================
 * js/features.js
 * NEW features layered on top of the original views WITHOUT editing them.
 * Each block wraps an existing view (V.home, V.product, V.cart) and appends
 * or injects extra HTML. To remove a feature, delete its block.
 * ===================================================================== */
"use strict";

/* A reusable row of product cards with a heading */
const shelf = (title, list, link) => list.length ? `
  <section class="sec">
    <div class="sh"><h2>${title}</h2>${link ? `<a class="btn o sm" href="${link}">View all</a>` : ""}</div>
    <div class="grid g5">${list.map(card).join("")}</div>
  </section>` : "";

/* ---- 1. Home page: extra sections under the original ones ---- */
const baseHome = V.home;
V.home = () => {
  const inStock = PRODUCTS.filter(p => p.stock);
  const fresh = [...inStock].sort((a, b) => b.id - a.id).slice(0, 5);
  const cheap = inStock.filter(p => p.price <= 15000).sort((a, b) => a.price - b.price).slice(0, 5);
  const topDeals = [...inStock].sort((a, b) => b.discount - a.discount).slice(0, 5);
  const voices = [
    ["Tola A.", "Ordered on Monday, tracked it every step, arrived Wednesday."],
    ["Emeka N.", "Prices are fair and the return policy is clear."],
    ["Fatima Y.", "Checkout was quick and the address saved for next time."]
  ];
  return baseHome()
    + shelf("New arrivals", fresh, "#/shop?sort=new")
    + shelf("Under ₦15,000", cheap, "#/shop?max=15000&sort=low")
    + shelf("Biggest discounts", topDeals, "#/shop?deal=1")
    + `<section class="sec promo">
         <div><h2>Get ₦2,000 off your first order</h2><p>Use code <b>WELCOME2000</b> at checkout, or join the list for new deals.</p></div>
         <form data-form="news" novalidate>
           <label class="hide" for="nem2">Email for deals</label>
           <input id="nem2" name="nem" type="email" placeholder="you@example.com">
           <button class="btn acc">Subscribe</button>
         </form>
       </section>
       <section class="sec"><h2>What shoppers say</h2>
         <div class="voices">${voices.map(([n, t]) => `<figure class="card"><blockquote>${esc(t)}</blockquote><figcaption class="mut">${esc(n)}</figcaption></figure>`).join("")}</div>
       </section>`;
};

/* ---- 2. Product page: "Recently viewed" row ---- */
const baseProduct = V.product;
V.product = (slugName, ...rest) => {
  const html = baseProduct(slugName, ...rest);
  const current = productService.bySlug(slugName);
  if (!current) return html;
  const seen = readList("recently_viewed").filter(id => id !== current.id)
    .map(id => productService.get(id)).filter(Boolean).slice(0, 5);
  return html + shelf("Recently viewed", seen);
};

/* ---- 3. Cart page: free-delivery progress bar ---- */
const baseCart = V.cart;
V.cart = () => {
  const html = baseCart();
  const items = cartService.read().items;
  if (!items.length) return html;
  const t = cartService.totals(items);
  const amountToPay = t.subtotal - t.discount;
  const left = Math.max(0, FREE_DELIVERY_FROM - amountToPay);
  const pct = Math.min(100, Math.round(amountToPay / FREE_DELIVERY_FROM * 100));
  const bar = `<div class="ship card" role="status">
      <b>${left ? `Add ${money(left)} more for free delivery` : "You've unlocked free delivery"}</b>
      <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div></div>`;
  return html.replace("<h1>Shopping cart</h1>", "<h1>Shopping cart</h1>" + bar);
};

/* ---- 4. Back-to-top button ---- */
(() => {
  const b = document.createElement("button");
  b.className = "totop hide"; b.setAttribute("aria-label", "Back to top"); b.textContent = "↑";
  b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(b);
  addEventListener("scroll", () => b.classList.toggle("hide", scrollY < 700), { passive: true });
})();

/* ---- 5. Product photos: if a photo file is missing, show the generated drawing instead ---- */
addEventListener("error", e => {
  const img = e.target;
  if (!img || img.tagName !== "IMG") return;
  const drawing = IMG_FALLBACK[img.getAttribute("src")];
  if (drawing) img.src = drawing;
}, true);
