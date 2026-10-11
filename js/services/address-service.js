/* =====================================================================
 * js/services/address-service.js
 * Saved delivery addresses. Each one belongs to a user (userId) and one
 * address per user is marked isDefault.
 * ===================================================================== */
"use strict";

const addressService = {
  // Addresses of the logged-in user.
  mine() {
    const user = authService.user();
    return user ? readList("addresses").filter(address => address.userId === user.id) : [];
  },

  // Creates or updates an address and returns it.
  save(address) {
    let all = readList("addresses");
    if (!address.id) address.id = makeId("a_");

    // Rule 1: marking this one as default un-marks the user's other addresses.
    if (address.isDefault) {
      all = all.map(other => (other.userId === address.userId ? { ...other, isDefault: false } : other));
    }

    // Rule 2: a user's very first address is always the default.
    const hasOtherAddress = all.some(other => other.userId === address.userId && other.id !== address.id);
    if (!hasOtherAddress) address.isDefault = true;

    // Update in place if it exists, otherwise add it.
    const position = all.findIndex(other => other.id === address.id);
    if (position < 0) all.push(address);
    else all[position] = address;

    storage.set("addresses", all);
    return address;
  },

  remove(id) {
    const user = authService.user();
    const all = readList("addresses").filter(address => address.id !== id);

    // If the default was deleted, promote the user's first remaining address.
    const mine = all.filter(address => address.userId === user.id);
    if (mine.length && !mine.some(address => address.isDefault)) mine[0].isDefault = true;

    storage.set("addresses", all);
  },

  setDefault(id) {
    const user = authService.user();
    storage.set(
      "addresses",
      readList("addresses").map(address => (address.userId === user.id ? { ...address, isDefault: address.id === id } : address))
    );
  }
};
