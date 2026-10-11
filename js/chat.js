/* =====================================================================
 * js/chat.js
 * Demo live-chat auto replies.
 * ===================================================================== */
"use strict";

/* ---------- chat ---------- */
const chatReply = m => {
  m = m.toLowerCase();
  return/track|where|deliver/.test(m) ? "You can follow any order from My Orders → Track order." : /return|refund/.test(m) ? "Returns are accepted within 7 days of delivery." : /pay|card/.test(m) ? "This is a demo: use test card 4242 4242 4242 4242." : /cancel/.test(m) ? "Orders can be cancelled until they are packed." : "Thanks! A support agent would reply here in a real deployment (demo chat)."
};
