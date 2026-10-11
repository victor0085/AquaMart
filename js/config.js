/* =====================================================================
 * js/config.js
 * Store settings. EDIT CFG with your real phone, WhatsApp, email, hours, address. COUPONS holds promo codes.
 * ===================================================================== */
"use strict";

const CFG = {
  phone: "+234 800 000 0000",
  tel: "+2348000000000",
  wa: "2348000000000",
  email: "support@yourstore.com",
  hours: "Mon–Sat, 8am–7pm WAT",
  address: "Lagos, Nigeria"
}; // EDIT: your real contact details
const COUPONS = {
  AQUA10: n => Math.round(n * .1),
  WELCOME2000: () => 2000
};
