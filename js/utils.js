/* =====================================================================
 * js/utils.js
 * Small helpers used everywhere. Nothing in this file knows about products,
 * carts or users. It only handles the DOM, text, numbers and saving data.
 * ===================================================================== */
"use strict";

/* ---------- 1. Finding elements ---------- */
// $("#cart") returns one element. $$(".card") returns an array of elements.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ---------- 2. Safe text ---------- */
const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

// Turns special characters into harmless text, so a user cannot inject a <script>.
// Rule: wrap any text you did not write yourself in esc() before putting it in HTML.
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => HTML_ESCAPES[char]);

/* ---------- 3. Formatting ---------- */
// money(245000) -> "₦245,000"
const money = amount => "₦" + Math.round(amount).toLocaleString("en-NG");

// formatDate("2026-10-11") -> "11 Oct 2026"
const formatDate = value =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// formatDateTime("2026-10-11T14:30") -> "11 Oct, 14:30"
const formatDateTime = value =>
  new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/* ---------- 4. Saving data in the browser ---------- */
const STORAGE_PREFIX = "aquamart_";

// A thin wrapper around localStorage. Every key gets the prefix, values are saved as JSON,
// and a storage error (private mode, full disk) never crashes the app.
const storage = {
  get(key, fallback = null) {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + key);
      return saved === null ? fallback : JSON.parse(saved);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore: the app keeps working without saving */
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      /* ignore */
    }
  },

  // Removes only AQUAMART keys, not other sites' data.
  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch {
      /* ignore */
    }
  }
};

// Reads a saved list and guarantees an array comes back, even if the data is damaged.
const readList = key => {
  const value = storage.get(key, []);
  return Array.isArray(value) ? value : [];
};

/* ---------- 5. Other helpers ---------- */
// Pretends to be a network request: waits, then gives back `value`.
// Replace calls to this with real fetch() calls when you add a backend.
const fakeNetworkDelay = (value, milliseconds = 350) =>
  new Promise(resolve => setTimeout(() => resolve(value), milliseconds));

// makeId("u_") -> "u_k3j9x0ab". Used for user, order and address ids.
const makeId = prefix => prefix + Math.random().toString(36).slice(2, 10);
