/* =====================================================================
 * js/views/home.js
 * Views registry V, hero slides, home page, hero carousel + flash-sale countdown, categories page.
 * ===================================================================== */
"use strict";

/* ---------- views ---------- */
const V = {};

// Hero carousel data: [title, subtitle, link, background colour, [product ids shown]].
const slides = [["Phones and laptops at Nigerian prices", "Tecno, Infinix and Samsung with warranty, from ₦134,800.", "#/shop?cat=phones", "#07424f", [12, 14]], ["New season fashion", "Senator wear, Ankara and Aba-made shoes.", "#/shop?cat=fashion", "#7a2230", [38, 42]], ["Gaming essentials", "Consoles and controllers, free delivery over ₦50,000.", "#/shop?cat=gaming", "#183b4d", [81, 82]]];

V.home = () => {
  meta("Everything you need, delivered", "Shop phones, fashion, home, groceries and more at AQUAMART (demo store).");
  const fl = productService.all().filter(p => p.stock).sort((a, b) => b.discount - a.discount).slice(0, 5);
  return`<section class="hero" id="hero" aria-roledescription="carousel" aria-label="Promotions">${slides.map((s,i)=>`<div class="slide ${i?"":"on"}" style="background:${s[3]}" role="group" aria-label="Slide ${i+1}">
    <div class="hp" aria-hidden="true">${s[4].map(i=>`<img src="${PRODUCTS[i-1].images[0]}" alt="">`).join("")}</div>
    <h1>${s[0]}</h1>
    <p>${s[1]}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn acc" href="${s[2]}">Shop Now</a><a class="btn o" style="color:#fff;border-color:#fff" href="#/shop?deal=1">Explore Deals</a></div></div>`).join("")}<button class="nv" style="left:10px" data-act="slide" data-d="-1" aria-label="Previous slide">‹</button><button class="nv" style="right:10px" data-act="slide" data-d="1" aria-label="Next slide">›</button>
    <div class="dots">${slides.map((_,i)=>`<button data-act="slide" data-i="${i}" class="${i?"":"on"}" aria-label="Go to slide ${i+1}"></button>`).join("")}</div></section>

    <section class="sec trust">${[["Secure checkout","Encrypted payments (demo mode)"],["7-day returns","On eligible items"],["Fast delivery","Same-day in Lagos"],["Need help?",CFG.phone]].map(t=>`<div class="card"><b>${t[0]}</b>
    <div class="mut">${t[1]}</div></div>`).join("")}</section>

    <section class="sec">
    <h2>Shop by category</h2>
    <div class="cats">${Object.entries(CATS).map(([k,[n,e]])=>`<a class="cat" href="#/shop?cat=${k}"><img src="${PRODUCTS.find(p=>p.category===k).images[0]}" alt="" loading="lazy">${n}</a>`).join("")}</div></section>

    <section class="sec flash">
    <div class="sh">
    <h2 style="margin:0">Flash sale</h2>
    <div class="cd" id="cd" aria-label="Time left"></div></div>
    <div class="grid g5" style="margin-top:14px">${fl.map(card).join("")}</div></section>

    <section class="sec">
    <div class="sh">
    <h2>Featured products</h2><a class="btn o sm" href="#/shop">View all</a></div>
    <div class="grid g5">${[...PRODUCTS].sort((a,b)=>b.rating-a.rating).slice(0,10).map(card).join("")}</div></section>

    <section class="sec">
    <h2>Popular brands</h2>
    <div class="opt">${[...new Set(PRODUCTS.map(p=>p.brand))].slice(0,16).map(b=>`<a class="badge" style="padding:8px 14px;font-size:14px" href="#/shop?brand=${encodeURIComponent(b)}">${b}</a>`).join("")}</div></section>
    <section class="sec">
    <h2>${readList("recently_viewed").length?"Recommended for you":"Popular right now"}</h2>
    <div class="grid g5">${productService.recommended().map(card).join("")}</div></section>`
};

V.afterHome = () => {
  const h = $("#hero");
  if (!h)
    return;
  let i = 0,
    paused = false;
  const sl = $$(".slide", h),
    dt = $$(".dots button", h);
  const show = n => {
    i = (n + sl.length) % sl.length;
    sl.forEach((s, k) => s.classList.toggle("on", k === i));
    dt.forEach((d, k) => d.classList.toggle("on", k === i))
  };
  h.addEventListener("mouseenter", () => paused = true);
  h.addEventListener("mouseleave", () => paused = false);
  h.addEventListener("focusin", () => paused = true);
  h.addEventListener("focusout", () => paused = false);
  h._show = n => show(typeof n === "function" ? n(i) : n);
  timers.push(setInterval(() => {
    if (!paused)
      show(i + 1)
  }, 5000));
  const tick = () => {
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    const s = Math.max(0, Math.floor((e - Date.now()) / 1e3)),
      p = n => String(n).padStart(2, "0");
    const c = $("#cd");
    if (c)
      c.innerHTML = `<b>${p(s/3600|0)}h</b><b>${p(s%3600/60|0)}m</b><b>${p(s%60)}s</b>`
  };
  tick();
  timers.push(setInterval(tick, 1e3))
};

V.categories = () => {
  meta("Categories");
  return`<h1>All categories</h1>
    <div class="cats">${Object.entries(CATS).map(([k,[n,e]])=>`<a class="cat" href="#/shop?cat=${k}"><img src="${PRODUCTS.find(p=>p.category===k).images[0]}" alt="" loading="lazy">${n}
    <div class="mut">${PRODUCTS.filter(p=>p.category===k).length} products</div></a>`).join("")}</div>`
};
