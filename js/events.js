/* =====================================================================
 * js/events.js
 * Click handlers. Buttons use data-act="name", which maps to A.name() here. Also change/input/keydown listeners.
 * ===================================================================== */
"use strict";

/* ---------- events ---------- */
const opts = () => ({color: $("#oc .on")?.textContent, size: $("#os .on")?.textContent});

// Click actions. A button with data-act="add" runs A.add(button).
const A = {
  menu() {
    const o = $("#nav").classList.toggle("open");
    $("#scrim").classList.toggle("on", o)
  },
  dd(el) {
    const m = el.nextElementSibling,
      o = m.classList.toggle("hide");
    el.setAttribute("aria-expanded", !o)
  },
  logout() {
    authService.logout();
    refresh();
    toast("You have been logged out.");
    go("/")
  },
  add(el) {
    if (cartService.add(+el.dataset.id))
      toast("Product added to cart.")
  },
  addd(el) {
    const q = +$("#pq").value || 1;
    if (cartService.add(+el.dataset.id, q, opts()))
      toast("Product added to cart.")
  },
  buy(el) {
    if (cartService.add(+el.dataset.id, +$("#pq").value || 1, opts()))
      go("/checkout")
  },
  wish(el) {
    const on = wishService.toggle(+el.dataset.id);
    if (location.hash.startsWith("#/wishlist"))
      route();
    else if (el.classList.contains("wl")) {
      el.textContent = on ? "♥" : "♡";
      el.setAttribute("aria-pressed", on)
    } else
      el.textContent = on ? "♥ Saved" : "♡ Wishlist"
  },
  thumb(el) {
    $("#gm").src = el.dataset.src;
    $$(".th button").forEach(b => b.classList.toggle("on", b === el))
  },
  opt(el) {
    $$("button", el.parentNode).forEach(b => {
      b.classList.toggle("on", b === el);
      b.setAttribute("aria-pressed", b === el)
    })
  },
  pq(el) {
    const i = $("#pq");
    i.value = Math.max(1, Math.min(+i.max, (+i.value || 1) + +el.dataset.d))
  },
  slide(el) {
    const h = $("#hero");
    el.dataset.i != null ? h._show(+el.dataset.i) : h._show(n => n + +el.dataset.d)
  },
  qp(el) {
    const c = cartService.read()
  },
  qm(el) {},
  rm(el) {
    cartService.remove(+el.dataset.i);
    route();
    toast("Item removed.")
  },
  save(el) {
    cartService.save(+el.dataset.i);
    route();
    toast("Saved for later.")
  },
  restore(el) {
    cartService.restore(+el.dataset.i);
    route();
    toast("Moved to cart.")
  },
  async clearcart() {
    if (await confirmBox("Remove all items from your cart?")) {
      const c = cartService.read();
      cartService.write({items: [], saved: c.saved});
      route()
    }
  },
  closeDlg() {
    dlg.close()
  },
  fill() {
    $("#email").value = "demo@aquamart.com";
    $("#password").value = "Demo123!"
  },
  naddr() {
    modal(`<h3>Add address</h3>${addrForm({})}`)
  },
  eaddr(el) {
    modal(`<h3>Edit address</h3>${addrForm(addressService.mine().find(a=>a.id===el.dataset.id)||{})}`)
  },
  async daddr(el) {
    if (await confirmBox("Delete this address?")) {
      addressService.remove(el.dataset.id);
      route();
      toast("Address deleted.")
    }
  },
  defaddr(el) {
    addressService.setDefault(el.dataset.id);
    route();
    toast("Default address updated.")
  },
  pickaddr(el) {
    ck.addr = el.value;
    route()
  },
  pickm(el) {
    ck.method = el.value;
    route()
  },
  pickp(el) {
    ck.pay = el.value;
    ck.err = "";
    route()
  },
  next() {
    ck.step = Math.min(4, ck.step + 1);
    route()
  },
  back() {
    ck.step = Math.max(1, ck.step - 1);
    ck.err = "";
    route()
  },
  read(el) {
    notificationService.mark(el.dataset.id);
    route()
  },
  readall() {
    notificationService.markAll();
    route()
  },
  deln(el) {
    notificationService.del(el.dataset.id);
    route()
  },
  async cancel(el) {
    if (!await confirmBox("Cancel this order?"))
      return;
    try {
      orderService.cancel(el.dataset.id);
      toast("Order cancelled.");
      route()
    } catch (e) {
      toast(e.message, "bad")
    }
  },
  reorder(el) {
    const o = orderService.get(el.dataset.id);
    o.items.forEach(i => cartService.add(i.id, i.qty, i));
    toast("Items added to your cart.");
    go("/cart")
  },
  paid(el) {
    const o = orderService.get(el.dataset.id);
    o.paymentStatus = "Paid";
    deliveryService.step(o);
    orderService.put(o);
    notificationService.add(o.userId, "Payment successful", `Transfer for ${o.id} confirmed (demo).`);
    route()
  },
  adv(el) {
    const o = deliveryService.updateOrderStatus(el.dataset.id);
    o ? toast("Status: " + o.orderStatus) : toast("Can't advance: payment is still pending.", "bad");
    route()
  },
  advall(el) {
    const o = orderService.get(el.dataset.id);
    let n = 0;
    while (deliveryService.step(o) && n++ < 9);
    orderService.put(o);
    route();
    toast("Order status: " + o.orderStatus)
  },
  scroll() {
    $("#reg").scrollIntoView({behavior: "smooth"})
  },
  chat() {
    const c = $("#chat");
    if ($(".box", c))
      return $(".box", c).remove();
    c.insertAdjacentHTML("afterbegin", `<div class="box">
      <div style="padding:10px;background:var(--pri);color:var(--on);display:flex;justify-content:space-between"><b>Live chat (demo)</b><button class="ib" style="padding:0;color:inherit" data-act="chat" aria-label="Close chat">✕</button></div>
      <div class="cm" id="cm" aria-live="polite">
      <p>Hi! Ask about orders, returns or payment.</p></div>
      <form data-form="chat" style="display:flex;gap:6px;padding:8px"><input id="cmsg" aria-label="Message" placeholder="Type a message" autocomplete="off"><button class="btn sm">Send</button></form></div>`)
  },
  consent() {
    storage.set("consent", 1);
    $("#ck")?.remove()
  },
  rmcoupon() {
    storage.remove("coupon");
    route()
  }
};

