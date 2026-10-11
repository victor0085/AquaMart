/* =====================================================================
 * js/services/product-service.js
 * Product catalogue (RAW text table), generated SVG product art, productService (search, filter, recently viewed, recommendations).
 * ===================================================================== */
"use strict";

/* ---------- product database (productService) ---------- */
const CATS = {
  electronics: ["TVs & Audio", "📺"],
  phones: ["Phones", "📱"],
  computers: ["Computers & Networking", "💻"],
  appliances: ["Appliances", "🧊"],
  power: ["Generators & Solar", "⚡"],
  fashion: ["Fashion & Native Wear", "👗"],
  shoes: ["Shoes", "👟"],
  beauty: ["Beauty & Personal Care", "💄"],
  home: ["Home & Kitchen", "🍳"],
  groceries: ["Groceries", "🛒"],
  sports: ["Sports & Games", "⚽"],
  automotive: ["Automotive", "🚗"],
  gaming: ["Gaming", "🎮"],
  accessories: ["Accessories", "⌚"]
};

// PRODUCTS ARE GROUPED BY CATEGORY (electronics, phones, computers, appliances, power, fashion, ...). Keep each product inside its own group.
// An optional 10th field can hold a full photo URL. Otherwise photos are looked up in images/products/ (see the README there).
// PRICES are in Naira, set Oct 2026. Phones, Hisense TV, Sumec generator, rice and oil follow published Nigerian retail listings;
// the rest are estimates, so check them against your supplier before launch.
// One product per line: name | category | brand | price | discount % | rating | review count | stock | emoji.
const RAW = `Hisense 40" Full HD Smart TV|electronics|Hisense|286500|10|4.0|120|6|📺
LG 43" UHD Smart TV|electronics|LG|365000|8|4.7|383|23|📺
TCL 43" Android Smart TV|electronics|TCL|335000|10|4.6|646|40|📺
Hisense 55" 4K QLED Smart TV|electronics|Hisense|650000|12|4.5|909|57|📺
Oraimo FreePods 4 Wireless Earbuds|electronics|Oraimo|24500|25|4.4|1172|74|🎧
JBL Go 4 Bluetooth Speaker|electronics|JBL|52000|10|4.3|1435|91|🔊
Tecno Pop 9|phones|Tecno|90750|10|4.2|1698|18|📱
Samsung Galaxy A06 4GB/128GB|phones|Samsung|130000|8|4.1|1961|35|📱
Samsung Galaxy A07 4GB/64GB|phones|Samsung|134800|10|4.0|2224|52|📱
Infinix Hot 60i 4GB/128GB|phones|Infinix|135700|12|4.7|2487|69|📱
Xiaomi Redmi 14C|phones|Xiaomi|155000|8|4.6|2750|86|📱
Tecno Spark 40|phones|Tecno|165000|8|4.5|3013|13|📱
Infinix Note 60 Pro 5G|phones|Infinix|499000|6|4.4|3276|30|📱
HP 15 Laptop Core i5 8GB/512GB|computers|HP|650000|8|4.3|339|47|💻
Lenovo IdeaPad Slim 3 Ryzen 5|computers|Lenovo|720000|7|4.2|602|64|💻
Hisense 27" Full HD Monitor|computers|Hisense|135000|10|4.1|865|81|🖥️
TP-Link TL-WR840N Wi-Fi Router|computers|TP-Link|21500|20|4.0|1128|8|📶
Logitech M185 Wireless Mouse|computers|Logitech|9500|15|4.7|1391|25|🖱️
SanDisk 128GB USB Flash Drive|computers|SanDisk|11000|15|4.6|1654|42|💾
Hisense 1.5HP Copper Split Air Conditioner|appliances|Hisense|379500|8|4.5|1917|59|❄️
Hisense 2HP Copper Split Air Conditioner|appliances|Hisense|556350|10|4.4|2180|76|❄️
Hisense 160L Chest Freezer|appliances|Hisense|330000|8|4.3|2443|93|🧊
Scanfrost 7kg Washing Machine|appliances|Scanfrost|420000|8|4.2|2706|20|🧺
Scanfrost 4-Burner Gas Cooker|appliances|Scanfrost|185000|10|4.1|2969|37|🔥
Binatone 5L Air Fryer|appliances|Binatone|78000|12|4.0|3232|54|🍳
Binatone 16in Rechargeable Standing Fan|appliances|Binatone|55000|10|4.7|295|71|🌀
Binatone Blender 1.5L|appliances|Binatone|36000|12|4.6|558|88|🥤
Sumec Firman 2.9kVA Key-Start Generator|power|Sumec Firman|442500|8|4.5|821|15|⚡
Sumec Firman 6.7kVA Key-Start Generator|power|Sumec Firman|840000|10|4.4|1084|32|⚡
Sumec Firman 7.6kVA Key-Start Generator|power|Sumec Firman|950000|9|4.3|1347|49|⚡
Luminous 1.5kVA Inverter|power|Luminous|340000|8|4.2|1610|66|🔌
Luminous 200Ah Tubular Battery|power|Luminous|330000|8|4.1|1873|83|🔋
200W Monocrystalline Solar Panel|power|Jinko|95000|10|4.0|2136|10|☀️
Rechargeable LED Bulb 12W|power|Eco Lite|3800|20|4.7|2399|27|💡
Men's Senator Native Wear|fashion|Lagos Tailors|38000|15|4.6|2662|44|👔
Men's Agbada 3-Piece Set|fashion|Lagos Tailors|85000|12|4.5|2925|61|👘
Ankara Fabric 6 Yards|fashion|Adire Hub|18000|20|4.4|3188|78|🧵
Ankara Print Gown|fashion|Adire Hub|32000|12|4.3|251|95|👗
Lace Fabric 5 Yards|fashion|Adire Hub|45000|10|4.2|514|22|🧵
Aso-Oke Gele Headtie|fashion|Adire Hub|25000|15|4.1|777|39|🧣
Adire Men's Shirt|fashion|Adire Hub|15000|18|4.0|1040|56|👕
Aba-Made Leather Loafers|shoes|Aba Made|25000|20|4.7|1303|73|👞
Handmade Leather Palm Slippers|shoes|Aba Made|12000|20|4.6|1566|90|🩴
Ladies Block Heel Sandals|shoes|Aba Made|15000|15|4.5|1829|17|👡
Aba-Made Men's Leather Sandals|shoes|Aba Made|14000|15|4.4|2092|34|🥿
Men's Canvas Sneakers|shoes|Aba Made|20000|15|4.3|2355|51|👟
Ladies Flat Ballerina|shoes|Aba Made|13000|12|4.2|2618|68|🥿
Zaron Matte Lipstick|beauty|Zaron|5500|10|4.1|2881|85|💄
Zaron Liquid Foundation|beauty|Zaron|7500|10|4.0|3144|12|🧴
Pure Shea Butter 500g|beauty|Naija Naturals|6500|20|4.7|207|29|🧴
African Black Soap 500g|beauty|Naija Naturals|3500|15|4.6|470|46|🧼
Dudu-Osun Black Soap 150g|beauty|Tropical Naturals|1800|10|4.5|733|63|🧼
Nivea Body Lotion 400ml|beauty|Nivea|6800|10|4.4|996|80|🧴
Non-Stick Cookware Set 7-Piece|home|Royal Cook|38000|12|4.3|1259|7|🍲
Vitafoam Orthopaedic Mattress 6x6|home|Vitafoam|165000|8|4.2|1522|24|🛏️
Bedsheet Set 6x6 with 4 Pillowcases|home|Home Haven|18000|15|4.1|1785|41|🛏️
Binatone Electric Kettle 2L|home|Binatone|15000|12|4.0|2048|58|☕
Hand-Woven Raffia Basket|home|Naija Crafts|7500|18|4.7|2311|75|🧺
Thermos Vacuum Flask 1.8L|home|Thermos|16500|10|4.6|2574|92|🫖
Royal Stallion Rice 10kg|groceries|Royal Stallion|14500|6|4.5|2837|19|🍚
Kings Vegetable Oil 5L|groceries|Kings|23700|5|4.4|3100|36|🫒
Mamador Vegetable Oil 3.5L|groceries|Mamador|12500|5|4.3|163|53|🫒
Golden Penny Semovita 10kg|groceries|Golden Penny|13500|8|4.2|426|70|🍲
Honey Beans 5kg|groceries|Oloyin Farms|9500|5|4.1|689|87|🫘
White Garri 5kg|groceries|Ijebu Farms|4800|5|4.0|952|14|🥣
Dangote Sugar 1kg|groceries|Dangote|1900|5|4.7|1215|31|🍬
Peak Milk Powder 900g|groceries|Peak|13500|6|4.6|1478|48|🥛
Milo Chocolate Drink 900g|groceries|Nestlé|8500|6|4.5|1741|65|☕
Yoga Mat 6mm|sports|Flexfit|9500|20|4.4|2004|82|🧘
Adjustable Dumbbell Set 20kg|sports|IronPeak|48000|10|4.3|2267|0|🏋️
Handcrafted Ayo Game Board|sports|Naija Crafts|15000|20|4.2|2530|26|🎲
Training Football Size 5|sports|Sporta|9500|15|4.1|2793|43|⚽
Skipping Rope|sports|Flexfit|3500|15|4.0|3056|60|🪢
Resistance Bands Set|sports|Flexfit|9000|15|4.7|3319|77|💪
Total Quartz 5W-30 Engine Oil 4L|automotive|Total|38000|10|4.6|382|94|🛢️
Exide 12V 65Ah Car Battery|automotive|Exide|95000|8|4.5|645|21|🔋
Car Tyre 205/65R15|automotive|Dunlop|85000|8|4.4|908|38|🛞
Portable Car Jump Starter|automotive|AutoPro|45000|12|4.3|1171|55|🔋
Car Phone Holder|automotive|AutoPro|4500|20|4.2|1434|72|📱
Car Seat Cover Set|automotive|AutoPro|32000|12|4.1|1697|89|🚗
PlayStation 5 Slim Console|gaming|Sony|780000|5|4.0|1960|16|🕹️
PS5 DualSense Wireless Controller|gaming|Sony|78000|10|4.7|2223|33|🎮
Wired Gaming Headset|gaming|Redragon|24000|15|4.6|2486|50|🎧
EA Sports FC 26 PS5 Disc|gaming|EA Sports|45000|8|4.5|2749|67|💿
HDMI 2.1 Cable 2m|gaming|Ugreen|7500|15|4.4|3012|84|🔌
Oraimo Watch 4 Plus Smartwatch|accessories|Oraimo|38000|20|4.3|3275|11|⌚
Aba-Made Leather Backpack|accessories|Aba Made|28000|15|4.2|338|28|🎒
Oraimo 20,000mAh Power Bank|accessories|Oraimo|32000|20|4.1|601|45|🔋
Oraimo 65W Fast Charger|accessories|Oraimo|12500|15|4.0|864|62|🔌
Samsung 25W Fast Charger|accessories|Samsung|12000|10|4.7|1127|79|🔌
Aba-Made Leather Belt|accessories|Aba Made|9500|18|4.6|1390|6|👝`;

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CH = {
  electronics: 210,
  appliances: 175,
  power: 48,
  phones: 200,
  computers: 225,
  fashion: 25,
  shoes: 15,
  beauty: 340,
  home: 40,
  groceries: 95,
  sports: 150,
  automotive: 0,
  gaming: 265,
  accessories: 190
};

