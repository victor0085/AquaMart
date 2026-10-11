/* =====================================================================
 * js/views/seller.js
 * Seller landing page, registration and demo dashboard.
 * ===================================================================== */
"use strict";

V.seller = sub => {
  meta("Sell on AQUAMART");
  const s = storage.get("seller");
  if (sub === "dashboard") {
    if (!s)
      return`${empty("🏪","Register as a seller first.","","Become a seller","#/seller")}`;
    const o = readList("orders"),
      rev = o.reduce((t, x) => t + x.total, 0) + 1840000;
    return`<h1>Seller dashboard <span class="badge">Demo data</span></h1>
      <p class="mut">${esc(s.store)}</p>
      <div class="stat">${[["Total sales",money(rev)],["Orders",o.length+128],["Products",PRODUCTS.length],["Revenue (30d)",money(rev*.42)]].map(([a,b])=>`<div class="card"><span class="mut">${a}</span><b>${b}</b></div>`).join("")}</div>
      <div class="lay" style="margin-top:16px">
      <div class="card">
      <h3>Products</h3>
      <table>${PRODUCTS.slice(0,6).map(p=>`<tr><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${p.stock} in stock</td></tr>`).join("")}</table></div>
      <div class="card">
      <h3>Recent orders</h3>${["SN-20261003-118204","SN-20261004-552019","SN-20261004-908833"].map(x=>`<p style="margin:0 0 8px">${x}<br><span class="mut">Processing</span></p>`).join("")}${o.slice(-2).map(x=>`<p style="margin:0 0 8px">${x.id}<br><span class="mut">${x.orderStatus}</span></p>`).join("")}</div></div>`
  }
  return`<section class="hero" style="background:#07424f;padding:36px 24px">
    <h1>Sell on AQUAMART</h1>
    <p>Reach shoppers across Nigeria with fast payouts and easy tools.</p>${s?`<a class="btn acc" href="#/seller/dashboard">Open seller dashboard</a>`:`<a class="btn acc" href="#reg" data-act="scroll">Become a seller</a>`}</section>
    <div class="grid sec" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${[["💸","Low fees","Keep more of every sale."],["🚚","Logistics help","Pickup and delivery handled."],["📊","Live insights","Track sales and orders."]].map(b=>`<div class="card">
    <h3>${b[1]}</h3>
    <p class="mut">${b[2]}</p></div>`).join("")}</div>
    <div class="card" id="reg" style="max-width:520px">
    <h2>Seller registration</h2>
    <form data-form="seller" novalidate>${field("store","Store name","text",s?.store||"")}${field("email","Business email","email",s?.email||"")}${field("phone","Phone","tel")}${field("cat","Main category","text")}<button class="btn">Register as seller</button></form></div>`
};
