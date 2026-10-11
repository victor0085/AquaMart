/* =====================================================================
 * js/views/orders.js
 * Orders list, order details, delivery tracking page.
 * ===================================================================== */
"use strict";

const orderRow = o => `<div class="card" style="margin-bottom:12px">
  <div class="sh">
  <div><b>${o.id}</b>
  <div class="mut">${formatDate(o.createdAt)} · ${o.items.length} item(s)</div></div>
  <div>${badge(o.orderStatus.replace(/ .*/,m=>m))} ${badge(o.paymentStatus)}</div></div>
  <div style="display:flex;gap:6px;margin:10px 0;overflow:auto">${o.items.map(i=>`<img src="${i.img}" alt="${esc(i.name)}" width="56" height="56" style="border-radius:8px">`).join("")}</div>
  <p class="mut" style="margin:0">Total <b style="color:var(--ink)">${money(o.total)}</b> · ${o.orderStatus==="Delivered"?"Delivered":"Estimated delivery "+formatDate(o.estimatedDelivery)}</p>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><a class="btn sm" href="#/track/${o.id}">Track order</a><a class="btn sm o" href="#/order/${o.id}">View details</a><button class="btn sm o" data-act="reorder" data-id="${o.id}">Reorder</button>${!o.cancelled&&o.statusIdx<=2?`<button class="btn sm bad" data-act="cancel" data-id="${o.id}">Cancel order</button>`:""}</div></div>`;

V.orders = () => {
  if (!need())
    return"";
  meta("My orders");
  const o = orderService.mine();
  return`<h1>My orders</h1>${o.length?o.map(orderRow).join(""):empty("📦","You haven't placed any orders yet.","Your orders and tracking will appear here.","Start Shopping","#/shop")}`
};

V.order = (id, q) => {
  if (!need())
    return"";
  const o = orderService.get(id);
  if (!o)
    return V[404]("We couldn't find that order.");
  meta("Order " + o.id);
  const a = o.shippingAddress;
  return`${q.new?`<div class="card" style="border-color:var(--ok);text-align:center">
    <div class="e" style="font-size:44px">🎉</div>
    <h1>Order placed successfully!</h1>
    <p class="mut">${o.paymentStatus==="Paid"?"Your demo payment was received.":"Your order is awaiting payment."} We've added a notification to your account.</p></div><br>`:`<h1>Order details</h1>`}

    <div class="lay">
    <div class="card">
    <p><b>${o.id}</b> ${badge(o.orderStatus)} ${badge(o.paymentStatus)}</p>${o.items.map(i=>`<div class="row"><img src="${i.img}" alt="${esc(i.name)}">
    <div><b>${esc(i.name)}</b>
    <div class="mut">Qty ${i.qty} ${[i.color,i.size].filter(Boolean).join(" · ")}</div></div><b>${money(i.price*i.qty)}</b></div>`).join("")}
    <p><b>Delivery address</b><br>${esc(a.fullName)}, ${esc(a.street)}, ${esc(a.city)}, ${esc(a.state)}<br>${esc(a.phone)}</p>
    <p><b>Estimated delivery:</b> ${formatDate(o.estimatedDelivery)} · ${esc(o.deliveryMethod)}<br><b>Payment:</b> ${esc(o.paymentMethod)}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="#/track/${o.id}">Track Order</a><a class="btn o" href="#/shop">Continue Shopping</a>${o.paymentStatus==="Pending"&&o.paymentMethod.startsWith("Bank")?`<button class="btn acc" data-act="paid" data-id="${o.id}">Simulate transfer received</button>`:""}${!o.cancelled&&o.statusIdx<=2?`<button class="btn bad" data-act="cancel" data-id="${o.id}">Cancel order</button>`:""}</div></div>${sumBox(o)}</div>`
};

V.track = id => {
  if (!need())
    return"";
  meta("Track delivery");
  if (!id)
    return`<h1>Track your delivery</h1>
      <form class="card" data-form="trackq" style="max-width:480px">${field("tn","Tracking or order number","text","","placeholder='SN-TRK-84930217'")}<button class="btn">Track</button></form>${orderService.mine().length?`<h2 style="margin-top:20px">Your orders</h2>${orderService.mine().map(o=>`<p><a class="btn sm o" href="#/track/${o.id}">${o.id}</a> ${badge(o.orderStatus)}</p>`).join("")}`:""}`;
  const o = orderService.get(id);
  if (!o)
    return V[404]("We couldn't find an order with that number.");
  const i = o.statusIdx,
    pr = o.cancelled ? 0 : [0, 6, 16, 33, 55, 82, 100][i],
    h = o.trackingHistory,
    last = h[h.length - 1],
    nodes = ["Warehouse", "Distribution Center", "Local Hub", "Customer"],
    np = [0, 33, 66, 100];
  return`<h1>Delivery tracking</h1>
    <div class="demo">Simulated tracking for demo purposes. No real courier is connected.</div>
    <div class="lay">
    <div>
    <div class="card">
    <div class="sh">
    <div><span class="mut">Tracking number</span>
    <h2 style="margin:0">${o.trackingNumber}</h2></div>${badge(o.orderStatus)}</div>
    <div class="map" aria-label="Delivery route">
    <div class="ln">
    <div class="fl" style="width:${pr}%"></div></div>${nodes.map((n,k)=>`<div class="nd ${pr>=np[k]&&!o.cancelled?"on":""}" style="left:${np[k]}%"><i>${k+1}</i>${n}</div>`).join("")}<span class="truck" style="left:${pr}%" aria-hidden="true"></span></div>

    <ul class="tl">${STAT.map((s,k)=>`<li class="${k<i||(k===i&&i===6)?"ok":k===i?"cur":""}"><span class="d">${k<i||(k===i&&i===6)?"✓":k===i?"●":"○"}</span><span>${s}</span></li>`).join("")}</ul></div>

    <div class="card" style="margin-top:14px">
    <h3>Update history</h3>${[...h].reverse().map(x=>`<p style="margin:0 0 8px"><b>${esc(x.status)}</b><br><span class="mut">${formatDateTime(x.at)} · ${esc(x.location)}</span></p>`).join("")}</div></div>

    <div>
    <div class="card sum">
    <h3>Shipment</h3>
    <div><span>Current status</span><b>${o.orderStatus}</b></div>
    <div><span>Location</span><span>${esc(last.location)}</span></div>
    <div><span>Estimated delivery</span><span>${formatDate(o.estimatedDelivery)}</span></div>
    <div><span>Last update</span><span>${formatDateTime(last.at)}</span></div>
    <div><span>Courier</span><span>${esc(o.courier)}</span></div>
    <div><span>Order</span><a href="#/order/${o.id}" style="color:var(--pri)">${o.id}</a></div></div>
${o.cancelled||i>=6?"":`<div class="card" style="margin-top:14px">
    <h3>Demo delivery engine</h3>
    <p class="mut">Move this order through the delivery stages.</p><button class="btn" data-act="adv" data-id="${o.id}">Advance to next step</button> <button class="btn o" data-act="advall" data-id="${o.id}">Skip to delivered</button></div>`}</div></div>`
};
