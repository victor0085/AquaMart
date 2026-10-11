/* =====================================================================
 * js/views/addresses.js
 * Address form and address card (used by account and checkout).
 * ===================================================================== */
"use strict";

/* account */
const addrForm = a => `<form data-form="addr" data-id="${a.id||""}" novalidate>
  <div class="two">${field("fullName","Full name","text",a.fullName)}${field("phone","Phone","tel",a.phone)}${field("country","Country","text",a.country||"Nigeria")}${field("state","State","text",a.state)}${field("city","City","text",a.city)}${field("postal","Postal code","text",a.postal)}</div>${field("street","Street address","text",a.street)}${field("apt","Apartment (optional)","text",a.apt)}<label><input type="checkbox" id="isDefault" ${a.isDefault?"checked":""}> Set as default</label>
  <div style="margin-top:12px;display:flex;gap:8px"><button class="btn">Save address</button><button class="btn o" type="button" data-act="closeDlg">Cancel</button></div></form>`;

const addrCard = (a, w) => `<div class="card" style="margin-bottom:10px"><b>${esc(a.fullName)}</b> ${a.isDefault?'<span class="badge b-ok">Default</span>':""}
  <p class="mut" style="margin:4px 0">${esc(a.street)}${a.apt?", "+esc(a.apt):""}, ${esc(a.city)}, ${esc(a.state)} ${esc(a.postal)}, ${esc(a.country)}<br>${esc(a.phone)}</p>${w?`<button class="btn sm o" data-act="eaddr" data-id="${a.id}">Edit</button> <button class="btn sm o" data-act="daddr" data-id="${a.id}">Delete</button> ${a.isDefault?"":`<button class="btn sm o" data-act="defaddr" data-id="${a.id}">Set default</button>`}`:""}</div>`;