const art = (b, n, c, k) => {
  const h = CH[c],
    bg = `hsl(${h},${k===1?30:22}%,${k===2?86:92}%)`,
    fg = `hsl(${h},45%,28%)`,
    w = k === 1 ? 260 : k === 2 ? 200 : 230,
    x = 200 - w / 2,
    y = k === 2 ? 90 : 70,
    nm = (n.length > 26 ? n.slice(0, 24) + "…" : n).replace(/&/g, "&amp;");
  return"data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><ellipse cx="200" cy="352" rx="${w/2}" ry="12" fill="#0002"/><rect x="${x}" y="${y}" width="${w}" height="${k===2?250:270}" rx="8" fill="#fff" stroke="${fg}" stroke-opacity=".25"/><rect x="${x}" y="${y}" width="${w}" height="46" rx="8" fill="${fg}"/><text x="200" y="${y+30}" font-family="Arial,sans-serif" font-size="21" font-weight="700" fill="#fff" text-anchor="middle">${b.toUpperCase()}</text><text x="200" y="220" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="${fg}" text-anchor="middle">${nm}</text><text x="200" y="250" font-family="Arial,sans-serif" font-size="14" fill="${fg}" fill-opacity=".7" text-anchor="middle">${CATS[c][0].replace(/&/g,"&amp;")}</text></svg>`)
};

