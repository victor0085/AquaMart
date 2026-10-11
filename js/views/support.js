/* =====================================================================
 * js/views/support.js
 * Help centre, contact page and static pages (about, terms, privacy, etc.).
 * ===================================================================== */
"use strict";

V.help = () => {
  meta("Help & support");
  const F = [["How do I track my order?", "Open My Orders and choose Track order."], ["How does the demo payment work?", "Use any Luhn-valid test card, for example 4242 4242 4242 4242. No money moves."], ["Can I cancel an order?", "Yes, until it is packed. Open the order and choose Cancel order."], ["What is the return window?", "7 days from delivery for eligible items."], ["Which delivery options exist?", "Standard, Express and Same-Day (Lagos only)."]];
  return`<h1>Help Center</h1>
    <div class="lay">
    <div class="card">
    <div class="fld"><label for="fq">Search FAQ</label><input id="fq" type="search" placeholder="e.g. return, payment" data-faq></div>
    <div id="faq">${F.map(f=>`<details>
    <summary>${f[0]}</summary>
    <p class="mut">${f[1]}</p></details>`).join("")}</div></div>
    <div class="card">
    <h3>Contact support</h3>${contactInfo()}${contactForm()}<button class="btn o" style="margin-top:10px" data-act="chat">Open live chat (demo)</button></div></div>`
};

const contactForm = () => `<form data-form="contact" novalidate>${field("name","Name")}${field("email","Email","email")}${field("phone","Phone","tel")}${field("order","Order number (optional)")}${field("subject","Subject")}
  <div class="fld"><label for="message">Message</label><textarea id="message" rows="4" maxlength="1000"></textarea>
  <div class="err" data-e="message"></div></div><button class="btn">Send message</button></form>`;

V.contact = () => {
  meta("Contact us");
  return`<h1>Contact Us</h1>
    <div class="lay">
    <div class="card">${contactForm()}</div>
    <div class="card">
    <h3>Reach us directly</h3>${contactInfo()}</div></div>`
};

const PAGES = {
  about: ["About AQUAMART", "AQUAMART is a demo marketplace that shows how a modern storefront works: browsing, cart, checkout, orders and delivery tracking. Products, sellers and couriers here are fictional."],
  terms: ["Terms & Conditions", "This demo store has no real transactions. By using it you agree not to enter real card numbers or sensitive personal data. Orders are simulated and no goods are shipped."],
  privacy: ["Privacy Policy", "Demo data (account, cart, orders) is stored only in your browser's LocalStorage and is never sent to a server. Clear it any time by logging out or clearing site data. Card numbers are never stored."],
  returns: ["Returns & Refunds", "Eligible items can be returned within 7 days of delivery in original condition. Refunds go to the original payment method within 5–10 business days. Cancelled paid orders are marked Refunded."],
  shipping: ["Shipping Information", "Standard (3–5 days, free over ₦50,000, otherwise ₦2,500), Express (1–2 days, ₦5,500) and Same-Day (₦8,500, Lagos only)."],
  cookies: ["Cookie Policy", "This demo uses LocalStorage only for cart, login and preferences. No advertising or tracking cookies are set."],
  careers: ["Careers", "We're always looking for engineers, designers and logistics experts. This is a demo page; there are no open roles."],
  press: ["Press", "AQUAMART is a demo project. For press questions use the Contact Us page."]
};

V.page = k => {
  const p = PAGES[k];
  if (!p)
    return V[404]();
  meta(p[0], p[1]);
  return`<article class="card" style="max-width:760px">
    <h1>${p[0]}</h1>
    <p>${p[1]}</p><a class="btn o" href="#/contact">Contact us</a></article>`
};
