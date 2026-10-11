/* =====================================================================
 * js/views/cart.js
 * Order summary box, cart page, wishlist page.
 * ===================================================================== */
"use strict";

const sumBox = (t, extra = "") => `<div class="card sum">
  <h3>Order summary</h3>
  <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
  <div><span>Discount</span><span style="color:var(--ok)">-${money(t.discount)}</span></div>
  <div><span>Delivery</span><span>${t.shippingFee?money(t.shippingFee):"Free"}</span></div>
  <div><span>VAT (7.5%)</span><span>${money(t.tax)}</span></div>
  <div class="t"><span>Total</span><span>${money(t.total)}</span></div>${extra}</div>`;

V.cart = () => {
  meta("Cart");
  const c = cartService.read(),
    L = cartService.lines(c.items),
    sv = cartService.lines(c.saved);
  const line = (l, i, s) => `<div class="row"><a href="#/product/${l.p.slug}"><img src="${l.p.images[0]}" alt="${esc(l.p.name)}"></a>
    <div><a href="#/product/${l.p.slug}"><b>${esc(l.p.name)}</b></a>
    <div class="mut">${[l.color,l.size].filter(Boolean).join(" · ")} · ${money(l.p.price)}</div>${s?`<button class="btn sm o" data-act="restore" data-i="${i}">Move to cart</button>`:`<div class="qty" style="margin:6px 0"><button data-act="qm" data-i="${i}" aria-label="Decrease">−</button><input type="number" min="1" value="${l.qty}" data-qin="${i}" aria-label="Quantity"><button data-act="qp" data-i="${i}" aria-label="Increase">+</button></div>
    <div><button class="btn sm o" data-act="save" data-i="${i}">Save for later</button> <button class="btn sm bad" data-act="rm" data-i="${i}">Remove</button></div>`}</div><b>${money(l.p.price*l.qty)}</b></div>`;
  return`<h1>Shopping cart</h1>${L.length?`<div class="lay">
    <div class="card">
    <div style="text-align:right"><button class="btn sm o" data-act="clearcart">Remove all items</button></div>${L.map((l,i)=>line(l,i)).join("")}</div>${sumBox(cartService.totals(c.items),`${couponBox()}<a class="btn" style="width:100%;margin-top:10px" href="#/checkout">Proceed to checkout</a>`)}</div>`:empty("🛒","Your cart is empty.","Add something you love and it will show up here.","Start Shopping","#/shop")}${sv.length?`<section class="sec card">
    <h2>Saved for later</h2>${sv.map((l,i)=>line(l,i,1)).join("")}</section>`:""}`
};

V.wishlist = () => {
  meta("Wishlist");
  const l = wishService.ids().map(i => productService.get(i)).filter(Boolean);
  return`<h1>Wishlist</h1>${l.length?`<div class="grid">${l.map(p=>card(p)).join("")}</div>`:empty("♡","You haven't saved any products yet.","Tap the heart on any product to save it.","Browse products","#/shop")}`
};
