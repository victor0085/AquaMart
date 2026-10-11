/* =====================================================================
 * js/views/shop.js
 * Shop / search results page with filters and sorting.
 * ===================================================================== */
"use strict";

V.shop = q => {
  const r = productService.filter(q),
    brands = [...new Set(PRODUCTS.map(p => p.brand))].sort(),
    title = q.q ? `Results for “${esc(q.q)}”` : q.deal ? "Deals" : q.cat && CATS[q.cat] ? CATS[q.cat][0] : "All products";
  meta(q.q ? "Search: " + q.q : title);
  const sel = (n, o, l) => `<label for="f_${n}">${l}</label><select id="f_${n}" name="${n}">${o.map(([v,t])=>`<option value="${v}" ${(q[n]||"")==v?"selected":""}>${t}</option>`).join("")}</select>`;
  return`<div class="sh">
    <div>
    <h1 style="margin:0">${title}</h1>
    <p class="mut" role="status">${r.length} product${r.length===1?"":"s"} found${q.q?` · <a href="#/shop" style="color:var(--pri)">Clear search</a>`:""}</p></div></div>

    <div class="shop">
    <form class="card filters" id="ff" aria-label="Filters">
    <h3>Filters</h3><input type="hidden" name="q" value="${esc(q.q||"")}"><input type="hidden" name="deal" value="${q.deal||""}">${sel("cat",[["","All categories"],...Object.entries(CATS).map(([k,v])=>[k,v[0]])],"Category")}${sel("brand",[["","All brands"],...brands.map(b=>[b,b])],"Brand")}<label>Price (₦)</label>
    <div class="two" style="gap:6px"><input name="min" type="number" min="0" placeholder="Min" value="${esc(q.min||"")}" aria-label="Minimum price"><input name="max" type="number" min="0" placeholder="Max" value="${esc(q.max||"")}" aria-label="Maximum price"></div>${sel("rating",[["","Any rating"],["4","4★ & up"],["4.5","4.5★ & up"]],"Rating")}${sel("disc",[["","Any discount"],["10","10%+"],["20","20%+"],["30","30%+"]],"Discount")}<label><input type="checkbox" name="stock" value="1" ${q.stock?"checked":""}> In stock only</label>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="btn" style="flex:1">Apply filters</button><a class="btn o" href="#/shop">Clear</a></div></form>

    <div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px"><label class="mut" for="so" style="margin-right:8px;align-self:center">Sort by</label><select id="so" style="width:auto" data-sort>${[["rel","Relevance"],["low","Price: low to high"],["high","Price: high to low"],["rated","Highest rated"],["new","Newest"],["disc","Biggest discount"]].map(([v,t])=>`<option value="${v}" ${(q.sort||(q.deal?"disc":"rel"))===v?"selected":""}>${t}</option>`).join("")}</select></div>
${r.length?`<div class="grid">${r.map(card).join("")}</div>`:empty("🔍","No products found.","Try a different word or clear your filters.","Clear filters","#/shop")}</div></div>`
};
