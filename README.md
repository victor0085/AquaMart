# AQUAMART storefront

Static site, no build step. Open `index.html` through any static server (or deploy as-is).

## Folder structure
```
index.html              page shell (header, footer, script tags in load order)
css/styles.css          main styles, sections marked with ===== headings
css/features.css        styles for the extra features
js/utils.js             helpers + LocalStorage wrapper
js/config.js            EDIT THIS: phone, WhatsApp, email, hours, address, promo codes
js/services/            data + business logic (products, auth, cart, orders, payment...)
js/ui.js                shared UI helpers (toast, modal, product card, form field)
js/views/               one file per page (home, shop, product, cart, checkout, account...)
js/chat.js router.js events.js search.js forms.js chrome.js
js/features.js          NEW extra sections (wraps existing views, easy to remove)
js/debug.js             exposes window.AQUAMART for console debugging
js/main.js              entry point, must load last
```
Scripts share one global scope, so **load order in `index.html` matters**.

## How the code flows
1. `main.js` seeds the demo user, builds the page chrome, calls `route()`.
2. `router.js` reads `location.hash`, calls a view in `V` (e.g. `V.shop`) and puts the HTML in `#app`.
3. Clicks: elements with `data-act="x"` call `A.x()` in `events.js`.
4. Forms: elements with `data-form="x"` are handled in `forms.js`.
5. State lives in LocalStorage under keys prefixed `aquamart_` (see `utils.js`).

## Debugging
- Console: `AQUAMART.cartService.d()`, `AQUAMART.storage.get("orders")`.
- Add `?debug=1` to the URL to log routes.
- To reset all demo data: `AQUAMART.storage.clear()` then reload.
- Demo login: demo@aquamart.com / Demo123!  Test card 4242 4242 4242 4242 (ending 0002 declines, 9119 times out).

## Accounts and security
- Anyone can sign up with their own email and password. Accounts are identified by email only, so many people can share the same or similar names.
- Passwords need 8+ characters with upper case, lower case, a number and a special character (! @ # $ % & *). They cannot contain common passwords, the person's name, or the start of their email.
- Passwords are stored with PBKDF2-SHA256 (150,000 rounds) and a unique salt per user. Five wrong passwords lock that email for 5 minutes.
- This is still browser-only demo storage. A real launch needs server-side accounts.

## Products and photos
- 91 products in 14 categories, grouped by category in `js/services/product-service.js`.
- Real photos: put files in `images/products/` using the names in `images/products/IMAGE_LIST.csv`. Missing photos fall back to a generated drawing.
- Prices are fixed values set in October 2026, not live. Live prices need a server or a supplier feed.

## New features (js/features.js)
New arrivals, Under ₦15,000 and Biggest discounts rows, signup promo band, shopper quotes, a Recently viewed row on product pages, a free-delivery progress bar in the cart, and a back-to-top button. Also fixed the missing `.hide-sm` style.

## Before you deploy
1. Put your real details in `js/config.js`.
2. Replace `paymentService.processPayment` (js/services/payment-service.js) with a server-backed Paystack/Flutterwave/Stripe flow. Never put secret keys in frontend files.
3. Replace the demo auth, simulated delivery and LocalStorage data with your backend.

## Deploy with GitHub Pages (step by step)
1. **Create the repository.** On github.com click **New repository**, name it (for example `aquamart`), keep it **Public**, do not add a README, then click **Create repository**.
2. **Open a terminal inside this project folder** and run these commands one at a time:
   ```
   git init
   git add .
   git commit -m "First version of AQUAMART"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/aquamart.git
   git push -u origin main
   ```
3. **Turn on Pages.** In the repository go to **Settings, Pages**, and under **Source** choose **GitHub Actions**.
4. **Wait about a minute.** Open the **Actions** tab. When the "Deploy to GitHub Pages" run shows a green tick, your site is live at `https://YOUR-USERNAME.github.io/aquamart/`.
5. **To update the live site later:** change files, then run `git add .`, `git commit -m "what you changed"`, `git push`. The site redeploys by itself.

What the workflow does (`.github/workflows/deploy.yml`): it checks every JavaScript file for syntax errors, and only publishes if they all pass. A broken file stops the deploy instead of breaking the live site.

Notes
- GitHub Pages cannot send custom security headers, so `index.html` carries the Content Security Policy as a meta tag. `netlify.toml` and `vercel.json` are used only if you deploy there instead.
- If the page is blank or unstyled, check the repository is Public and that Pages source is "GitHub Actions".
- Only commit photos you have the right to use. Keep photos under 200 KB each.

## Testing
`tests/smoke_test.py` opens the site in a headless browser and checks the pages, cart maths, payments, addresses and notifications. Instructions are at the top of the file.

## Other hosts
- Netlify: drag the folder onto app.netlify.com/drop (`netlify.toml` adds security headers).
- Vercel: `vercel --prod` in this folder (`vercel.json` adds headers).
