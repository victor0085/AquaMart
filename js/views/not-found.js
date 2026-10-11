/* =====================================================================
 * js/views/not-found.js
 * 404 view.
 * ===================================================================== */
"use strict";

V[404] = m => {
  meta("Page not found");
  return empty("🧭", "404 – Page not found", esc(m || "The page you're looking for doesn't exist."), "Back to home", "#/")
};
