/* =====================================================================
 * js/services/payment-service.js
 * DEMO payment simulator. No real money moves and no card number is stored.
 *
 * To go live: replace processPayment() with a call to YOUR server, which creates
 * a Paystack / Flutterwave / Stripe transaction. Keep secret keys on the server only
 * and confirm the payment with the gateway's webhook.
 * ===================================================================== */
"use strict";

// Test cards (last four digits) that force a result:
const TEST_CARD_TIMEOUT = "9119";
const TEST_CARD_DECLINED = "0002";

// Luhn check: the maths that every real card number must satisfy.
// It only proves the number is well formed, not that the card is real.
const passesLuhnCheck = cardNumber => {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let total = 0;
  let doubleThisDigit = false;

  // Walk from the right. Double every second digit. If the result is above 9, subtract 9.
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (doubleThisDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
    doubleThisDigit = !doubleThisDigit;
  }
  return total % 10 === 0;
};

const paymentService = {
  // Returns { status, ref } or throws an Error with a message that is safe to show the customer.
  async processPayment({ method, card }) {
    await fakeNetworkDelay(0, 1600); // pretend the bank is thinking

    // Pay on delivery and bank transfer are confirmed later, so they stay "Pending".
    if (method === "cod") return { status: "Pending", ref: "COD-DEMO" };
    if (method === "bank") return { status: "Pending", ref: "BANK-DEMO" };

    // Card payments: the test card number decides the result.
    const lastFour = (card?.number || "").replace(/\s/g, "").slice(-4);

    if (lastFour === TEST_CARD_TIMEOUT) {
      throw Object.assign(
        new Error("The payment request timed out. You were not charged. Please try again."),
        { timeout: true }
      );
    }
    if (lastFour === TEST_CARD_DECLINED) {
      throw new Error("Your card was declined (demo). Try another card.");
    }

    return { status: "Paid", ref: "DEMO-" + Date.now().toString(36).toUpperCase() };
  }
};
