/* =====================================================================
 * js/views/product.js
 * Product detail page: gallery, options, reviews, structured data.
 * ===================================================================== */
"use strict";

V.product = (s, _, _2) => {
  const p = productService.bySlug(s);
  if (!p)
    return V[404]("This product is no longer available.");
  productService.viewed(p.id);
  meta(p.name, p.description);
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.id = "ld";
  ld.textContent = JSON.stringify({"@context": "https://schema.org", "@type": "Product", name: p.name, brand: p.brand, description: p.description, offers: {"@type": "Offer", priceCurrency: "NGN", price: p.price, availability: p.stock ? "InStock" : "OutOfStock"}, aggregateRating: {"@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews}});
  $("#ld")?.remove();
  document.head.append(ld);
  const rv = readList("reviews").filter(r => r.pid === p.id),
    u = authService.user(),
    bought = u && orderService.mine().some(o => !o.cancelled && o.items.some(i => i.id === p.id));
  return`<p class="mut"><a href="#/">Home</a> / <a href="#/shop?cat=${p.category}">${CATS[p.category][0]}</a> / ${esc(p.name)}</p>
    <div class="pd">
    <div class="gal"><img class="main" id="gm" src="${p.images[0]}" alt="${esc(p.name)}">
    <div class="th">${p.images.map((m,i)=>`<button data-act="thumb" data-src="${m}" class="${i?"":"on"}" aria-label="View image ${i+1}"><img src="${m}" alt=""></button>`).join("")}</div></div>

    <div><span class="mut">${esc(p.brand)}</span>
    <h1>${esc(p.name)}</h1>
    <div>${stars(p.rating)} ${p.rating} · ${(p.reviews+rv.length).toLocaleString()} reviews</div>
    <p><span class="pr" style="font-size:1.8rem">${money(p.price)}</span><span class="old">${money(p.oldPrice)}</span> <span class="badge b-bad">-${p.discount}%</span></p>
    <p>${stock(p)}</p>

    <div class="fld"><label>Color</label>
    <div class="opt" id="oc">${p.colors.map((c,i)=>`<button data-act="opt" data-k="color" class="${i?"":"on"}" aria-pressed="${!i}">${c}</button>`).join("")}</div></div>
${p.sizes.length?`<div class="fld"><label>Size</label>
    <div class="opt" id="os">${p.sizes.map((c,i)=>`<button data-act="opt" data-k="size" class="${i?"":"on"}" aria-pressed="${!i}">${c}</button>`).join("")}</div></div>`:""}

    <div class="fld"><label for="pq">Quantity</label>
    <div class="qty"><button data-act="pq" data-d="-1" aria-label="Decrease">−</button><input id="pq" type="number" min="1" max="${p.stock||1}" value="1"><button data-act="pq" data-d="1" aria-label="Increase">+</button></div></div>

    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="addd" data-id="${p.id}" ${p.stock<1?"disabled":""}>Add to Cart</button><button class="btn acc" data-act="buy" data-id="${p.id}" ${p.stock<1?"disabled":""}>Buy Now</button><button class="btn o" data-act="wish" data-id="${p.id}">${wishService.has(p.id)?"♥ Saved":"♡ Wishlist"}</button></div>

    <div class="card" style="margin-top:16px"><b>Delivery</b>
    <p class="mut" style="margin:4px 0">Estimated by ${formatDate(p.deliveryDate)}. Free standard delivery over ₦50,000.</p><b>Returns</b>
    <p class="mut" style="margin:4px 0">7-day returns on eligible items. <a href="#/returns" style="color:var(--pri)">Read policy</a></p><b>Seller</b>
    <p class="mut" style="margin:4px 0">${esc(p.seller)} · 96% positive (demo)</p></div></div></div>

    <section class="sec card">
    <h2>Description</h2>
    <p>${esc(p.description)}</p>
    <h3>Specifications</h3>
    <table>${Object.entries(p.specifications).map(([k,v])=>`<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table></section>

    <section class="sec card">
    <h2>Customer reviews</h2>${[{n:"Chidi O.",r:5,t:"Great quality and arrived on time."},{n:"Amina B.",r:4,t:"Good value for the price."},...rv.map(x=>({n:x.name,r:x.r,t:x.t}))].map(x=>`<div class="row" style="display:block">${stars(x.r)} <b>${esc(x.n)}</b>
    <p style="margin:4px 0">${esc(x.t)}</p></div>`).join("")}
${bought?`<form data-form="review" data-id="${p.id}" style="margin-top:12px">
    <h3>Write a review</h3>
    <div class="fld"><label for="rr">Rating</label><select id="rr"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div>
    <div class="fld"><label for="rt">Your review</label><textarea id="rt" rows="3" maxlength="500"></textarea>
    <div class="err" data-e="rt"></div></div><button class="btn">Submit review</button></form>`:`<p class="mut">Only customers who bought this product can write a review.</p>`}</section>

    <section class="sec">
    <h2>You may also like</h2>
    <div class="grid g5">${PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,5).map(card).join("")}</div></section>`
};
