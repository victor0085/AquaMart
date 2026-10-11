/* =====================================================================
 * js/chrome.js
 * Static page chrome: top strip, footer contact column, chat button, WhatsApp button, cookie notice.
 * ===================================================================== */
"use strict";

const lk = (h, t, x = "") => `<a href="${h}" ${x}>${t}</a>`;

const contactInfo = () => `<p class="mut" style="margin:0 0 12px">Call <a href="tel:${CFG.tel}" style="color:var(--pri)"><b>${CFG.phone}</b></a><br>Email <a href="mailto:${CFG.email}" style="color:var(--pri)"><b>${esc(CFG.email)}</b></a><br>WhatsApp <a href="https://wa.me/${CFG.wa}" target="_blank" rel="noopener" style="color:var(--pri)">Chat now</a><br>${esc(CFG.hours)} · ${esc(CFG.address)}</p>`;

const couponBox = () => {
  const c = storage.get("coupon");
  return c && COUPONS[c] ? `<p class="mut" style="margin:10px 0">Code <b>${esc(c)}</b> applied. <button class="btn sm o" data-act="rmcoupon">Remove</button></p>` : `<form data-form="coupon" style="display:flex;gap:6px;margin-top:10px" novalidate><label class="hide" for="cpn">Promo code</label><input id="cpn" name="cpn" placeholder="Promo code (try AQUA10)" autocomplete="off"><button class="btn sm">Apply</button></form>`
};

function chrome() {
  $("#strip").innerHTML = `Free delivery over ₦50,000 · Call ${lk("tel:"+CFG.tel,CFG.phone)} · ${lk("mailto:"+CFG.email,esc(CFG.email))}`;
  $("#fc").innerHTML = `<h3>Contact</h3>${lk("tel:"+CFG.tel,CFG.phone)}${lk("mailto:"+CFG.email,esc(CFG.email))}${lk("https://wa.me/"+CFG.wa,"WhatsApp",'target="_blank" rel="noopener"')}<span>${esc(CFG.hours)}</span><span>${esc(CFG.address)}</span>`;
  $("#chat").innerHTML = '<button class="btn" data-act="chat" style="box-shadow:0 4px 14px #0004">Chat with us</button>';
  document.body.insertAdjacentHTML("beforeend", `<a class="wa" href="https://wa.me/${CFG.wa}" target="_blank" rel="noopener">WhatsApp us</a>`);
  if (!storage.get("consent"))
    document.body.insertAdjacentHTML("beforeend", `<div class="cookie" id="ck" role="dialog" aria-label="Cookie notice"><span>We use LocalStorage to keep your cart and login. ${lk("#/page/cookies","Cookie policy")}</span><button class="btn sm acc" data-act="consent">Accept</button></div>`)
}