const SPEC = {
  electronics: ["Warranty", "12 months"],
  appliances: ["Warranty", "12 months, Nigerian plug"],
  power: ["Warranty", "12 months"],
  phones: ["Network", "4G/5G, dual SIM"],
  computers: ["Warranty", "12 months"],
  fashion: ["Material", "Breathable cotton blend"],
  shoes: ["Sole", "Cushioned rubber"],
  beauty: ["Skin type", "All skin types"],
  home: ["Power", "Nigerian standard plug"],
  groceries: ["Storage", "Cool, dry place"],
  sports: ["Use", "Indoor / outdoor"],
  automotive: ["Fit", "Universal"],
  gaming: ["Platform", "Console & PC"],
  accessories: ["Care", "Wipe clean"]
};

const SELL = ["AquaMart Official", "Lagos Tech Hub", "PrimeHouse Stores", "Ikeja Direct"];

// Photo path -> generated drawing. If a photo file is missing, js/features.js swaps in the drawing.
const IMG_FALLBACK = {};

// Turns each RAW line into a full product object (id, slug, images, colours, sizes, seller).
const PRODUCTS = RAW.split("\n").map((l, i) => {
  const[n, c, b, pr, d, r, rv, st, em, img] = l.split("|"),
    price = +pr,
    disc = +d,
    h = (i * 37) % 360,
    arts = [0, 1, 2].map(k => art(b, n, c, k)),
    photos = [img || `images/products/${slug(n)}.jpg`, `images/products/${slug(n)}-2.jpg`, `images/products/${slug(n)}-3.jpg`];
  photos.forEach((src, k) => IMG_FALLBACK[src] = arts[k]);
  return{
    id: i + 1,
    name: n,
    slug: slug(n),
    category: c,
    brand: b,
    description: `${n} from ${b}. Built for everyday use with reliable quality, honest pricing and fast delivery from a verified AQUAMART seller. Covered by our 7-day return policy.`,
    price,
    oldPrice: Math.round(price / (1 - disc / 100) / 100) * 100,
    discount: disc,
    rating: +r,
    reviews: +rv,
    stock: +st,
    images: photos,
    specifications: {Brand: b, Category: CATS[c][0], [SPEC[c][0]]: SPEC[c][1], Condition: "Brand new", "Box contents": "Product, manual, warranty card"},
    colors: ["Black", "Blue", "Silver"].slice(0, 1 + i % 3),
    sizes: c === "shoes" ? ["40", "41", "42", "43", "44"] : c === "fashion" ? ["S", "M", "L", "XL"] : [],
    tags: [c, b.toLowerCase(), ...n.toLowerCase().split(" ").slice(0, 3)],
    seller: SELL[i % 4],
    deliveryDate: new Date(Date.now() + (2 + i % 4) * 864e5).toISOString()
  }
});

