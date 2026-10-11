/* =====================================================================
 * js/debug.js
 * Debug helper. In the browser console type:  AQUAMART
 * to reach every service, e.g. AQUAMART.cartService.read()  or
 * AQUAMART.storage.get("orders").  Add ?debug=1 before the # in the URL
 * (e.g. /?debug=1#/cart) to log every route change.
 * ===================================================================== */
"use strict";
window.AQUAMART = { storage, CFG, PRODUCTS, productService, authService, addressService,
  cartService, wishService, notificationService, paymentService, orderService, deliveryService, V, A };
if (new URLSearchParams(location.search).has("debug")) {
  addEventListener("hashchange", () => console.log("[route]", location.hash));
  console.info("AQUAMART debug on. Inspect state with window.AQUAMART");
}