// One click listener for the whole page. It finds the nearest [data-act] element and runs the matching action in A.
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el) {
    const a = el.dataset.act;
    if (el.tagName === "A" && a !== "logout" && a !== "scroll") {}else
      e.preventDefault();
    if (a === "qp" || a === "qm") {
      const i = +el.dataset.i,
        it = cartService.read().items[i];
      cartService.setQty(i, it.qty + (a === "qp" ? 1 : -1));
      return route()
    }
    try {
      A[a]?.(el, e)
    } catch (x) {
      console.error(x);
      toast("Something went wrong.", "bad")
    }
  }
  if (!e.target.closest(".menu"))
    $$(".dd").forEach(d => d.classList.add("hide"));
  if (!e.target.closest(".search"))
    $("#sg").classList.add("hide")
});

document.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.act && A[t.dataset.act] && t.type === "radio")
    A[t.dataset.act](t);
  if (t.dataset.qin != null) {
    cartService.setQty(+t.dataset.qin, t.value);
    route()
  }
  if (t.matches("[data-sort]")) {
    const q = new URLSearchParams(location.hash.split("?")[1] || "");
    q.set("sort", t.value);
    go("/shop?" + q)
  }
});

document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "cnum") {
    t.value = t.value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim()
  }
  if (t.id === "exp") {
    let v = t.value.replace(/\D/g, "").slice(0, 4);
    t.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v
  }
  if (t.id === "cvv")
    t.value = t.value.replace(/\D/g, "");
  if (t.matches("[data-faq]")) {
    const q = t.value.toLowerCase();
    $$("#faq details").forEach(d => d.classList.toggle("hide", !d.textContent.toLowerCase().includes(q)))
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    $$(".dd").forEach(d => d.classList.add("hide"));
    $("#sg").classList.add("hide");
    $("#nav").classList.remove("open");
    $("#scrim").classList.remove("on")
  }
});
