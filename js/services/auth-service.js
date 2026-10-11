/* =====================================================================
 * js/services/auth-service.js
 * DEMO auth: signup, login, sessions in LocalStorage. Replace with a real backend.
 * ===================================================================== */
"use strict";

/* ---------- auth (DEMO ONLY: replace with secure backend sessions) ---------- */
// Legacy hash (accounts created before per-user salts). New accounts use PBKDF2 below.
const legacyHash = async s => {
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("aquamart-demo-salt:" + s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")
  } catch {
    return "x" + btoa(unescape(encodeURIComponent(s)))
  }
};

// Random per-user salt, so two users with the same password get different stored hashes.
const newSalt = () => [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, "0")).join("");

// PBKDF2-SHA256 with 150,000 rounds, which is deliberately slow to make guessing passwords expensive.
const hashPw = async (s, salt) => {
  if (!salt)
    return legacyHash(s);
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(s), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 150000, hash: "SHA-256"}, key, 256);
    return "p:" + [...new Uint8Array(bits)].map(x => x.toString(16).padStart(2, "0")).join("")
  } catch {
    return "x" + btoa(unescape(encodeURIComponent(salt + s)))
  }
};

// DEMO ONLY. Users and password hashes live in LocalStorage. Replace with a real backend before launch.
const authService = {
  user: () => storage.get("user"),
  users: () => readList("users"),
  async seed() {
    if (this.users().some(u => u.email === "demo@aquamart.com"))
      return;
    const u = {
      id: "u_demo",
      firstName: "Demo",
      lastName: "Shopper",
      email: "demo@aquamart.com",
      phone: "08012345678",
      salt: "demo-salt-0001",
      pw: await hashPw("Demo123!", "demo-salt-0001"),
      createdAt: new Date(Date.now() - 30 * 864e5).toISOString()
    };
    storage.set("users", [...this.users(), u]);
    const a = addressService.save({userId: u.id, fullName: "Demo Shopper", phone: "08012345678", country: "Nigeria", state: "Lagos", city: "Ikeja", street: "12 Allen Avenue", apt: "Flat 3", postal: "100271", isDefault: true});
    [[13, 5], [28, 6]].forEach(([pid, idx], k) => {
      const o = orderService.build(u.id, [{id: pid, qty: 1, color: "Black", size: ""}], a, "standard", "Card (demo)", "Paid");
      o.createdAt = new Date(Date.now() - (5 + k * 4) * 864e5).toISOString();
      while (o.statusIdx < idx)
        deliveryService.step(o, true);
      orderService.put(o)
    })
  },
  async signup(d) {
    await fakeNetworkDelay();
    const e = d.email.trim().toLowerCase();
    if (this.users().some(u => u.email === e))
      throw Error("An account with this email already exists.");
    const salt = newSalt();
    const u = {
      id: makeId("u_"),
      firstName: d.firstName,
      lastName: d.lastName,
      email: e,
      phone: d.phone,
      salt,
      pw: await hashPw(d.password, salt),
      createdAt: new Date().toISOString()
    };
    storage.set("users", [...this.users(), u]);
    notificationService.add(u.id, "Welcome to AQUAMART", "Your account is ready. Happy shopping!", "promo");
    return this.session(u, true)
  },
  // Login with a lockout: 5 wrong passwords for one email blocks that email for 5 minutes.
  async login(email, pw, rem) {
    await fakeNetworkDelay();
    const key = email.trim().toLowerCase(),
      tries = storage.get("attempts") || {},
      t = tries[key] || {n: 0, until: 0};
    if (t.until > Date.now())
      throw Error(`Too many attempts. Try again in ${Math.ceil((t.until - Date.now()) / 60000)} minute(s).`);
    const u = this.users().find(x => x.email === key);
    if (!u || u.pw !== await hashPw(pw, u.salt)) {
      t.n++;
      if (t.n >= 5) {
        t.n = 0;
        t.until = Date.now() + 5 * 60000
      }
      tries[key] = t;
      storage.set("attempts", tries);
      throw Error("Incorrect email or password.")
    }
    delete tries[key];
    storage.set("attempts", tries);
    return this.session(u, rem)
  },
  session(u, rem) {
    const{pw, salt, ...s} = u;
    s.remember = !!rem;
    storage.set("user", s);
    try {
      sessionStorage.setItem("sn_s", "1")
    } catch {}return s
  },
  logout() {
    storage.remove("user")
  },
  async update(p) {
    const s = this.user(),
      us = this.users().map(u => u.id === s.id ? {...u, ...p} : u);
    storage.set("users", us);
    const {pw: _p, salt: _s, ...safe} = p;
    storage.set("user", {...s, ...safe});
    return fakeNetworkDelay(true, 200)
  },
  async changePw(cur, nw) {
    const s = this.user(),
      u = this.users().find(x => x.id === s.id);
    if (u.pw !== await hashPw(cur, u.salt))
      throw Error("Current password is incorrect.");
    const salt = newSalt();
    await this.update({salt, pw: await hashPw(nw, salt)})
  }
};

// Password rules for new passwords. Returns "" when acceptable, otherwise the message to show.
// Needs: 8+ characters, upper and lower case, a number AND a special character, and it must not
// contain a common password, the person's name, or the start of their email.
const COMMON_PW = ["password", "12345678", "123456789", "qwerty", "admin123", "letmein", "welcome1", "iloveyou", "aquamart"];
const pwProblem = (p, who = {}) => {
  if (p.length < 8)
    return "Use at least 8 characters.";
  if (!/[a-z]/.test(p) || !/[A-Z]/.test(p))
    return "Mix upper and lower case letters.";
  if (!/\d/.test(p))
    return "Add at least one number.";
  if (!/[^A-Za-z0-9\s]/.test(p))
    return "Add a special character such as ! @ # $ % & *";
  const low = p.toLowerCase();
  if (COMMON_PW.some(w => low.includes(w)))
    return "That password is too common. Choose another.";
  const parts = [who.firstName, who.lastName, (who.email || "").split("@")[0]].map(x => (x || "").trim().toLowerCase()).filter(x => x.length >= 3);
  if (parts.some(x => low.includes(x)))
    return "Do not put your name or email inside your password.";
  return ""
};
const pwOk = p => !pwProblem(p);
