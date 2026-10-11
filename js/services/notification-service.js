/* =====================================================================
 * js/services/notification-service.js
 * In-app notifications (order updates, welcome message, promos).
 * Each one: { id, userId, title, body, type, read, at }.
 * ===================================================================== */
"use strict";

const notificationService = {
  // Saves the full list, then redraws the header bell.
  _save(list) {
    storage.set("notifications", list);
    refresh();
  },

  // Notifications of the logged-in user, newest first.
  mine() {
    const user = authService.user();
    if (!user) return [];
    return readList("notifications")
      .filter(note => note.userId === user.id)
      .sort((a, b) => b.at.localeCompare(a.at));
  },

  unread() {
    return this.mine().filter(note => !note.read).length;
  },

  add(userId, title, body, type = "order") {
    const note = { id: makeId("n_"), userId, title, body, type, read: false, at: new Date().toISOString() };
    this._save([note, ...readList("notifications")]);
  },

  mark(id) {
    this._save(readList("notifications").map(note => (note.id === id ? { ...note, read: true } : note)));
  },

  markAll() {
    const user = authService.user();
    this._save(readList("notifications").map(note => (note.userId === user.id ? { ...note, read: true } : note)));
  },

  del(id) {
    this._save(readList("notifications").filter(note => note.id !== id));
  }
};
