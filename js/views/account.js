/* =====================================================================
 * js/views/account.js
 * Account area with tabs: overview, profile, addresses, payments, notifications, security.
 * ===================================================================== */
"use strict";

const TABS = [["", "Overview"], ["profile", "Profile"], ["addresses", "Addresses"], ["payments", "Payment methods"], ["notifications", "Notifications"], ["security", "Security"]];

V.account = tab => {
  const u = need();
  if (!u)
    return"";
  meta("My account");
  const tb = `<div class="tabs" role="navigation" aria-label="Account">${TABS.map(([k,n])=>`<a class="${(tab||"")===k?"on":""}" href="#/account${k?"/"+k:""}">${n}</a>`).join("")}<a href="#/orders">My Orders</a><a href="#/wishlist">Wishlist</a><a href="#" data-act="logout">Logout</a></div>`;
  let b = "";
  if (!tab) {
    const o = orderService.mine().slice(0, 3),
      ad = addressService.mine();
    b = `<div class="card">
      <h2>${esc(u.firstName)} ${esc(u.lastName)}</h2>
      <p class="mut">${esc(u.email)} · ${esc(u.phone)}<br>Member since ${formatDate(u.createdAt)}</p></div>
      <h2 style="margin-top:20px">Recent orders</h2>${o.length?o.map(orderRow).join(""):empty("📦","You haven't placed any orders yet.","","Start Shopping","#/shop")}
      <h2>Saved addresses</h2>${ad.length?ad.map(a=>addrCard(a)).join(""):`<p class="mut">No saved addresses. <a href="#/account/addresses" style="color:var(--pri)">Add one</a></p>`}`
  } else if (tab === "profile")
    b = `<form class="card" data-form="profile" style="max-width:520px" novalidate>
      <div class="two">${field("firstName","First name","text",u.firstName)}${field("lastName","Last name","text",u.lastName)}</div>${field("phone","Phone","tel",u.phone)}
      <p class="mut">Email: ${esc(u.email)}</p><button class="btn">Save changes</button></form>`;
  else if (tab === "addresses") {
    const ad = addressService.mine();
    b = `<button class="btn" data-act="naddr">Add address</button>
      <div style="margin-top:14px">${ad.length?ad.map(a=>addrCard(a,1)).join(""):empty("📍","No saved addresses.","Add an address for faster checkout.")}</div>`
  } else if (tab === "payments")
    b = empty("💳", "No saved payment methods.", "AQUAMART never stores card details in this demo. Enter a card at checkout each time.");
  else if (tab === "notifications") {
    const n = notificationService.mine();
    b = n.length ? `<button class="btn sm o" data-act="readall">Mark all as read</button>
      <div style="margin-top:12px">${n.map(x=>`<div class="card" style="margin-bottom:8px;${x.read?"":"border-left:4px solid var(--acc)"}">
      <div class="sh"><b>${esc(x.title)}</b><span class="mut">${formatDateTime(x.at)}</span></div>
      <p style="margin:4px 0">${esc(x.body)}</p>${x.read?"":`<button class="btn sm o" data-act="read" data-id="${x.id}">Mark as read</button> `}<button class="btn sm o" data-act="deln" data-id="${x.id}">Delete</button></div>`).join("")}</div>` : empty("🔔", "No notifications.", "Order and delivery updates will appear here.")
  } else if (tab === "security")
    b = `<form class="card" data-form="pw" style="max-width:520px" novalidate>
      <h3>Change password</h3>${field("cur","Current password","password")}${field("nw","New password","password")}${field("cf","Confirm new password","password")}<button class="btn">Update password</button></form>`;
  return`<h1>My account</h1>${tb}${b}`
};
