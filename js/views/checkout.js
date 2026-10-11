/* =====================================================================
 * js/views/checkout.js
 * 4-step checkout: address, delivery, review, payment. State lives in the ck object.
 * ===================================================================== */
"use strict";

/* ---------- checkout ---------- */
// Checkout state kept between steps: step 1-4, chosen address, delivery method, payment method, error message, busy flag.
let ck = {
  step: 1,
  addr: null,
  method: "standard",
  pay: "card",
  err: "",
  busy: false
};

const METHODS = {
  standard: ["Standard Delivery", "3–5 business days", 5],
  express: ["Express Delivery", "1–2 business days", 2],
  sameday: ["Same-Day Delivery", "Today (Lagos only)", 0]
};

V.checkout = q => {
  const u = need();
  if (!u)
    return"";
  meta("Checkout");
  const c = cartService.read();
  if (!c.items.length)
    return`<h1>Checkout</h1>${empty("🛒","Your cart is empty.","Add items before checking out.","Start Shopping","#/shop")}`;
  const ads = addressService.mine();
  if (!ck.addr || !ads.some(a => a.id === ck.addr))
    ck.addr = (ads.find(a => a.isDefault) || ads[0])?.id || null;
  const addr = ads.find(a => a.id === ck.addr),
    t = cartService.totals(c.items, ck.method);
  const st = ["Address", "Delivery", "Review", "Payment"].map((s, i) => `<span class="${ck.step===i+1?"on":ck.step>i+1?"done":""}">${ck.step>i+1?"✓ ":""}${s}</span>`).join("");
  let b = "";
  if (ck.step === 1)
    b = `<h2>Delivery address</h2>${ads.map(a=>`<label class="opn"><input type="radio" name="ad" value="${a.id}" data-act="pickaddr" ${a.id===ck.addr?"checked":""}><span><b>${esc(a.fullName)}</b><br><span class="mut">${esc(a.street)}, ${esc(a.city)}, ${esc(a.state)} · ${esc(a.phone)}</span></span></label>`).join("")||`<p class="mut">You have no saved address yet.</p>`}<button class="btn o" data-act="naddr">Add new address</button> <button class="btn" data-act="next" ${addr?"":"disabled"}>Continue</button>`;
  if (ck.step === 2)
    b = `<h2>Delivery method</h2>${Object.entries(METHODS).map(([k,m])=>{const dis=k==="sameday"&&addr?.state.trim().toLowerCase()!=="lagos",f=cartService.totals(c.items,k).shippingFee;return`<label class="opn" style="${dis?"opacity:.5":""}"><input type="radio" name="dm" value="${k}" data-act="pickm" ${ck.method===k?"checked":""} ${dis?"disabled":""}><span><b>${m[0]}</b> – ${f?money(f):"Free"}<br><span class="mut">${m[1]}, est. ${formatDate(Date.now()+m[2]*864e5)}${dis?" · Not available for your address":""}</span></span></label>`}).join("")}<button class="btn o" data-act="back">Back</button> <button class="btn" data-act="next">Continue</button>`;
  if (ck.step === 3)
    b = `<h2>Review order</h2>${cartService.lines(c.items).map(l=>`<div class="row"><img src="${l.p.images[0]}" alt="${esc(l.p.name)}">
      <div><b>${esc(l.p.name)}</b>
      <div class="mut">Qty ${l.qty} · ${money(l.p.price)}</div></div><b>${money(l.p.price*l.qty)}</b></div>`).join("")}
      <p class="mut">Ship to ${esc(addr?.fullName)}, ${esc(addr?.street)}, ${esc(addr?.city)} · ${METHODS[ck.method][0]}</p><button class="btn o" data-act="back">Back</button> <button class="btn" data-act="next">Continue to payment</button>`;
  if (ck.step === 4)
    b = `<h2>Payment</h2>
      <div class="demo"><b>DEMO PAYMENT SYSTEM.</b> No real money is charged. Test card: 4242 4242 4242 4242, any future expiry, any 3-digit CVV. Card ending 0002 is declined; ending 9119 times out.</div>${ck.err?`<div class="card" style="border-color:var(--bad);color:var(--bad);margin-bottom:12px" role="alert">${esc(ck.err)}</div>`:""}
${[["card","Card"],["bank","Bank transfer"],["cod","Cash on Delivery"],["demo","Demo payment (instant success)"]].map(([k,n])=>`<label class="opn"><input type="radio" name="pm" value="${k}" data-act="pickp" ${ck.pay===k?"checked":""}><b>${n}</b></label>`).join("")}

      <form data-form="pay" novalidate>${ck.pay==="card"?`${field("cn","Cardholder name","text","","autocomplete=cc-name")}${field("cnum","Card number","text","","inputmode=numeric autocomplete=cc-number maxlength=23 placeholder='4242 4242 4242 4242'")}
      <div class="two">${field("exp","Expiry (MM/YY)","text","","inputmode=numeric maxlength=5 placeholder=MM/YY autocomplete=cc-exp")}${field("cvv","CVV","password","","inputmode=numeric maxlength=4 autocomplete=cc-csc")}</div>`:ck.pay==="bank"?`<p class="mut">Pay by bank transfer to the demo account below, then use “Simulate transfer received” on the order. <b>Demo bank, 0000000000.</b></p>`:ck.pay==="cod"?`<p class="mut">Pay in cash when your order arrives.</p>`:`<p class="mut">Instantly approves a simulated payment.</p>`}

      <div style="display:flex;gap:8px;margin-top:10px"><button class="btn o" type="button" data-act="back" ${ck.busy?"disabled":""}>Back</button><button class="btn acc" id="paybtn" ${ck.busy?"disabled":""}>${ck.busy?`<span class="spin"></span> Processing…`:`Pay ${money(t.total)}`}</button></div></form>`;
  return`<h1>Checkout</h1>
    <div class="steps" aria-label="Progress">${st}</div>
    <div class="lay">
    <div class="card">${b}</div>${sumBox(t)}</div>`
};
