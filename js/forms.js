/* =====================================================================
 * js/forms.js
 * One submit listener for all forms. Forms use data-form="name" (login, signup, pay, contact, ...).
 * ===================================================================== */
"use strict";

/* forms */
// One submit listener for every form. The form name in data-form="..." picks which branch runs.
document.addEventListener("submit", async e => {
  const f = e.target,
    k = f.dataset.form;
  if (!k)
    return;
  e.preventDefault();
  const d = readForm(f),
    btn = f.querySelector("button:not([type=button])"),
    busy = b => {
    if (btn)
      btn.disabled = b
  };
  try {
    if (k === "login") {
      const m = {};
      if (!emailOk(d.email))
        m.email = "Enter a valid email address.";
      if (!d.password)
        m.password = "Enter your password.";
      if (!setErr(f, m))
        return;
      busy(1);
      try {
        await authService.login(d.email, d.password, $("#rem").checked);
        refresh();
        toast("Welcome back!");
        go(f.dataset.next || "/account")
      } catch (x) {
        setErr(f, {form: x.message});
        busy(0)
      }
    } else if (k === "signup") {
      const m = {};
      ["firstName", "lastName"].forEach(n => {
        if (!d[n].trim())
          m[n] = "Required."
      });
      if (!emailOk(d.email))
        m.email = "Enter a valid email address.";
      if (!/^[+\d][\d\s-]{6,}$/.test(d.phone))
        m.phone = "Enter a valid phone number.";
      if (pwProblem(d.password, d))
        m.password = pwProblem(d.password, d);
      if (d.confirm !== d.password)
        m.confirm = "Passwords do not match.";
      if (!$("#terms").checked)
        m.terms = "Please accept the terms.";
      if (!setErr(f, m))
        return;
      busy(1);
      try {
        await authService.signup(d);
        refresh();
        toast("Account created.");
        go("/account")
      } catch (x) {
        setErr(f, {form: x.message});
        busy(0)
      }
    } else if (k === "forgot") {
      if (!setErr(f, emailOk(d.email) ? {} : {email: "Enter a valid email address."}))
        return;
      await fakeNetworkDelay(0, 500);
      toast("If an account exists, a reset link was sent (demo: no email sent).")
    } else if (k === "addr") {
      const m = {};
      ["fullName", "phone", "country", "state", "city", "street", "postal"].forEach(n => {
        if (!(d[n] || "").trim())
          m[n] = "Required."
      });
      if (!setErr(f, m))
        return;
      const u = authService.user();
      addressService.save({...d, id: f.dataset.id || undefined, userId: u.id, isDefault: $("#isDefault").checked});
      dlg.close();
      toast("Address saved.");
      route()
    } else if (k === "profile") {
      const m = {};
      if (!d.firstName.trim())
        m.firstName = "Required.";
      if (!d.lastName.trim())
        m.lastName = "Required.";
      if (!setErr(f, m))
        return;
      await authService.update({firstName: d.firstName.trim(), lastName: d.lastName.trim(), phone: d.phone});
      refresh();
      toast("Profile updated.")
    } else if (k === "pw") {
      const m = {};
      if (!d.cur)
        m.cur = "Required.";
      if (pwProblem(d.nw))
        m.nw = pwProblem(d.nw);
      if (d.cf !== d.nw)
        m.cf = "Passwords do not match.";
      if (!setErr(f, m))
        return;
      try {
        await authService.changePw(d.cur, d.nw);
        f.reset();
        toast("Password updated.")
      } catch (x) {
        setErr(f, {cur: x.message})
      }
    } else if (k === "contact") {
      const m = {};
      if (!d.name.trim())
        m.name = "Required.";
      if (!emailOk(d.email))
        m.email = "Enter a valid email address.";
      if (!d.subject.trim())
        m.subject = "Required.";
      if (!(d.message || "").trim())
        m.message = "Please write a message.";
      if (!setErr(f, m))
        return;
      busy(1);
      await fakeNetworkDelay(0, 600);
      storage.set("messages", [...readList("messages"), {...d, at: Date.now()}]);
      f.reset();
      busy(0);
      toast("Message sent. We'll reply by email (demo).")
    } else if (k === "seller") {
      const m = {};
      if (!d.store.trim())
        m.store = "Required.";
      if (!emailOk(d.email))
        m.email = "Enter a valid email address.";
      if (!setErr(f, m))
        return;
      storage.set("seller", d);
      toast("Seller registration complete.");
      go("/seller/dashboard")
    } else if (k === "coupon") {
      const c = (d.cpn || "").trim().toUpperCase();
      if (!COUPONS[c])
        return toast("That promo code isn't valid.", "bad");
      storage.set("coupon", c);
      toast("Promo code applied.");
      route()
    } else if (k === "news") {
      if (!emailOk(d.nem || ""))
        return toast("Enter a valid email address.", "bad");
      storage.set("newsletter", [...readList("newsletter"), d.nem]);
      f.reset();
      toast("Subscribed. Thanks!")
    } else if (k === "trackq") {
      const o = orderService.get(d.tn.trim());
      if (!o)
        return setErr(f, {tn: "No order found with that number."});
      go("/track/" + o.id)
    } else if (k === "review") {
      const t = $("#rt").value.trim();
      if (!t)
        return setErr(f, {rt: "Please write a review."});
      const u = authService.user();
      storage.set("reviews", [...readList("reviews"), {pid: +f.dataset.id, name: u.firstName, r: +$("#rr").value, t}]);
      toast("Thanks for your review!");
      route()
    } else if (k === "chat") {
      const i = $("#cmsg"),
        v = i.value.trim();
      if (!v)
        return;
      const cm = $("#cm");
      cm.insertAdjacentHTML("beforeend", `<p class="me">${esc(v)}</p>`);
      i.value = "";
      setTimeout(() => {
        cm.insertAdjacentHTML("beforeend", `<p>${esc(chatReply(v))}</p>`);
        cm.scrollTop = 1e5
      }, 600)
    } else if (k === "pay") {
      if (ck.busy)
        return;
      const m = {};
      if (ck.pay === "card") {
        if (!d.cn.trim())
          m.cn = "Enter the name on the card.";
        if (!passesLuhnCheck(d.cnum))
          m.cnum = "Enter a valid card number.";
        const x = /^(\d\d)\/(\d\d)$/.exec(d.exp);
        if (!x || +x[1] < 1 || +x[1] > 12 || new Date(2e3 + +x[2], +x[1], 0, 23, 59) < new Date())
          m.exp = "Enter a valid, future expiry date.";
        if (!/^\d{3,4}$/.test(d.cvv))
          m.cvv = "Enter a 3 or 4 digit CVV."
      }
      if (!setErr(f, m))
        return;
      const u = need();
      if (!u)
        return;
      const c = cartService.read(),
        addr = addressService.mine().find(a => a.id === ck.addr),
        t = cartService.totals(c.items, ck.method),
        pm = {
        card: "Card (demo)",
        bank: "Bank Transfer (demo)",
        cod: "Cash on Delivery",
        demo: "Demo payment"
      }
      [ck.pay];
      if (cartService.lines(c.items).some(l => l.qty > l.p.stock)) {
        return toast("An item in your cart is no longer available.", "bad")
      }
      ck.busy = true;
      ck.err = "";
      const hold = f.cloneNode(true);
      $("#paybtn").disabled = true;
      $("#paybtn").innerHTML = '<span class="spin"></span> Processing…';
      try {
        const pay = await paymentService.processPayment({method: ck.pay === "demo" ? "demo" : ck.pay, amount: t.total, card: {number: d.cnum || ""}});
        const o = orderService.create(u, c.items, addr, ck.method, pm, pay);
        storage.remove("coupon");
        cartService.write({items: [], saved: c.saved});
        ck = {
          step: 1,
          addr: ck.addr,
          method: "standard",
          pay: "card",
          err: "",
          busy: false
        };
        go("/order/" + o.id + "?new=1")
      } catch (x) {
        ck.busy = false;
        ck.err = x.message;
        notificationService.add(u.id, "Payment failed", "Your payment didn't go through. No order was created.", "order");
        route()
      }
    }
  } catch (x) {
    console.error(x);
    toast("Something went wrong. Please try again.", "bad");
    busy(0)
  }
});
