/* =====================================================================
 * js/ui.js
 * Shared UI: toast, modal, confirmBox, product card(), form field(), validation helpers, refresh() for header counters, meta().
 * ===================================================================== */
"use strict";

/* ---------- UI helpers ---------- */
const timers = [];

let T;

// Shows a short message at the bottom of the screen. Pass "bad" as the second argument for an error.
function toast(m, t = "") {
  const e = document.createElement("div");
  e.className = "toast " + t;
  e.textContent = m;
  $("#toasts").append(e);
  setTimeout(() => e.remove(), 3200)
}

const dlg = $("#dlg");

const modal = h => {
  dlg.innerHTML = h;
  dlg.showModal()
};

const confirmBox = m => new Promise(r => {
  modal(`<h3>Please confirm</h3>
    <p>${esc(m)}</p>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn o" value="n">Cancel</button><button class="btn bad" value="y">Confirm</button></div>`);
  dlg.onclick = e => {
    const b = e.target.closest("button[value]");
    if (b) {
      dlg.close();
      r(b.value === "y")
    }
  };
  dlg.onclose = () => r(false)
});

const stars = r => `<span class="star" aria-label="${r} out of 5">${"★".repeat(Math.round(r))}${"☆".repeat(5-Math.round(r))}</span>`;

const badge = (s) => `<span class="badge ${{Paid:"b-ok",Delivered:"b-ok",Failed:"b-bad",Cancelled:"b-bad",Refunded:"b-w",Pending:"b-w",Processing:"b-w"}[s]||""}">${esc(s)}</span>`;

const stock = p => p.stock < 1 ? `<span class="badge b-bad">Out of stock</span>` : p.stock < 10 ? `<span class="badge b-w">Only ${p.stock} left</span>` : `<span class="badge b-ok">In stock</span>`;

const empty = (e, t, m, l, h) => `<div class="empty card">
  <div class="e">${e}</div>
  <h2>${t}</h2>
  <p class="mut">${m}</p>${l?`<a class="btn" href="${h}">${l}</a>`:""}</div>`;

// Builds the HTML for ONE product card. It is used in every product grid.
// The HTML is built one line at a time, so you can see the same layout
// you would write by hand in an .html file.
function card(product) {

  // Step 1: prepare the small pieces.
  const inWishlist = wishService.has(product.id);

  let heartSymbol = "♡";
  let heartLabel = "Add to wishlist";
  if (inWishlist) {
    heartSymbol = "♥";
    heartLabel = "Remove from wishlist";
  }

  let disabledText = "";
  if (product.stock < 1) {
    disabledText = "disabled";
  }

  const productLink = "#/product/" + product.slug;

  // Step 2: build the card, one line of HTML at a time.
  let html = "";

  html = html + '<article class="pc">';

  // The discount tag only shows when the product has a discount.
  if (product.discount) {
    html = html + '  <span class="tag">-' + product.discount + '%</span>';
  }

  // Heart button for the wishlist.
  html = html + '  <button class="wl" data-act="wish" data-id="' + product.id + '" aria-label="' + heartLabel + '" aria-pressed="' + inWishlist + '">' + heartSymbol + '</button>';

  // Product picture.
  html = html + '  <a href="' + productLink + '">';
  html = html + '    <img src="' + product.images[0] + '" alt="' + esc(product.name) + '" loading="lazy" width="400" height="400">';
  html = html + '  </a>';

  // Text part of the card.
  html = html + '  <div class="bd">';
  html = html + '    <span class="mut">' + esc(product.brand) + '</span>';
  html = html + '    <a href="' + productLink + '">';
  html = html + '      <h3 style="margin:0">' + esc(product.name) + '</h3>';
  html = html + '    </a>';
  html = html + '    <div>' + stars(product.rating) + ' <span class="mut">' + product.rating + ' (' + product.reviews.toLocaleString() + ')</span></div>';
  html = html + '    <div>';
  html = html + '      <span class="pr">' + money(product.price) + '</span>';
  html = html + '      <span class="old">' + money(product.oldPrice) + '</span>';
  html = html + '    </div>';
  html = html + '    ' + stock(product);

  // Buttons at the bottom.
  html = html + '    <div style="display:flex;gap:6px;margin-top:auto;padding-top:8px">';
  html = html + '      <button class="btn sm" style="flex:1" data-act="add" data-id="' + product.id + '" ' + disabledText + '>Add to Cart</button>';
  html = html + '      <a class="btn sm o" href="' + productLink + '">Details</a>';
  html = html + '    </div>';

  html = html + '  </div>';
  html = html + '</article>';

  return html;
}

const field = (id, l, t = "text", v = "", x = "") => `<div class="fld"><label for="${id}">${l}</label><input id="${id}" name="${id}" type="${t}" value="${esc(v)}" ${x}>
  <div class="err" data-e="${id}"></div></div>`;

function setErr(f, m) {
  $$(".err", f).forEach(e => e.textContent = "");
  $$("input", f).forEach(i => i.classList.remove("invalid"));
  Object.entries(m).forEach(([k, v]) => {
    const e = $(`[data-e="${k}"]`, f);
    if (e) {
      e.textContent = v;
      $("#" + k, f)?.classList.add("invalid")
    }
  });
  const first = Object.keys(m)[0];
  if (first)
    $("#" + first, f)?.focus();
  return!Object.keys(m).length
}

// Turns a form into a plain object: { fieldName: value }.
const readForm = form => Object.fromEntries(new FormData(form));

const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

const go = p => {
  location.hash = p
};

// Redraws header counters and the account menu. Call it after changing cart, wishlist or notifications.
function refresh() {
  $("#cc").textContent = cartService.count();
  $("#wc").textContent = wishService.ids().length;
  const u = authService.user();
  $("#nc").textContent = u ? notificationService.unread() : 0;
  $("#acct").innerHTML = u ? `<button class="ib" data-act="dd" aria-haspopup="true" aria-expanded="false" style="font:600 14px Public Sans"><span class="badge" style="background:var(--pri);color:var(--on)">${esc(u.firstName[0]||"U")}</span> <span class="hide-sm">${esc(u.firstName)}</span></button>
    <div class="dd hide" role="menu"><a href="#/account">My account</a><a href="#/orders">My orders</a><a href="#/wishlist">Wishlist</a><a href="#/account/addresses">Addresses</a><button data-act="logout">Log out</button></div>` : `<button class="ib" data-act="dd" aria-haspopup="true" aria-expanded="false" aria-label="Account"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></button>
    <div class="dd hide" role="menu"><a href="#/login">Log in</a><a href="#/signup">Register</a></div>`;
  $$("nav a").forEach(a => a.classList.toggle("cur", a.getAttribute("href") === "#" + (location.hash.slice(1) || "/")))
}

const need = () => {
  const u = authService.user();
  if (!u) {
    toast("Please log in to continue.");
    go("/login?next=" + encodeURIComponent(location.hash.slice(1)));
    return null
  }
  return u
};

const meta = (t, d) => {
  document.title = t + " | AQUAMART";
  $('meta[name=description]').content = d || "AQUAMART demo store."
};
