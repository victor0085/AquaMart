/* =====================================================================
 * js/main.js
 * Entry point. Loads last: seeds the demo user, builds chrome, starts the router.
 * ===================================================================== */
"use strict";

/* boot */
window.addEventListener("error", () => toast("Unexpected error. Please retry.", "bad"));

// Start-up order: seed the demo user, drop sessions without "remember me", build the page chrome, draw counters, start the router.
(async() => {
  try {
    await authService.seed();
    const u = authService.user();
    if (u && !u.remember && !sessionStorage.getItem("sn_s"))
      authService.logout()
  } catch (e) {
    console.error(e)
  }
  chrome();
  refresh();
  route()
})();