// Find products: get(id), bySlug(slug), search(text), filter(options), recommended().
const productService = {
  all: () => PRODUCTS,
  get: id => PRODUCTS.find(p => p.id == id),
  bySlug: s => PRODUCTS.find(p => p.slug === s),
  search(q) {
    const t = q.toLowerCase().split(/\s+/).filter(Boolean);
    return PRODUCTS.filter(p => {
      const h = [p.name, p.brand, CATS[p.category][0], p.category, p.description, ...p.tags].join(" ").toLowerCase();
      return t.every(x => h.includes(x))
    })
  },
  filter(o) {
    let r = o.q ? this.search(o.q) : [...PRODUCTS];
    if (o.cat)
      r = r.filter(p => p.category === o.cat);
    if (o.brand)
      r = r.filter(p => p.brand === o.brand);
    if (o.min)
      r = r.filter(p => p.price >= +o.min);
    if (o.max)
      r = r.filter(p => p.price <= +o.max);
    if (o.rating)
      r = r.filter(p => p.rating >= +o.rating);
    if (o.stock)
      r = r.filter(p => p.stock > 0);
    const dm = o.deal ? 20 : +o.disc || 0;
    if (dm)
      r = r.filter(p => p.discount >= dm);
    const s = o.sort || (o.deal ? "disc" : "rel"),
      f = {
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      rated: (a, b) => b.rating - a.rating,
      new: (a, b) => b.id - a.id,
      disc: (a, b) => b.discount - a.discount,
      rel: (a, b) => b.reviews - a.reviews
    }
    [s];
    return r.sort(f)
  },
  viewed(id) {
    const v = readList("recently_viewed").filter(x => x !== id);
    v.unshift(id);
    storage.set("recently_viewed", v.slice(0, 10))
  },
  recommended() {
    const v = readList("recently_viewed").map(i => this.get(i)).filter(Boolean),
      cs = new Set(v.map(p => p.category));
    const r = PRODUCTS.filter(p => cs.has(p.category) && !v.includes(p) && p.stock);
    return(r.length > 3 ? r : [...PRODUCTS].sort((a, b) => b.rating - a.rating)).slice(0, 8)
  }
};
