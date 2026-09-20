# Razorpay — what we need to do

*Written 20 September 2026. Every fact below has a source link. Anything I could not confirm is marked **UNCONFIRMED** — treat those as questions to ask, not as facts.*

**Who does what:** each step is tagged **[Dad]**, **[Shivansh]** or **[Claude]** with a rough time. Dad does KYC, signs and pays. Shivansh pastes values and clicks deploy. Claude does the code and the writing.

**One warning before you read on.** There is a licence question (§2, D0) that may take 30–60 days to fix. Read that first. Everything else can wait; that cannot.

---

## 1. What Razorpay is and what it will cost

### What it is, in one paragraph

Razorpay is the company that takes money from a customer's card or UPI app and puts it in your bank account. It sits between the website and the bank. The customer never types a card number into our site — Razorpay's own payment box opens on top of our page, and the card details go straight to Razorpay. That matters, because it means we never store card data and never have to.

The code for this is already written and already in the repo at `/Users/spmcil/Strategy-HQ/SASSMI/brand-web/sassmi-site`. Nothing about the payment logic needs to be built. What is missing is the paperwork, the hosting, and a handful of decisions.

### What it costs

| Item | Amount | Source |
|---|---|---|
| Setup fee | ₹0 | [razorpay.com/pricing](https://razorpay.com/pricing/) |
| Annual maintenance | ₹0 | [razorpay.com/pricing](https://razorpay.com/pricing/) |
| Cards, UPI, netbanking, wallets (Indian) | **2% of the order** | [razorpay.com/pricing](https://razorpay.com/pricing/) |
| GST on that fee | **18% of the fee** (not of the order) | [razorpay.com/pricing](https://razorpay.com/pricing/) |
| **Effective all-in** | **≈ 2.36% of the order** | arithmetic on the two rows above |
| Corporate / business credit cards | 2.15% + GST | [razorpay.com/pricing](https://razorpay.com/pricing/) |
| International cards | up to 3% + GST | [razorpay.com/pricing](https://razorpay.com/pricing/) |
| Refund processing fee (normal refund) | ₹0 | [razorpay.com/pricing](https://razorpay.com/pricing/), [refunds FAQ](https://razorpay.com/docs/payments/refunds/faqs/) |
| Instant refund | a fee applies — **amount not published** | [refunds FAQ](https://razorpay.com/docs/payments/refunds/faqs/) |
| One-time KYC processing fee | **₹199 + tax** | [90-day offer terms](https://razorpay.com/terms/90-day-free-pg-offer/) |
| Chargeback / dispute fee | **not published anywhere — UNCONFIRMED** | [disputes docs](https://razorpay.com/docs/payments/disputes/) |

**Worked example.** A ₹249 tin plus ₹49 shipping = ₹298. Razorpay takes ₹5.96 + ₹1.07 GST = **₹7.03**. On a ₹1,000 order it is ₹23.60.

### Four things about the money that surprise people

**1. UPI is not free for us.** Everyone assumes UPI costs nothing because RBI forced the banks to charge nothing. Razorpay's own pricing page says it plainly: *"UPI is MDR-free per RBI policy. Razorpay's 2% applies as a platform/technology fee, not as MDR."* ([source](https://razorpay.com/pricing/)). Most Indian customers will pay by UPI. So plan on 2% + GST on almost every rupee.

**2. UPI is about to stop being MDR-free anyway — and this is three weeks away.** From **15 October 2026**, a 0.4% MDR applies to UPI merchant payments **above ₹2,000**, capped at ₹300 per transaction. Payments up to ₹2,000 stay at zero. Small merchants taking up to ₹1 lakh a month via UPI QR stay exempt. ([Vajiram summary](https://vajiramandravi.com/current-affairs/upi-mdr-2026/), [Asianet](https://newsable.asianetnews.com/business/upi-transactions-above-rs-2-000-to-attract-0-4-mdr-from-oct-2026-articleshow-h77xvb4))
→ **UNCONFIRMED:** whether Razorpay absorbs this into its 2% or adds it on top. Nobody has published that. Ask Razorpay in writing before Diwali, because gift hampers and bulk orders will sit above ₹2,000.

**3. A refund does not give you the fee back.** Razorpay says it outright: *"Fees and taxes charged for a captured payment are not reversed"* ([source](https://razorpay.com/docs/payments/refunds/faqs/)). A ₹1,000 order that is fully refunded still costs ₹23.60. For a food business with breakages and wrong addresses, build a return rate into the margin.

**4. Money arrives on T+2 working days, not instantly.** Razorpay's product docs: *"Our standard settlement cycle is T+2 working days, T being the date of transaction capture"* and *"Working days do not include second and fourth Saturdays, Sundays and bank holidays."* ([source](https://razorpay.com/docs/payments/settlements/faqs/?preferred-country=IN))
The marketing page advertises *"T+1 or instant"* ([source](https://razorpay.com/pricing/)). **The two Razorpay pages disagree.** Plan on T+2. Check the real cycle on the dashboard once the account is live. Around Diwali the bank holiday calendar is dense — a Friday sale can take until the following Wednesday to land.

### The 0% offer — real, but read the small print

Accounts that **complete KYC and are activated on or after 1 July 2026** pay **no platform fee** on domestic payments, for **90 days from activation or until ₹5,00,000 of sales, whichever comes first**. ([full terms](https://razorpay.com/terms/90-day-free-pg-offer/))

What the terms also say, word for word:

- *"limited to one (1) redemption per Permanent Account Number (PAN)/Bank account"* — and only the **first activated Merchant ID** under that PAN qualifies. **Signing up "just to look around" under Dad's PAN burns this permanently.**
- Excluded: *"Prepaid Cards; (b) Corporate Credit Cards; (c) American Express (AMEX) Cards; (d) Diners Club Cards; and (e) all EMI-based payment methods"*.
- *"GST and other applicable statutory levies on platform fees are not waived"*.
- The ₹199 KYC fee is **not** waived.
- Fair-use clawback: *"If Razorpay determines that Your credit card transactions constitute more than 90% of total processed volume during the Offer period, Razorpay reserves the right to withdraw the Offer"* — and apply standard charges retrospectively. A launch that is mostly big corporate-card gifting orders can trip this.
- No last date for the offer is stated. It could be withdrawn. Do not build the launch plan around capturing it.

### The other monthly costs nobody counts

| Item | Cost | Why it is not optional |
|---|---|---|
| **Vercel Pro** | $20 per person/month + GST on an Indian billing address | Vercel's fair-use rules say Hobby is *"restricted to non-commercial personal use only"* and the very first example of commercial use is *"Any method of requesting or processing payment from visitors of the site"* ([source](https://vercel.com/docs/limits/fair-use-guidelines)). Running the store on the free plan is a terms breach on the domain that takes the money. |
| **Supabase Pro** | from $25/month per organisation (includes $10 of compute credit, which covers one small project) | Free projects pause *"if it does not receive sufficient user database activity over the past week"* ([source](https://supabase.com/docs/guides/platform/free-project-pausing)). A paused database means the site returns errors — including to Razorpay's webhook, which then starts a 24-hour countdown to being switched off. |
| Resend (email) | free up to 100/day | Order confirmations. |
| Razorpay | 2% + GST of sales | see above |

Roughly **$45–50/month** of fixed cost before a single tin sells. Convert at the day's rate — do not use a number from memory.

---

## 2. Decisions the family must make first

These are **not mechanical**. Nobody can do them for you, and several of them cannot be undone cheaply. Everything in §4 is blocked until these are settled.

### D0 — The FSSAI licence. Start this today. **[Dad + CA · possibly 30–60 days]**

This is the one that can silently sink the launch date.

FSSAI treats "e-Commerce" as its own **Kind of Business**, and selling food online requires a **Central Licence** — regardless of turnover. FoSCoS's own official guide *How to apply for a license for an E-commerce business* shows the eligibility screen reading: **Kind of Business: "E-Commerce – e-Commerce" → License Category: "Central License"**, with the note *"E-Commerce covered under Center License System"* and *"e-Commerce category is applicable for any food business operators carrying out any of the activities in section 3(n) of FSS act, through the medium of e-Commerce."* ([FoSCoS PDF](https://foscos.fssai.gov.in/assets/docs/fbo/HowtoapplylicenseforECommerce.pdf))

The same document has one piece of good news: *"A Food Business Operator (FBO)'s premise shall have only one FSSAI License or Registration on which any number of kind of businesses (KoB) can be endorsed."* So this may be an **endorsement on the existing Todapur licence**, not a whole new one — but it converts the licence to Central category, and the application is Form B with the website URL as a **mandatory** field.

Third-party compliance guides put the fee at ₹7,500/year and first approval at 25–60 working days ([PSR Compliance](https://www.psrcompliance.com/blog/central-fssai-license-for-ecommerce-food-business), [Lawrbit](https://www.lawrbit.com/industry-specific/fssai-license-ecommerce-food-business/)). **UNCONFIRMED:** the exact timeline and whether an endorsement is faster than a fresh application. Ask the CA or an FSSAI consultant — **not** Razorpay support, who will not know.

**Action today:** log into FoSCoS, look up the licence for M/S JJ Mithika Foods, and read what Kinds of Business are endorsed on it. If "e-Commerce" is not there, start the modification now and carry on with everything else in parallel.

### D1 — Which FSSAI number is the real one **[Dad · 20 minutes]**

The code carries two. `shared/config.ts` line 34 says `fssai: '13326009000225'` with the comment *"TODO: a 12-Sep label draft shows 10020011007234 — confirm which licence prints on packs"*.

Look both up on the FoSCoS public FBO search and write down which one is live for the selling entity. Do not reason from the digits — third-party guides on what the digits mean contradict each other. The confirmed number goes on the packs, the website, the invoices and the Razorpay KYC. A number that does not verify is a food-sector rejection you cannot argue your way out of.

### D2 — Price per tin and pack size **[Family · a real decision, not a form field]**

`shared/products.ts` currently has `PACK_SIZE = '100 g'` and `TIN_PRICE = 249`, both marked TODO. Renders have said 65 g; the 12-Sep label draft said 100 g.

This blocks Razorpay directly. Razorpay's activation form has a mandatory field called **"Pricing details"** and it runs automated checks that *"validate your website, policy pages and business industry"* ([source](https://razorpay.com/docs/payments/dashboard/account-settings/business-website-details/?preferred-country=IN)). Right now `business.store.open` is `false`, which hides every price on the site. There is nothing for a pricing check to find.

Remember the MRP is a **legal ceiling** once it is printed on the tin. Razorpay's ~2.36% and the GST both have to be inside it.

### D3 — Who is the merchant of record **[Dad + CA · 30 minutes]**

Two candidates:

| | M/S JJ Mithika Foods (proprietorship) | SASSMI Global Pvt Ltd |
|---|---|---|
| FSSAI | has one (13326009000225) | has none |
| GST | 07ACJPJ0611R2ZE | none stated |
| Bank account | yes (Kotak) | would need one |
| Razorpay KYC | PAN + one govt ID + **2 business documents** | CoI, CIN, MOA, AOA, company PAN, Board Resolution, UBO declarations ([source](https://razorpay.com/docs/payments/business-types-kyc-documents/?preferred-country=IN)) |
| E-Commerce Rules 2020, Rule 4(1) | technically non-compliant (see §9) | compliant |

**The practical answer is the proprietorship**, because Razorpay requires FSSAI for food businesses and only JJ Mithika has one. But understand three consequences before signing:

1. **Every rupee of website revenue becomes Sanjay Kumar Jha's proprietorship income**, not SASSMI Global's — even though SASSMI Global owns the brand. That inter-entity arrangement needs papering before money flows, not after.
2. **The customer's bank statement will not say "Sassmi."** More on this in D6.
3. Business type **cannot be changed by you later.** Razorpay's activation-details page says changes require contacting support. Decide before the form is opened.

### D4 — Support email on a domain we own **[Shivansh · 1 hour]**

The site currently uses `crunchymakhanaa@gmail.com`. Razorpay's compliance guidance wants real customer-support contact details, and transactional email should send from a verified domain. Pick one (`hello@sassmi.com`, `orders@sassmi.com`) and set it up in Resend. Until then, order emails send from Resend's shared `onboarding@resend.dev` default (see `server/env.ts` line 11), which lands in spam.

### D5 — sassmi.com or sassmiglobal.com **[Family · 5 minutes, then Claude fixes the code]**

The live site is **sassmi.com**. But `shared/config.ts` lines 11–12 still say:

```
domain: 'sassmiglobal.com',
siteUrl: 'https://sassmiglobal.com',
```

and `.env.example` sets `MAIL_FROM="Sassmi <orders@sassmiglobal.com>"`. Every policy page renders the wrong domain. LAUNCH-KIT.md tells you to give Razorpay `https://www.sassmiglobal.com` in six separate places.

Razorpay verifies the website URL you submit against the live site. **Submitting a domain that does not serve the store is an instant rejection.** Pick one domain and make the code, the emails, the webhook URL and the KYC field all agree.

### D6 — What name the customer sees **[Dad · decision, then 10 min in the dashboard]**

Razorpay lets you set a customer-facing brand name, but *"You can update the brand name only to one that is at least 80% similar to the company name or domain name"* and *"Only users with 'Owner' or 'Admin' roles can update the brand name"* ([source](https://razorpay.com/docs/payments/dashboard/account-settings/checkout-styling/?preferred-country=IN)). "Sassmi" passes because we own sassmi.com.

That name appears in transaction and refund emails, on Payment Links and Invoices, and as the beneficiary name on Smart Collect identifiers. Three logo display options exist — **Logo & Text**, **Wordmark**, **Text only** — so the oval Sassmi badge is usable under *Logo & Text*.

**UNCONFIRMED and important:** what actually appears on the customer's card or bank statement. Razorpay publishes nothing about this. It may say "JJ Mithika Foods" or the proprietor's name. A customer who does not recognise a charge disputes it. The only way to find out is §4 step 15: run one small real payment and photograph the statement.

### D7 — Vercel Pro and Supabase Pro **[Dad pays · 15 minutes]**

Covered in §1. Both are yes. Put the subscriptions on the entity that should hold them, not a personal card.

### D8 — Who owns the Razorpay login **[Dad + Shivansh · 10 minutes]**

The account will be in Dad's name — his PAN, his Aadhaar, his OTPs. Shivansh will be the one operating it. Generating live keys and editing webhooks both need OTP. Decide now whether to add Shivansh as a dashboard user rather than sharing Dad's credentials, and confirm whose phone the OTPs go to. Ten minutes now beats a scramble at 11pm on a Diwali Saturday.

---

## 3. Documents to gather

**[Dad, with Shivansh scanning · half a day]**

Scan each as a clear PDF or JPG, 300 dpi, a few MB at most. Razorpay accepts PDF/JPEG/PNG.

For a **Proprietorship**, Razorpay requires ([source](https://razorpay.com/docs/payments/business-types-kyc-documents/?preferred-country=IN)):

| # | Document | Notes |
|---|---|---|
| 1 | **Proprietor's PAN card** | Sanjay Kumar Jha |
| 2 | **Government address proof** | *"like Aadhar Card/Voter id/Passport"* — Aadhaar front and back |
| 3 | **Business document #1** | GST certificate (REG-06, downloadable from the GST portal) |
| 4 | **Business document #2** | Razorpay: *"MUST upload 2 from: MSME/UDYAM Certificate, GST Certificate, Shop & Establishment Certificate, Import Export Code (IEC), Postpaid Mobile Bill"*. GST is only one. **Udyam is free, online at udyamregistration.gov.in, and usually issued the same day from Aadhaar + PAN.** Get it now if you do not have it. |
| 5 | **Bank account number + IFSC** | Mandatory. Plus a cancelled cheque or statement first page. |
| 6 | **FSSAI licence** | Required separately for all food businesses. **It does not count as one of the two business documents above** — it is an extra, industry-specific requirement. |
| 7 | **A sample invoice** | Uploaded with the website details, as PNG/JPG/PDF ([source](https://razorpay.com/docs/payments/dashboard/account-settings/business-website-details/?preferred-country=IN)). We have to draw one — see §9. |

### The 30 minutes that saves a week: the name-match audit

Before anything is uploaded, write out, **character by character**, four strings:

1. The name on Sanjay Kumar Jha's **PAN**
2. The legal name **and** the trade name on **GSTIN 07ACJPJ0611R2ZE**
3. The account holder name printed on the **Kotak** cheque or statement
4. The name on the **FSSAI licence**

Razorpay's rule is explicit: *"Beneficiary Name: This must precisely match your business name as registered on Razorpay. Proprietorships: The name can also match your promoter's PAN name."* ([source](https://razorpay.com/docs/payments/dashboard/account-settings/bank-account-details/?preferred-country=IN))

**One thing that looks like a mismatch but is not.** For a proprietorship, the GST *legal name* is supposed to be the proprietor's own name (Sanjay Kumar Jha) while "M/S JJ Mithika Foods" is the *trade name*. That divergence is normal. Do not spend a week trying to make the GST certificate say something it should not.

**What does matter:** the bank account holder name must equal either the PAN name or the Razorpay-registered business name, exactly. "M/S JJ Mithika Foods" vs "JJ Mithika Foods" vs "&" vs "and" — these are the differences that stall files.

Razorpay verifies the bank account by depositing ₹1. If it fails, the documented remedies are: open an account in the matching name, supply *"a letter on your bank's official letterhead"* signed by the bank manager ([bank details page](https://razorpay.com/docs/payments/dashboard/account-settings/bank-account-details/?preferred-country=IN)), or — per the KYC documents page — a **video of the cancelled cheque** showing name, IFSC and account number clearly. Either route works; the bank letter is the more formal one.

Razorpay's own guide claims *"Bank account name and PAN mismatches cause approximately 40% of Indian gateway onboarding delays"* ([source](https://razorpay.com/blog/payment-gateway-kyc-onboarding-india/)). That is their marketing figure with no data behind it — but the underlying advice is right.

---

## 4. Step by step

### The order is not negotiable, and it is the opposite of what you would guess

Razorpay will not give live API keys until you submit live website details, and those details include a **"Pricing details"** URL. Razorpay states it flatly: *"Without these details, you will not be able to access live mode API keys and hence cannot accept payments from your website or app."* ([source](https://razorpay.com/docs/payments/dashboard/account-settings/business-website-details/?preferred-country=IN))

So you cannot "get Razorpay approved and then build the site." You must build and deploy the store with real prices **first**, and submit it to Razorpay **second**.

**Test-mode keys are different.** They can be generated *"in Test Mode without adding a website"* ([source](https://razorpay.com/docs/payments/dashboard/settings/api-keys/)). So the whole thing can be wired up and tested long before KYC is done.

---

### Step 1 — Create the Razorpay account, in test mode only
**[Dad signs up, Shivansh at the keyboard · 30 minutes]**

Go to razorpay.com, sign up with JJ Mithika's mobile and email, verify the OTP. Choose business type **Proprietorship**.

When it asks for a website, there is an **"Add later"** option. Take it. The site is not ready.

Then: Dashboard → **Account & Settings → API Keys** → generate keys while in **Test Mode**. The key id begins `rzp_test_`. **The key secret is shown exactly once** — *"only the Key Id is visible on the Dashboard, not the Key secret"* ([source](https://razorpay.com/docs/payments/dashboard/settings/api-keys/)). Paste both into a password manager immediately.

⚠️ Do not submit KYC yet. The 0% offer clock starts at activation, and you want that clock to start when the store can actually sell.

### Step 2 — Check the capture setting. Do not skip this.
**[Dad · 5 minutes — only the account owner can do it]**

Dashboard → **Account & Settings** → scroll to **Payments Capture**. It must read **automatic capture**. That is the default: *"This is the default setting for all customers"* ([source](https://razorpay.com/docs/payments/payments/capture-settings/)).

**Why this matters more than it looks.** Our code at `server/app.ts` line 173 accepts a payment whose status is either `authorized` **or** `captured`, then marks the order paid and emails the customer a receipt. If capture were ever set to manual and nobody captured, Razorpay *"payments that are not captured within this period will be refunded automatically to customers"* — the docs give that period as 3 days. We would have shipped tins against money that quietly went back.

Only the account owner can change this setting, and it applies only to payments created through the Orders API — which is exactly what our site does (`server/razorpay.ts` line 22 posts to `https://api.razorpay.com/v1/orders`).

### Step 3 — Set up the alert emails
**[Shivansh · 10 minutes]**

Dashboard → **Account & Settings → Notifications → Email**. Add addresses (comma-separated) for: payments received, the daily payment report, webhook alerts, and settlement success/failure. Turn on SMS for settlements.

**This is the only free automatic warning in the whole system.** There is nothing on the Vercel side unless you pay extra. Put an address here that somebody actually opens.

### Step 4 — Create the Supabase database
**[Shivansh · 20 minutes]**

supabase.com → New project. Name `sassmi-web`. Region **South Asia (Mumbai / ap-south-1)** — this must match Vercel's `bom1` region, which `vercel.json` already sets. Generate a strong database password and save it.

Then Supabase → **Connect** → copy the **Transaction pooler** string, port **6543**. It looks like:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

Replace `[PASSWORD]` and **URL-encode any special characters** (`@` → `%40`, `#` → `%23`).

**Never use the "Direct connection" string.** It is IPv6-only and fails from Vercel. Our code is already written for the pooler — `server/store/index.ts` line 9 sets `prepare: false`, which the pooler requires.

Upgrade to Pro now, or the project pauses after a week of quiet and the whole site returns errors.

### Step 5 — Deploy to Vercel
**[Shivansh · 30 minutes]**

vercel.com → Add New → Project → import the `sassmi-site` repo. Upgrade the team to **Pro** before going further (see §1).

`vercel.json` is already correct and pre-fills the settings — framework `vite`, build `npm run build`, output `dist`, function `api/index.ts` with a 30-second limit, region `bom1`. **Leave them alone.** Do not override in the dashboard; `vercel.json` wins and an override only creates confusion.

Node version: `package.json` pins `"engines": {"node": "22.x"}`, which **overrides** whatever the dashboard dropdown says. That is fine. (Node 20 is being retired on Vercel on 1 October 2026; 22 is not affected.)

Deploy, then open `https://<project>.vercel.app/api/health`. You want:

```json
{"ok":true, "payments":true, "webhook":true, "admin":true, "db":"postgres"}
```

If `db` says `"none"`, `DATABASE_URL` is missing. If `admin` is `false` with a password set, the password is under 16 characters — `server/env.ts` line 8 silently ignores short ones.

⚠️ `/api/health` only checks that the variables exist. It does **not** open a database connection. To prove the database actually works, open `/api/reviews` — that one queries Postgres.

### Step 6 — Environment variables
**[Shivansh · 20 minutes]** — full table in §5.

Set them in Vercel → Settings → Environment Variables **before** the first real deploy.

⚠️ **Vercel's own first line on that page:** *"Changes to environment variables are not applied to previous deployments, they only apply to new deployments. You must redeploy your project to update the value of any variables you change."* ([source](https://vercel.com/docs/environment-variables/managing-environment-variables)). Forgetting this is how people end up live with test keys.

### Step 7 — Create the TEST webhook
**[Shivansh · 15 minutes]**

A webhook is Razorpay phoning our server to say "this order was paid." It is the safety net: if the customer's phone dies right after paying, the webhook is the only thing that marks the order paid.

**Order matters.** Put `RAZORPAY_WEBHOOK_SECRET` into Vercel and redeploy **first**. If the secret is missing, `server/razorpay.ts` line 48 returns false and the route 400s — Razorpay counts that as a failure and starts a 24-hour clock.

Then, in **Test Mode**: Dashboard → Account & Settings → **Webhooks** → Add.

- **URL:** `https://<project>.vercel.app/api/razorpay/webhook`
- **Secret:** the exact same long random string you put in Vercel
- **Alert Email:** the family inbox
- **Active events:** `payment.captured`, `order.paid`, `payment.failed` — exactly the three our code handles (`server/app.ts` lines 207–214)
- If prompted for an OTP in test mode, the default is **754081** ([source](https://razorpay.com/docs/webhooks/validate-test/))

Notes: the URL must use port 80 or 443, localhost cannot receive webhooks, and **test-mode and live-mode webhooks are entirely separate objects — you will create this twice.**

### Step 8 — Fix the things in the code that are wrong today
**[Claude · half a day]**

These are all known and all mine to do. Listed so nobody thinks they are optional.

| What | Where | Why |
|---|---|---|
| Domain says sassmiglobal.com | `shared/config.ts` lines 11–12, `.env.example` | Razorpay checks the submitted URL against the live site |
| No `/about`, `/contact` or `/pricing` pages | `src/router.tsx` — routes are only `/`, `/product/:slug`, `/checkout`, `/order/:id`, `/policies/:slug`, `/crunchy-makhana`, `/admin` | Razorpay's form asks for all three by name |
| Test card `4111 1111 1111 1111` | `LAUNCH-KIT.md` line 83 | Not on Razorpay's current list. It will fail and look like a broken integration |
| Verify accepts `authorized` | `server/app.ts` line 173 | See step 2 |
| Amount check is skipped when Razorpay is slow | `server/app.ts` line 173 — the check is inside `if (payment && ...)`, and `fetchPayment` returns `null` on any error or 8-second timeout (`server/razorpay.ts` lines 12–18) | The amount/currency defence disappears exactly when Razorpay is degraded. Should return 503 and let the webhook settle it |
| **A failed verification re-arms the Pay button** | `src/pages/CheckoutPage.tsx` — on an `ApiError` with status 400 it calls `setBusy(false)` and returns, after money has already moved, without clearing the cart | The customer sees an error next to a live Pay button and may pay twice |
| Refunds are invisible to the app | `server/app.ts` lines 207–214 ignore all `refund.*` events | A refund issued from the dashboard leaves the order reading "paid" in `/admin` forever |
| No way to mark an order paid by hand | `server/app.ts` line 248 — orders are read-only in the admin API | The most likely incident has no in-app fix |
| A security middleware that never runs | `server/app.ts` line 42 registers `app.use('/api/*', ...)` on an app created with `.basePath('/api')` — it resolves to `/api/api/*` | The JSON content-type guard protects nothing. Fix is `app.use('/*', ...)`. Harmless for Razorpay, which sends JSON |
| No `callback_url` on checkout | `src/pages/CheckoutPage.tsx` | Razorpay warns: *"Sites like Instagram, Facebook Messenger, Opera and UC browser do not support i-frame."* For an Instagram-led brand this is a silent revenue leak ([source](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/best-practices/)) |

### Step 9 — Set the prices and open the store, on Vercel only
**[Family decides (D2), Claude edits · 1 hour after the decision]**

Set `TIN_PRICE` and `PACK_SIZE` in `shared/products.ts` to the confirmed numbers. Then set `store: { open: true }` in `shared/config.ts` line 19 and deploy.

Until that flag is true, `server/app.ts` line 129 returns a 403 — *"Online ordering opens soon"* — on every checkout attempt, before it even looks at whether payment keys exist.

⚠️ **Never flip this on the GitHub Pages build.** That build has no server behind it and only simulates checkout.

### Step 10 — Move the domain
**[Shivansh · 1 hour, plus waiting]**

Current state, which I verified by DNS lookup just now: `sassmi.com` points to GitHub Pages (185.199.108–111.153), `www.sassmi.com` is a CNAME to `conphusedlad.github.io`, and `https://sassmi.com/api/health` returns **404** — confirming there is no API behind it today. There is **no CAA record**, which is good; a restrictive one would block the HTTPS certificate.

1. **A day before:** at GoDaddy, lower the TTL on the four apex A records and the www CNAME to **600 seconds** (Domains → DNS → pencil icon → TTL → Custom). Change nothing else. This shrinks the switch window from an hour to ten minutes. ([GoDaddy](https://www.godaddy.com/help/edit-an-a-record-19239))
2. In Vercel → Settings → Domains, add **www.sassmi.com first**, then **sassmi.com**.
3. **Read the exact record values off each domain's card in Vercel.** Do not copy an IP from any guide, including this one — Vercel issues per-project values and *"verification checks for the exact A record your project expects"* ([source](https://vercel.com/kb/guide/a-record-and-caa-with-vercel)).
4. **Switch www first.** Change the www CNAME at GoDaddy from `conphusedlad.github.io` to Vercel's target. Wait for Vercel's card to go green. The apex is still on GitHub Pages, so the live site never goes dark. This is the rehearsal.
5. **Switch the apex second.** Delete the four `185.199.10x.153` A records, add one A record for `@` with Vercel's value. Confirm GoDaddy's "Parked" A record and Domain Forwarding stay **OFF** — LAUNCH-KIT line 17 records that they previously caused a stray `/lander` page.
6. Wait for HTTPS. Vercel uses a Let's Encrypt HTTP-01 challenge, so the certificate can only be issued **after** DNS points at Vercel. There is an unavoidable gap.
7. Check from a phone on mobile data, not the machine that made the change — your own DNS cache will lie to you.
8. **Then tear down GitHub Pages:** repo Settings → Pages → Remove the custom domain. GitHub warns that *"if your GitHub Pages site is disabled but has a custom domain set up, it is at risk of a domain takeover."* Then delete `docs/CNAME` — and remove the `echo sassmi.com > docs/CNAME` from the `build:pages` script in `package.json`, or the next run re-asserts GitHub's claim. (Note: LAUNCH-KIT line 17 currently says *never* delete that line. The two instructions now conflict; update LAUNCH-KIT in the same sitting.)

### Step 11 — Test end to end in test mode
**[Shivansh · 2 hours]** — full plan in §6.

### Step 12 — Submit KYC
**[Dad · 1 hour of form-filling, then 1–3 days of waiting]**

Dashboard → Account & Settings → Activate / Complete KYC. Registered → Proprietorship.

**Try CKYC first.** Enter the mobile number linked to Sanjay Kumar Jha's existing Central KYC record. If it hits, documents are auto-fetched, verification is instant, and Video KYC is skipped entirely. Otherwise use DigiLocker, then manual upload.

Enter the Kotak account number and IFSC. Razorpay deposits ₹1 to verify.

Then **add the GSTIN** at Account & Settings → Business settings → GST Details, **before the first transaction**. Two reasons: invoices generated before the GSTIN is on file carry the old value and cannot be corrected retrospectively, which means the 18% GST on those months' fees is not reliably claimable as input credit. And be aware it also rewrites your account name, business name and registered address to match the GST record.

**Watch for "Needs Clarification."** Razorpay contacts merchants by email, WhatsApp, SMS and the dashboard. Answer the same day — every round trip costs a full review cycle.

### Step 13 — Submit the website details
**[Shivansh fills, Dad approves · 30 minutes, then up to 3 working days]**

Only do this once the Vercel store is live at the final domain with real prices showing.

The primary-website form asks for these fields, verbatim ([source](https://razorpay.com/docs/payments/dashboard/account-settings/business-website-details/?preferred-country=IN)):

1. Website URL
2. **About us**
3. **Contact us**
4. **Pricing details**
5. **Terms and conditions**
6. **Privacy policy**
7. **Refunds policy**

Plus the sample invoice upload (PNG, JPG or PDF).

A **shipping policy is not one of the required fields** — it appears only under "Handy Tips" as a recommended page. (It *is* separately required for the international-payments application, and our site already has `/policies/shipping`, so no action either way.)

**On timing, Razorpay contradicts itself.** The FAQ says automated checks take 3–5 minutes and agent review 24–48 hours. The API-keys page says *"We will verify your website within 3 working days."* **Budget 3 working days per submission round.**

One main website plus up to five additional are allowed.

### Step 14 — Create the LIVE webhook and swap the keys
**[Shivansh · 30 minutes]**

Once activated:

1. Switch the dashboard to **Live Mode** → Account & Settings → API Keys → Generate Live Key. Copy the secret immediately — it is shown once.
2. Create a **second webhook, in Live mode**: URL `https://sassmi.com/api/razorpay/webhook`, same secret string as in Vercel, same three events. Test-mode webhooks do not carry over. **This is the single most common go-live mistake.**
3. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel with the `rzp_live_` pair.
4. **Redeploy.** Environment changes do not apply to existing deployments.
5. Confirm `https://sassmi.com/api/health` still shows `payments:true, webhook:true, db:"postgres"`.
6. Confirm the key the browser gets is live: open `https://sassmi.com/api/config` and check `razorpayKeyId` starts with `rzp_live_`. If it still says `rzp_test_`, the redeploy did not pick up the new values.

No code changes. The prefix is the only difference.

### Step 15 — The first real payment
**[Shivansh, not Dad · 30 minutes]**

Place a genuine order on the live site for one tin, to a real address, paying by UPI from your own phone.

Watch four things, in order:
1. The order page says "Order confirmed" with the item list — **not** the pending banner.
2. The receipt email reaches the buyer; the alert email reaches `NOTIFY_EMAIL` with shipping details.
3. `/admin` shows the order as **paid**.
4. Razorpay → Transactions → Payments shows the payment as **captured**, not authorized. If it sits at *authorized*, stop selling and go back to step 2.

**Then photograph the bank statement and the UPI app entry.** This is the only way to learn what name customers actually see (D6). Razorpay does not document it.

Then refund it from the dashboard — see §8 — and note two things that will surprise you: the ~2.36% fee does not come back, and `/admin` will still say "paid" because the app ignores refund events.

### Step 16 — Open the store to the public
**[Family · 10 minutes]**

Announce it. Then §8.

---

## 5. Every environment variable

Set these at Vercel → Settings → Environment Variables. They are encrypted at rest, so secrets are safe there. **Not** in the repo — `.env` is git-ignored, and it must stay that way.

Read from `server/env.ts` and `.env.example`.

| Name | Where to get it | Example | Environment |
|---|---|---|---|
| `RAZORPAY_KEY_ID` | Dashboard → Account & Settings → API Keys | `rzp_test_A1b2C3d4E5f6G7` → later `rzp_live_...` | Production. Preview **only with a test key** |
| `RAZORPAY_KEY_SECRET` | Shown **once** when the key is generated | `wJ8k...` (long random) | Production. Never a live key on Preview |
| `RAZORPAY_WEBHOOK_SECRET` | **You invent it.** Type the identical string into the Razorpay webhook form | 32+ random characters | Production. Must be set **before** the webhook is created |
| `DATABASE_URL` | Supabase → Connect → **Transaction pooler (6543)**. URL-encode the password | `postgresql://postgres.abcdef:p%40ss@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` | Production. Preview only with a **separate** Supabase project |
| `ADMIN_PASSWORD` | You invent it. **16+ characters or it is silently ignored** and `/admin` returns 503 | a long passphrase | Production |
| `NOTIFY_EMAIL` | Family inbox for order alerts. Comma-separated allowed. Defaults to `crunchymakhanaa@gmail.com` if unset | `orders@sassmi.com` | Production |
| `RESEND_API_KEY` | resend.com → API Keys | `re_xxxxxxxx` | Production |
| `MAIL_FROM` | Must be on a domain verified in Resend. **Defaults to `Sassmi <onboarding@resend.dev>`** — do not ship with that | `"Sassmi <orders@sassmi.com>"` | Production |
| `GMAIL_USER` | *Alternative to Resend.* Gmail address | `crunchymakhanaa@gmail.com` | Production |
| `GMAIL_APP_PASSWORD` | Google Account → Security → 2-Step → App passwords | 16 characters | Production |
| `SITE_URL` | The live site. Used in emails. Defaults to `http://localhost:5173` | `https://sassmi.com` | Production |

**No `VITE_*` variables are needed.** The browser gets the Razorpay key id at runtime from `GET /api/config` (`server/app.ts`), not at build time. So the key id is never baked into the JavaScript bundle.

**Missing `DATABASE_URL` is fatal, not degraded.** `server/store/index.ts` line 45 throws *"DATABASE_URL is not set (required outside Bun local dev)"*, which makes every API route return a 500 — including the webhook.

---

## 6. The test plan

Do all of this on the Vercel deployment with **test keys**, before any real money exists.

### Prove signature checking works before you test payments

A signature is a cryptographic stamp proving a message really came from Razorpay. Our code checks it two ways: on the checkout callback (`server/razorpay.ts` line 42) and on the webhook (line 49), both using timing-safe comparison.

**Test the failure case.** From your Mac:

```bash
curl -i -X POST https://<project>.vercel.app/api/razorpay/webhook \
  -H 'Content-Type: application/json' \
  -H 'X-Razorpay-Signature: deadbeef' \
  -d '{"event":"payment.captured","payload":{}}'
```

Expect **HTTP 400** with `{"error":"invalid signature"}`. Repeat with the header removed entirely — also 400. If either returns 200, the secret in Vercel does not match Razorpay's, and `/api/health` would show `webhook:false`.

**Test the success case:**

```bash
BODY='{"event":"payment.captured","payload":{}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac 'YOUR_WEBHOOK_SECRET' -hex | awk '{print $2}')
curl -i -X POST https://<project>.vercel.app/api/razorpay/webhook \
  -H 'Content-Type: application/json' -H "X-Razorpay-Signature: $SIG" -d "$BODY"
```

Expect **200** `{"ok":true}`.

### Test cards — use these, not the one in LAUNCH-KIT

These are Razorpay's current list ([source](https://razorpay.com/docs/payments/payments/test-card-upi-details/)). **Any future expiry date. Any random CVV.**

**Cards that succeed:**

| Network | Number |
|---|---|
| Visa Debit | `4100 2800 0000 1007` |
| Mastercard Credit | `5555 5100 0008 1006` |
| Mastercard Prepaid | `5180 2872 0009 1001` |
| RuPay Credit | `6527 6589 0000 1005` |
| Diners | `3608 280009 1007` |
| Amex | `3402 560004 01007` |

**Cards that fail in a specific way:**

| Number | What it simulates |
|---|---|
| `4100 2800 0008 0001` | insufficient funds |
| `4100 2800 0007 0002` | payment cancelled |
| `4100 2800 0009 0000` | payment timed out |
| `4100 2800 0006 0003` | card declined |
| `4100 2800 0000 0009` | authentication failed |
| `4100 2800 0002 0007` | gateway technical error |
| `4100 2800 0003 0006` | card disabled for online payments |
| `4100 2800 0001 0008` | invalid card number |

**OTP on the mock bank page:** a random **4 to 10 digit** OTP succeeds; **fewer than 4 digits** fails.

**Test UPI:** `success@razorpay` succeeds instantly, `failure@razorpay` declines instantly.
⚠️ **UNCONFIRMED:** Razorpay's UPI docs note that *in test mode, cancelling a UPI payment produces a **successful** payment* and that live mode is needed to test cancellation. So a test-mode UPI cancellation result is misleading.

### The seven tests

| # | Test | Expected |
|---|---|---|
| 1 | UPI success (`success@razorpay`) | Lands on `/order/SM-xxxxx` — **not** `?pending=1`. Receipt email arrives. `/admin` shows **paid**, `paid_via` = `checkout` |
| 2 | Card success (`4100 2800 0000 1007`) | Same as above |
| 3 | UPI failure (`failure@razorpay`) | Red toast, Pay button re-arms, cart intact. Order moves to **failed** once the `payment.failed` webhook lands |
| 4 | Card failure (`4100 2800 0008 0001`) | Same |
| 5 | Close the payment box with the X | Confirm-close prompt, then "Payment cancelled — your cart is safe." Order stays at **created** forever. **This is what an abandoned cart looks like — do not read `/admin` order counts as sales** |
| 6 | **Force the webhook race** — block `/api/checkout/verify` in browser devtools (Network → block request URL), then pay successfully | After three retries you land on `/order/SM-xxxxx?pending=1` showing "Payment received… we are confirming it". The page polls every 4 seconds, 15 times, then stops (`src/pages/OrderPage.tsx`). The webhook should still flip it to paid. **Do this once. It is what Incident 1 looks like from the customer's side** |
| 7 | 3D-Secure failure (`4100 2800 0000 0009`) | Exercises the authentication path |

After each, check **both** logs: Razorpay's own webhook delivery history, and Vercel → project → Logs filtered to Request Path `/api/razorpay/webhook`. Razorpay showing "failed" while Vercel shows a 200 means a **timeout**, not a rejection.

---

## 7. Going live — checklist

Tick every line. **[Shivansh · 1 hour]**

**Family decisions**
- [ ] FSSAI e-Commerce Kind of Business confirmed or applied for (D0)
- [ ] The live FSSAI number confirmed on FoSCoS and in `shared/config.ts` (D1)
- [ ] MRP and pack size confirmed and set in `shared/products.ts` (D2)
- [ ] Merchant of record decided and the inter-entity position discussed with the CA (D3)
- [ ] Support email live on the owned domain (D4)
- [ ] One domain everywhere — code, emails, webhook, KYC field (D5)
- [ ] Vercel Pro and Supabase Pro paid for (D7)
- [ ] Who holds the Razorpay login and the OTP phone (D8)

**Razorpay**
- [ ] KYC activated
- [ ] Payments Capture reads **automatic**
- [ ] GSTIN entered in Business settings, before the first transaction
- [ ] Brand name set to "Sassmi" in Checkout Styling
- [ ] Notification emails set to an inbox someone reads
- [ ] Live API keys generated and the secret saved
- [ ] **A live-mode webhook created** at `https://sassmi.com/api/razorpay/webhook` with the three events
- [ ] The rate card shown after activation screenshotted and filed — it is the version that binds, and Razorpay's public pages disagree with each other on EMI and corporate cards
- [ ] The settlement cycle actually shown on the dashboard noted (T+1 or T+2)
- [ ] Chargeback fee asked for **in writing** (it is not published)

**Site**
- [ ] `https://sassmi.com` served by Vercel with a valid certificate
- [ ] `/api/health` returns `payments:true, webhook:true, admin:true, db:"postgres"`
- [ ] `/api/reviews` returns data (proves the database connects, which `/api/health` does not)
- [ ] `/api/config` returns a key starting `rzp_live_`
- [ ] `/about`, `/contact`, `/pricing` exist as real pages
- [ ] `store.open` is `true` and prices are visible
- [ ] The GitHub Pages custom domain removed and `docs/CNAME` gone
- [ ] Emails send from the verified domain, not `onboarding@resend.dev`

**Proof**
- [ ] One real payment completed and captured
- [ ] Bank statement descriptor photographed
- [ ] That payment refunded, and the refund watched all the way through

---

## 8. The first week

### The five-minute morning routine **[Shivansh · daily]**

1. `/admin` — count today's **paid** orders.
2. Razorpay → Transactions → Payments, filtered to today — the **captured** count must equal that number. Any gap is a stuck order.
3. Filter to **authorized** — it must be empty. Anything sitting there is money about to auto-reverse.
4. Glance at Settlements to confirm money is moving.
5. Confirm the daily payment report email arrived. If it did not, the notification settings are wrong.

Weekly: Vercel → Logs filtered to status 500, and confirm the Supabase project is awake.

**There is no automatic alert when the payment API starts failing.** Vercel's anomaly alerts require the paid Observability Plus add-on, and even then a low-traffic store may never cross the minimum-activity threshold. Razorpay's own webhook-failure email is the real alarm. An external uptime pinger hitting `/api/reviews` every few minutes would both watch the site and keep a free-tier Supabase project awake — worth ten minutes to set up.

Also note **Vercel keeps runtime logs for 1 day on Pro** ([source](https://vercel.com/docs/logs/runtime)). A problem reported two days later has no evidence left. Screenshot anything relevant the same day.

### How refunds work

**From the dashboard:** Transactions → Payments → open the payment (it must be **captured**) → enter the amount (leave it for a full refund, lower it for partial) → decide whether to tick "Refund Instantly" → issue.

**Via the API**, for the record: `POST https://api.razorpay.com/v1/payments/{payment_id}/refund` with Basic auth. `amount` is in paise; omitting it refunds in full. `speed` is `normal` or `optimum`. The `receipt` field is an idempotency key — reusing it on the same payment is rejected, which is your protection against refunding a customer twice because they emailed twice. ([source](https://razorpay.com/docs/api/refunds/create-normal/))

**What to tell the customer:** a normal refund takes **5–7 business days** to reach them ([source](https://razorpay.com/docs/payments/refunds/faqs/)). An instant refund is near-immediate but carries a fee Razorpay does not publish.

**Four things to know before the first one:**
- The ~2.36% fee is **not** returned.
- Refunds draw on your Razorpay balance. If a batch of refunds lands during a quiet sales week, the refund simply blocks until more payments arrive or you add funds from the dashboard — which itself takes 2–3 hours to reflect. To the customer that looks like you stalling.
- Only **captured** payments can be refunded. An *authorized* one just auto-reverses.
- **The app will not know.** `/admin` will still say "paid". **Keep a refund spreadsheet from day one** until the refund webhook is wired up, or you will re-ship a refunded order.
- **UNCONFIRMED:** a 6-month age limit on normal refunds is widely reported but I could not find it on the refunds FAQ page. Assume old payments may not be refundable.

### Incident 1 — "She paid but there's no order"

**Likely cause:** the webhook is not delivering (wrong secret, disabled webhook, or a cold function that answered too slowly) **and** the inline verify also failed.

**First, serve the customer.** Find the payment in Razorpay → Transactions → Payments by amount or phone number, and open it. **The order notes carry the buyer's name, phone, email and item list** — `server/app.ts` lines 141–148 put them there. You can fulfil the order from Razorpay alone. (Caveat: the name and email are cut at 200 characters and the item list at 250, so a very large order may be truncated.)

**Then diagnose.** Open the webhook's delivery log in Razorpay, and Vercel Logs filtered to `/api/razorpay/webhook`.

**Then fix.** If the secret is wrong, correct it in Vercel and redeploy — **but note that retries of older events are still signed with the OLD secret**, so events already in flight will keep failing ([source](https://razorpay.com/docs/webhooks/faqs/)). To recover a specific lost order, request a **webhook replay** through Dashboard → Help → Technical Support. This only works if the webhook was enabled at the time and the event is **under 15 days old**, and bulk replay is not possible.

There is no admin button to mark the order paid. That is the known gap in step 8.

### Incident 2 — "Razorpay emailed that our webhook was disabled"

**Cause:** 24 hours of continuous non-2xx responses. Razorpay: *"If the webhooks continue to fail for 24 hours, the webhook is disabled. You need to enable the webhook from the Dashboard after fixing the errors at your end."* ([source](https://razorpay.com/docs/webhooks/faqs/))

The most plausible trigger is the Supabase project pausing or the database connection breaking — which makes every API route return 500.

**Diagnose:** open `https://sassmi.com/api/health`. If `db` is not `"postgres"`, or the call 500s, it is the database. Check Supabase and resume the project.

**Fix:** restore the database, verify health, then **manually re-enable the webhook** — it does not come back on its own. Then reconcile every payment from the outage window by comparing Razorpay's *captured* list against `/admin`, and request replays for anything under 15 days old.

**Prevention:** Supabase Pro. This is exactly the risk D7 covers.

### Incident 3 — "Money was deducted but the site showed an error"

Two different things.

**(a) "Payment could not be verified."** That is a genuine signature mismatch — a 400 from `/checkout/verify`. Take the payment ID. Razorpay auto-refunds an authorised-but-uncaptured payment, so tell the customer the money returns automatically. **Then investigate immediately** — a real signature failure on a live payment means the key secret in Vercel does not match the key id in use.

⚠️ **Watch for a second payment from the same customer.** As the code stands today, a 400 re-arms the Pay button and does not clear the cart. Check for duplicate payments from the same phone number in the first week.

**(b) "Order not found… WhatsApp us with this payment ID."** The Razorpay order was created but our database row was not — the database write failed at checkout time. Look the payment up in Razorpay, read the buyer details from the notes, fulfil manually, or refund if you cannot.

In both cases, Vercel Logs will have a `[verify]` error line with the order and payment IDs.

---

## 9. Compliance the site must keep showing

These are not optional page furniture. Razorpay checks some of them; Indian law requires the rest.

**Already on the site.** Five policy pages at `/policies/terms`, `/policies/privacy`, `/policies/refunds`, `/policies/shipping`, `/policies/grievance`, linked from the footer. The product pages already show ingredients, allergens, best-before location, country of origin, manufacturer name/address/FSSAI, customer-care phone and email, and the vegetarian mark.

**Missing and must be built before go-live:**

| Item | Why |
|---|---|
| **MRP and net quantity on the product page** | Legal Metropoly Rule 6(10) requires an e-commerce listing to display the same declarations as the pack (except the manufacture date). Right now both render as "To be announced at launch" because `store.open` is false. The moment payments are on, that is a breach on every product page. Section 36 of the Legal Metrology Act 2009 carries a fine up to ₹25,000 for a first offence ([source](https://indiankanoon.org/doc/28676169/)) |
| **A nutrition table per flavour** | FSS (Labelling and Display) Regulations 2020 require the mandatory label information to reach the online buyer before sale, and nutrition is part of that set. There is no nutrition table anywhere on the site. The blocker is lab values, not code. LAUNCH-KIT §6 records this as deliberately unbuilt |
| **Real `/about`, `/contact` and `/pricing` pages** | Razorpay asks for all three by name. Home-page anchors often pass, but a rejection costs up to 3 working days per round trip |
| **A named Nodal Person of Contact** | Rule 4(1)(b) of the E-Commerce Rules requires a nodal person **separate from** the Grievance Officer. `shared/config.ts` has a `grievance` block and no nodal-person field. Naming the same person in both roles is fine; naming neither is not |
| **A GST tax invoice per order** | Right now the order email is being used as the receipt (LAUNCH-KIT §6 says invoicing is deliberately unbuilt). A registered supplier must issue a tax invoice under s.31 CGST + Rule 46 |
| **A Legal Metrology packer registration (Rule 27)** | Every person who pre-packs for sale must register with the Controller of Legal Metrology — ₹500, within 90 days of starting ([source](https://indiankanoon.org/doc/156451497/)). Everyone remembers FSSAI and GST; almost nobody does this one. Check whether JJ Mithika holds it |

**On the tax invoice — two things to get right.**

*The rate.* Pre-packaged, labelled makhana attracts **5% GST**. The 12% slab for branded namkeen was abolished on 22 September 2025. Roasted/flavoured makhana under HSN 2008 is 5%; loose and unbranded is nil ([summary](https://mithilafpo.in/gst-on-makhana-hsn-codes/), [busy.in](https://busy.in/hsn/makhana-hsn-code/)). **UNCONFIRMED:** which HSN belongs on the invoice — 0813, 2008 and 2106 all appear across sources, and the milk-based Royal Makhana Kheer may classify differently. That is a CA question, but it is a small one now that the rate is settled at 5% either way. **If anyone is still pricing off 12%, that is out of date.**

*The tax type.* GSTIN 07… is a **Delhi** registration. A tin shipped to Mumbai is an **inter-state** supply carrying **IGST at 5%**, not CGST + SGST. Only Delhi deliveries are intra-state. The invoice has to branch on the buyer's state. Building a CGST+SGST-only invoice would be wrong on most orders from day one.

**Not applicable, so stop worrying about them:**
- **E-invoicing (IRN)** starts at ₹5 crore turnover, and B2C invoices are outside the regime entirely.
- **The B2C dynamic QR code** sits at ₹500 crore.
- **TDS under s.194-O** and **GST TCS under s.52** both target e-commerce *operators* who facilitate other people's sales. Selling only our own goods on our own site, there is no operator. Confirm against the first month's settlement report and Form 26AS, but expect nothing to be deducted.

**Card data.** RBI prohibits merchants from storing card credentials. We are already clean: `server/razorpay.ts` only calls the Orders API, fetches payment status and does signature checks. No card field touches our server, and the checkout script loads from `https://checkout.razorpay.com/v1/checkout.js` (`src/lib/razorpay.ts` line 20), which is what keeps us in the lightest PCI category. **Never build a card form. Never log a card number. Never put card data in the Razorpay notes field.**

**Data location.** RBI requires payment system data to sit on servers in India. Supabase must stay in the Mumbai region and `vercel.json` must keep `"regions": ["bom1"]`. Do not let a later migration quietly move the database to the US.

**Grievance timelines are a real obligation:** acknowledge a complaint within 48 hours, resolve within one month. The admin panel issues ticket numbers and sends acknowledgements. Somebody still has to answer them.

**The structural one, for the CA — not a footnote.** Rule 4(1)(a) of the Consumer Protection (E-Commerce) Rules 2020 says an e-commerce entity *"shall be a company"* incorporated under the Companies Act. Proprietorships, partnerships and even LLPs are excluded, and the marketplace-seller carve-out does not apply to a brand selling its own goods on its own site ([Trilegal analysis](https://trilegal.com/wp-content/uploads/2021/11/Consumer-Protection-E-Commerce-Rules-2020.pdf)). Razorpay will still onboard the proprietorship. But this is a named question for the CA, and it points the same way as the SASSMI Global transition already logged as D10 in LAUNCH-KIT.

---

## 10. What can go wrong, and how to roll back

### The ten most likely failures

| What | How you find out | What to do |
|---|---|---|
| **Live keys, but only a test webhook** | Payments succeed at Razorpay; orders sit at "created" forever | Create the live webhook. Step 14 |
| **Redeploy skipped after swapping keys** | `/api/config` still shows `rzp_test_` | Deployments → Redeploy |
| **Capture set to manual** | Payments sit at *authorized*; customers get a refund 3 days later | Only the account owner can fix it. Step 2 |
| **Supabase paused** | `/api/health` shows `db` not `"postgres"`; everything 500s | Resume, then re-enable the webhook. Incident 2 |
| **Cold function misses the 5-second webhook window** | Razorpay's log shows failures; Vercel's shows 200s | Harmless for money — the duplicate-detection table makes retries safe — but 24 hours of it disables the webhook |
| **Webhook pointed at a preview URL** | Every delivery 401s | Vercel's deployment protection blocks automated requests. Always use the production domain |
| **Webhook secret rotated mid-flight** | Queued retries start failing | Rotate only when the queue is quiet. Old events keep the old secret |
| **Wrong domain submitted to Razorpay** | Activation rejected | D5. Fix the code, not just the form |
| **Name mismatch across PAN / bank / GST** | KYC stalls in "Needs Clarification" | §3, the name-match audit |
| **Hobby plan** | Possible Vercel action on the domain taking the money | Pro. D7 |

### And two slower ones

**Re-KYC freezes your money before the deadline, not after.** RBI requires periodic re-KYC — every 2 years for high-risk businesses, every 8 for medium and low. **Settlements are put on hold 30 days *before* the deadline** if it is not done; the account goes Live Disabled 30 days after, and permanently at 60 ([source](https://razorpay.com/docs/payments/dashboard/re-kyc/)). Put a reminder in the family calendar the day the account activates.

**Abandoned carts pile up.** The order row is written before payment, so every abandoned cart leaves a permanent "created" row. Never read the `/admin` order count as a sales figure — only **paid** counts.

### How to roll back

There are three levers, from cheapest to most expensive. Use the cheapest one that fits.

**1. Close the store — seconds.** Set `store: { open: false }` in `shared/config.ts` and push. Checkout returns a 403, prices vanish, every buying path goes to WhatsApp. The site stays up and looks deliberate. **This is the emergency brake for almost everything.** Nothing is lost; orders already paid are unaffected.

**2. Revert the Vercel deployment — seconds, no DNS.** Vercel's docs: *"Reverts take effect immediately, assigning the Custom Domain to the deployment made prior to the point the revert is effective from."* ([source](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)). This fixes anything caused by a bad code change and never touches the domain.

**3. Move the domain back to GitHub Pages — hours to a day.** Restore the four A records and the www CNAME at GoDaddy, re-add sassmi.com under repo Settings → Pages, restore `docs/CNAME`. The site returns within minutes **but HTTPS may not.** GitHub: *"It can take up to 24 hours before this option is available"* for Enforce HTTPS. So this likely means a day of browser security warnings on the brand domain.

**Treat the domain move as effectively one-way.** That is why step 10 switches www first and why all the testing in §6 happens on the free `*.vercel.app` URL, with sassmi.com untouched. Lever 1 and lever 2 will handle almost every real problem. Lever 3 is for "Vercel itself is broken," which is not the failure you should expect.

### If a live key ever leaks

Regenerate it in the dashboard. You can *"deactivate the old key immediately or within 24 hours"* ([source](https://razorpay.com/docs/payments/dashboard/settings/api-keys/)). Then update Vercel and redeploy. Never commit a key — `.env` is in `.gitignore` and must stay there, and the repo is public.

---

## The honest summary

The code is done and it is good. The Razorpay integration is correct against Razorpay's own 2026 documentation — right endpoints, right signature algorithms, raw-body webhook verification, duplicate protection, and no card data anywhere near our server. There are eight small code fixes in step 8, and they are all mine.

**What is actually standing between you and taking money is four things, in this order:**

1. **The FSSAI e-commerce licence** (D0) — the only item with a 30–60 day clock. Start today.
2. **The price and pack size** (D2) — because Razorpay will not approve a shop with no prices.
3. **The deployment** — Vercel Pro, Supabase Pro, the domain move. About a day of Shivansh's time once the decisions are made.
4. **The KYC** — a day of Dad's paperwork, then up to 3 working days per review round.

Do not sign up for Razorpay "to look around" first. The 0% offer is one redemption per PAN, and it is the first Merchant ID that counts.
