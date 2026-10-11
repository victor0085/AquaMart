/* =====================================================================
 * js/search.js
 * Header search box, suggestions and recent searches.
 * ===================================================================== */
"use strict";

/* search */
const q = $("#q");

let sdeb;

const recent = () => readList("recent_searches");

function suggest() {
  const v = q.value.trim(),
    sg = $("#sg");
  let h = "";
  if (!v) {
    const r = recent();
    h = r.length ? `<b>Recent searches</b>${r.map(x=>`<a href="#/shop?q=${encodeURIComponent(x)}">${esc(x)}</a>`).join("")}<a href="#" data-act="clrecent" style="color:var(--pri)">Clear recent searches</a>` : ""
  } else {
    const r = productService.search(v).slice(0, 6);
    h = r.length ? r.map(p => `<a href="#/product/${p.slug}">${esc(p.name)} <span class="mut">in ${CATS[p.category][0]}</span></a>`).join("") : `<b>No products found.</b>`
  }
  sg.innerHTML = h;
  sg.classList.toggle("hide", !h)
}

q.addEventListener("input", () => {
  clearTimeout(sdeb);
  sdeb = setTimeout(suggest, 200)
});

q.addEventListener("focus", suggest);

$("#sg").addEventListener("click", e => {
  if (e.target.closest("[data-act=clrecent]")) {
    e.preventDefault();
    storage.remove("recent_searches");
    suggest()
  } else if (e.target.closest("a"))
    $("#sg").classList.add("hide")
});

$("#sf").addEventListener("submit", e => {
  e.preventDefault();
  const v = q.value.trim();
  if (!v)
    return q.focus();
  storage.set("recent_searches", [v, ...recent().filter(x => x !== v)].slice(0, 6));
  $("#sg").classList.add("hide");
  go("/shop?q=" + encodeURIComponent(v))
});
