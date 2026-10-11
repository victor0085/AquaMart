/* =====================================================================
 * js/views/auth.js
 * Login, signup and forgot-password pages.
 * ===================================================================== */
"use strict";

/* auth views */
V.login = q => {
  meta("Log in");
  return`<div class="card" style="max-width:440px;margin:0 auto">
    <h1>Log in</h1>
    <div class="demo"><b>Demo account:</b> demo@aquamart.com / Demo123! <button class="btn sm" data-act="fill">Fill</button></div>
    <form data-form="login" data-next="${esc(q.next||"/account")}" novalidate>${field("email","Email","email","","autocomplete=email")}${field("password","Password","password","","autocomplete=current-password")}<label><input type="checkbox" id="rem"> Remember me</label>
    <div class="err" data-e="form"></div><button class="btn" style="width:100%;margin:12px 0">Log in</button></form>
    <p><a href="#/forgot-password" style="color:var(--pri)">Forgot password?</a> · <a href="#/signup" style="color:var(--pri)">Create account</a></p></div>`
};

V.signup = () => {
  meta("Sign up");
  return`<div class="card" style="max-width:520px;margin:0 auto">
    <h1>Create your account</h1>
    <form data-form="signup" novalidate>
    <div class="two">${field("firstName","First name")}${field("lastName","Last name")}</div>${field("email","Email","email")}${field("phone","Phone","tel","","placeholder='08012345678'")}${field("password","Password (8+ chars, upper, lower, number, symbol)","password")}${field("confirm","Confirm password","password")}<label><input type="checkbox" id="terms"> I agree to the <a href="#/terms" style="color:var(--pri)">Terms</a> and <a href="#/privacy" style="color:var(--pri)">Privacy Policy</a></label>
    <div class="err" data-e="terms"></div>
    <div class="err" data-e="form"></div><button class="btn" style="width:100%;margin:12px 0">Create account</button></form>
    <p>Already registered? <a href="#/login" style="color:var(--pri)">Log in</a></p></div>`
};

V.forgot = () => {
  meta("Forgot password");
  return`<div class="card" style="max-width:440px;margin:0 auto">
    <h1>Reset password</h1>
    <p class="mut">Enter your email. In this demo no email is actually sent.</p>
    <form data-form="forgot" novalidate>${field("email","Email","email")}<button class="btn" style="width:100%">Send reset link</button></form></div>`
};
