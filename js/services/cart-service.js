/* =====================================================================
 * js/services/cart-service.js
 * The shopping cart and the wishlist.
 *
 * The cart is saved in the browser under the key "cart" and looks like this:
 *
 *   {
 *     items: [ { id: 4, qty: 2, color: "Black", size: "" } ],   <- what the customer will buy
 *     saved: [ ]                                               <- "saved for later"
 *   }
 * ===================================================================== */
"use strict";


/* ---------- Business rules (change prices and rates here) ---------- */

const VAT_RATE = 0.075;            // 7.5% VAT
const FREE_DELIVERY_FROM = 50000;  // standard delivery is free from this amount
const DELIVERY_FEES = {
  standard: 2500,
  express: 5500,
  sameday: 8500
};


const cartService = {

  /* ---------- Reading and saving the cart ---------- */

  // Get the saved cart from the browser.
  read() {
    const saved = storage.get("cart");

    // A new visitor has no cart yet, so give back an empty one.
    if (saved === null || Array.isArray(saved.items) === false) {
      return { items: [], saved: [] };
    }

    let savedForLater = [];
    if (Array.isArray(saved.saved)) {
      savedForLater = saved.saved;
    }

    return { items: saved.items, saved: savedForLater };
  },


  // Save the cart, then redraw the cart number in the header.
  write(cart) {
    storage.set("cart", cart);
    refresh();
  },


  /* ---------- Changing the cart ---------- */

  // Add a product to the cart. Returns true if it worked, false if it did not.
  add(productId, quantity = 1, options = {}) {
    const product = productService.get(productId);

    // Step 1: stop if the product does not exist or is sold out.
    if (!product || product.stock < 1) {
      toast("This product is unavailable.", "bad");
      return false;
    }

    // Step 2: work out the colour and size.
    // Use the one the customer picked, otherwise the first one the product has.
    const cart = this.read();

    let color = product.colors[0];
    if (options.color) {
      color = options.color;
    }

    let size = "";
    if (product.sizes[0]) {
      size = product.sizes[0];
    }
    if (options.size) {
      size = options.size;
    }

    // Step 3: check if this same product (same colour and size) is already in the cart.
    let existingItem = null;
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      if (item.id === productId && item.color === color && item.size === size) {
        existingItem = item;
      }
    }

    // Step 4: if it is there, raise the quantity. If not, add a new line.
    // The quantity can never go above the stock.
    if (existingItem !== null) {
      let newQuantity = existingItem.qty + quantity;
      if (newQuantity > product.stock) {
        newQuantity = product.stock;
      }
      existingItem.qty = newQuantity;
    } else {
      let startQuantity = quantity;
      if (startQuantity > product.stock) {
        startQuantity = product.stock;
      }
      cart.items.push({ id: productId, qty: startQuantity, color: color, size: size });
    }

    // Step 5: save.
    this.write(cart);
    return true;
  },


  // Change the quantity of one cart line. It stays between 1 and the stock.
  setQty(index, quantity) {
    const cart = this.read();
    const item = cart.items[index];

    if (!item) {
      return;
    }

    const product = productService.get(item.id);

    let wanted = parseInt(quantity);
    if (!wanted) {
      wanted = 1;        // empty or invalid typing becomes 1
    }
    if (wanted > product.stock) {
      wanted = product.stock;
    }
    if (wanted < 1) {
      wanted = 1;
    }

    item.qty = wanted;
    this.write(cart);
  },


  // Remove one line from the cart.
  remove(index) {
    const cart = this.read();
    cart.items.splice(index, 1);
    this.write(cart);
  },


  // Empty the cart (used after an order). Items saved for later stay.
  clear() {
    const cart = this.read();
    this.write({ items: [], saved: cart.saved });
  },


  // Move a line from the cart to "saved for later".
  save(index) {
    const cart = this.read();
    const removed = cart.items.splice(index, 1);

    if (removed.length > 0) {
      cart.saved.push(removed[0]);
    }

    this.write(cart);
  },


  // Move a line from "saved for later" back to the cart.
  restore(index) {
    const cart = this.read();
    const removed = cart.saved.splice(index, 1);

    if (removed.length > 0) {
      cart.items.push(removed[0]);
    }

    this.write(cart);
  },


  /* ---------- Reading the cart ---------- */

  // How many units are in the cart (the number in the header).
  count() {
    const cart = this.read();
    let total = 0;

    for (let i = 0; i < cart.items.length; i++) {
      total = total + cart.items[i].qty;
    }

    return total;
  },


  // Join every cart line with its product.
  // Each line gets a new field called "p" which holds the full product.
  lines(items) {
    if (items === undefined) {
      items = this.read().items;
    }

    const result = [];

    for (let i = 0; i < items.length; i++) {
      const product = productService.get(items[i].id);

      // Skip lines whose product no longer exists.
      if (product) {
        const line = Object.assign({}, items[i]);
        line.p = product;
        result.push(line);
      }
    }

    return result;
  },


  // Work out every amount on the order summary.
  totals(items, deliveryMethod = "standard") {
    const lines = this.lines(items);

    // Step 1: add up the prices before and after the product discounts.
    let subtotal = 0;          // price before any discount
    let productDiscount = 0;   // money saved by the product's own discount

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      subtotal = subtotal + line.p.oldPrice * line.qty;
      productDiscount = productDiscount + (line.p.oldPrice - line.p.price) * line.qty;
    }

    const afterProductDiscount = subtotal - productDiscount;

    // Step 2: apply the coupon. It can never take off more than what is left to pay.
    let couponDiscount = 0;
    const couponRule = COUPONS[storage.get("coupon")];

    if (couponRule && lines.length > 0) {
      couponDiscount = couponRule(afterProductDiscount);
      if (couponDiscount > afterProductDiscount) {
        couponDiscount = afterProductDiscount;
      }
    }

    const discount = productDiscount + couponDiscount;
    const amountAfterDiscounts = subtotal - discount;

    // Step 3: work out delivery.
    // Standard delivery is free over the limit. Express and same-day always cost money.
    let shippingFee = 0;

    if (lines.length > 0) {
      if (deliveryMethod === "standard") {
        if (amountAfterDiscounts >= FREE_DELIVERY_FROM) {
          shippingFee = 0;
        } else {
          shippingFee = DELIVERY_FEES.standard;
        }
      } else {
        shippingFee = DELIVERY_FEES[deliveryMethod];
      }
    }

    // Step 4: VAT and the final total.
    const tax = Math.round(amountAfterDiscounts * VAT_RATE);
    const total = amountAfterDiscounts + tax + shippingFee;

    return {
      subtotal: subtotal,
      discount: discount,
      shippingFee: shippingFee,
      tax: tax,
      total: total
    };
  }
};


/* ---------- Wishlist: a saved list of product ids ---------- */

const wishService = {

  // The list of product ids in the wishlist.
  ids() {
    return readList("wishlist");
  },


  // Is this product in the wishlist? Gives back true or false.
  has(productId) {
    const ids = this.ids();
    return ids.includes(productId);
  },


  // Add the product if it is not in the wishlist. Remove it if it is.
  // Gives back true when the product is now in the wishlist.
  toggle(productId) {
    const oldIds = this.ids();
    const wasSaved = oldIds.includes(productId);
    let newIds = [];

    if (wasSaved) {
      // Remove it: keep every id except this one.
      for (let i = 0; i < oldIds.length; i++) {
        if (oldIds[i] !== productId) {
          newIds.push(oldIds[i]);
        }
      }
      toast("Removed from wishlist.");
    } else {
      // Add it to the end of the list.
      newIds = oldIds;
      newIds.push(productId);
      toast("Saved to wishlist.");
    }

    storage.set("wishlist", newIds);
    refresh();

    return !wasSaved;
  }
};
