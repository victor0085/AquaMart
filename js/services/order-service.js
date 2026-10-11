/* =====================================================================
 * js/services/order-service.js
 * orderService (create, cancel, list) and deliveryService (simulated courier stages).
 * ===================================================================== */
"use strict";

/* ---------- orders & delivery (simulated courier) ---------- */
// The seven order stages in order. An order keeps statusIdx, a position in this list.
const STAT = ["Order Placed", "Payment Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const LOC = ["AQUAMART Online", "AQUAMART Online", "Ikeja Fulfilment Centre", "Ikeja Fulfilment Centre", "Lagos Distribution Centre", "Local Hub – near you", "Delivered to recipient"];

// Create, read, cancel and list orders.
const orderService = {
  mine() {
    const u = authService.user();
    return u ? readList("orders").filter(o => o.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []
  },
  get: id => readList("orders").find(o => o.id === id || o.trackingNumber === id),
  put(o) {
    const all = readList("orders"),
      i = all.findIndex(x => x.id === o.id);
    i < 0 ? all.push(o) : all[i] = o;
    storage.set("orders", all)
  },
  build(userId, items, addr, method, pm, paymentStatus) {
    const L = cartService.lines(items),
      t = cartService.totals(items, method),
      n = new Date(),
      days = {
      standard: 5,
      express: 2,
      sameday: 0
    }
    [method],
      ymd = n.toISOString().slice(0, 10).replace(/-/g, "");
    const o = {
      id: `SN-${ymd}-${String(Math.floor(Math.random()*1e6)).padStart(6,"0")}`,
      userId,
      items: L.map(l => ({id: l.id, name: l.p.name, price: l.p.price, oldPrice: l.p.oldPrice, qty: l.qty, color: l.color, size: l.size, img: l.p.images[0]})),
      ...t,
      paymentMethod: pm,
      paymentStatus,
      orderStatus: STAT[0],
      statusIdx: 0,
      shippingAddress: addr,
      deliveryMethod: method,
      trackingNumber: "SN-TRK-" + String(Math.floor(Math.random() * 1e8)).padStart(8, "0"),
      courier: "AquaExpress Logistics (demo)",
      createdAt: n.toISOString(),
      estimatedDelivery: new Date(+n + days * 864e5).toISOString(),
      trackingHistory: [{status: STAT[0], at: n.toISOString(), location: LOC[0]}]
    };
    if (paymentStatus === "Paid")
      deliveryService.step(o, true);
    return o
  },
  create(user, items, addr, method, pm, pay) {
    const o = this.build(user.id, items, addr, method, pm, pay.status);
    this.put(o);
    notificationService.add(user.id, "Order confirmed", `Order ${o.id} was placed.`);
    if (pay.status === "Paid")
      notificationService.add(user.id, "Payment successful", `We received ${money(o.total)} (demo payment).`);
    return o
  },
  cancel(id) {
    const o = this.get(id);
    if (!o || o.statusIdx > 2)
      throw Error("This order can no longer be cancelled.");
    o.orderStatus = "Cancelled";
    o.cancelled = true;
    if (o.paymentStatus === "Paid")
      o.paymentStatus = "Refunded";
    o.trackingHistory.push({status: "Cancelled", at: new Date().toISOString(), location: "AQUAMART Online"});
    this.put(o);
    notificationService.add(o.userId, "Order cancelled", `Order ${o.id} was cancelled.`);
    return o
  }
};

// Fake courier. step() moves an order to the next stage and records the tracking history.
const deliveryService = {
  step(o, quiet) {
    if (o.cancelled || o.statusIdx >= 6)
      return false;
    let n = o.statusIdx + 1;
    if (n === 1 && o.paymentStatus !== "Paid") {
      if (o.paymentMethod.startsWith("Bank"))
        return false;
      n = 2
    }
    o.statusIdx = n;
    o.orderStatus = STAT[n];
    o.trackingHistory.push({status: STAT[n], at: new Date().toISOString(), location: LOC[n]});
    if (n === 6 && o.paymentStatus === "Pending")
      o.paymentStatus = "Paid";
    if (!quiet && [4, 5, 6].includes(n))
      notificationService.add(o.userId, n === 4 ? "Order shipped" : n === 5 ? "Out for delivery" : "Order delivered", `${o.id}: ${STAT[n]}.`, "delivery");
    return true
  },
  updateOrderStatus(id) {
    const o = orderService.get(id);
    if (!o)
      return null;
    const ok = this.step(o);
    orderService.put(o);
    return ok ? o : null
  },
  getTrackingStatus: id => orderService.get(id)?.orderStatus,
  getTrackingHistory: id => orderService.get(id)?.trackingHistory || []
};
