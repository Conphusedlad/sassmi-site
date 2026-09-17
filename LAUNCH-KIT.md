# Sassmi website — Launch Kit
*Written 17 Sep 2026. Everything below is model-produced; Shivansh's part is limited to sign-ups, pasting keys, and DNS edits.*

**What this is:** the Sassmi dynamic website (React + Vite front-end, Hono API on Vercel, Postgres on Supabase, Razorpay payments, email notifications, review moderation, contact tickets, admin panel). Code lives at `/Users/spmcil/Strategy-HQ/SASSMI/brand-web/sassmi-site/`.

**Local preview (no accounts needed):**
```bash
~/.bun/bin/bun run dev
```
→ http://localhost:5173 (API on :8787, SQLite file at `data/sassmi.sqlite`, admin password `sassmi-local-admin` from `.env`).

---

## 0. Decisions the family must make BEFORE go-live (blocking)
| # | Decision | Why it matters | Where it goes |
|---|---|---|---|
| D1 | **Prices per tin and pack size** (site shows ₹249 / 100 g as placeholders; renders say 65 g, the 12-Sep label draft says 100 g) | Legal Metrology: net quantity and MRP shown online must match the physical pack | `shared/products.ts` → `TIN_PRICE`, `PACK_SIZE` |
| D2 | **FSSAI number**: memory/FoSCoS says 13326009000225; the 12-Sep label draft shows 10020011007234 | Only the live FoSCoS number may appear on packs, site, invoices, Razorpay KYC | `shared/config.ts` → `operator.fssai` |
| D3 | **Merchant of record** = the entity that takes the money. Only JJ Mithika Foods has FSSAI + GST + bank today → Razorpay account as **Proprietorship (Sanjay Kumar Jha)**; bank/PAN/GST names must match exactly | Razorpay activation fails on any mismatch | Razorpay KYC form; footer already says "manufactured & marketed by JJ Mithika Foods" |
| D4 | **Grievance officer** (a named person, email, phone). Site currently names Sanjay Kumar Jha | Consumer Protection (E-Commerce) Rules 2020 | `shared/config.ts` → `grievance` |
| D5 | **Support email on the owned domain** (e.g. hello@sassmiglobal.com). Site uses crunchymakhanaa@gmail.com until then; the label draft's info@sassmi.com / sassmi.com are NOT owned | Transactional email must send from a verified domain | `shared/config.ts` → `contact.email`, Vercel env `MAIL_FROM` |
| D6 | **Shipping rule**: ₹49 flat, free above ₹499 (placeholders) | Shown at checkout and in policies | `shared/config.ts` → `shipping` |
| D7 | **Trademark status**: site uses ™ everywhere; never ® until the registration certificate exists (the AI label drafts wrongly carry ®) | Trade Marks Act s.107 | already handled in code and wordmark |
| D8 | **Vercel plan**: Hobby is "non-commercial" by Vercel's fair-use terms → Pro ($20/month) before launch | Fair-use compliance, 1-day logs | Vercel billing |
| D9 | **Supabase plan**: Free projects pause after ~1 week of inactivity (site would 500 until resumed) → Pro ($25/month) or accept the risk | Uptime | Supabase billing |
| D10 | Rule 4(1) of the E-Commerce Rules 2020 says an e-commerce entity "shall be a company" — selling as a proprietorship is common but technically non-compliant; the clean route is SASSMI Global as site operator once it holds a trade FSSAI (transition kit Phase 1) | Legal exposure | Family + CA decision, not a code change |

---

## 1. Accounts to create (Shivansh: ~40 minutes total)
1. **GitHub** (github.com) — free. Needed to host the code for Vercel. If a family GitHub exists, use it.
2. **Vercel** (vercel.com → Continue with GitHub) — hosting + API functions.
3. **Supabase** (supabase.com → New project: name `sassmi-web`, region **South Asia (Mumbai)**, generate a DB password and save it in a password manager) — the database.
4. **Razorpay** (razorpay.com → Sign up with the JJ Mithika mobile/email) — payments. Test-mode keys are available immediately; live keys only after KYC (§4).
5. **Resend** (resend.com) — transactional email; free tier 100 emails/day / 3,000 per month. Alternatively use Gmail SMTP with an App Password (no new account; 500/day cap).

## 2. Put the code on GitHub (two Run-buttons)
```bash
cd /Users/spmcil/Strategy-HQ/SASSMI/brand-web/sassmi-site && git init -b main && git add -A && git commit -m "Sassmi website v1" && echo done
```
Then create an empty **private** repository named `sassmi-site` on github.com (no README), copy its HTTPS URL, and run (replace the URL):
```bash
cd /Users/spmcil/Strategy-HQ/SASSMI/brand-web/sassmi-site && git remote add origin https://github.com/YOUR-ACCOUNT/sassmi-site.git && git push -u origin main
```
(GitHub will ask for your username + a personal access token as the password: github.com → Settings → Developer settings → Personal access tokens → Generate, scope `repo`.)

## 3. Deploy on Vercel (GitHub import — no terminal)
1. vercel.com → **Add New… → Project → Import** the `sassmi-site` repo. Framework preset auto-detects **Vite**; leave Build Command `vite build` and Output `dist`.
2. Open **Environment Variables** on the same screen and add these (values from §1 accounts; tick Production + Preview):

| Key | Value / where from | Secret? |
|---|---|---|
| `DATABASE_URL` | Supabase → **Connect** button → *Transaction pooler* (port **6543**) URI, `[YOUR-PASSWORD]` replaced (URL-encode special characters). Never the "Direct connection" string — it is IPv6-only and fails from Vercel. | yes |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Account & Settings → API Keys (test key `rzp_test_…` first; swap to `rzp_live_…` after KYC) | no |
| `RAZORPAY_KEY_SECRET` | shown ONCE when the key is generated — save it | yes |
| `RAZORPAY_WEBHOOK_SECRET` | the secret you type when creating the webhook (§4 step 3) | yes |
| `ADMIN_PASSWORD` | choose a long passphrase — this opens sassmiglobal.com/admin | yes |
| `NOTIFY_EMAIL` | where order & query alerts go (comma-separated allowed), e.g. `crunchymakhanaa@gmail.com` | no |
| `RESEND_API_KEY` + `MAIL_FROM` | Resend → API Keys; `MAIL_FROM="Sassmi <orders@sassmiglobal.com>"` after verifying the domain in Resend (Domains → Add → add the DNS records it shows at GoDaddy) | yes |
| *(or)* `GMAIL_USER` + `GMAIL_APP_PASSWORD` | Google Account → Security → 2-Step Verification → App passwords | yes |
| `SITE_URL` | `https://www.sassmiglobal.com` (used in emails) | no |

3. Click **Deploy** (1–3 min). Open the `*.vercel.app` URL, then `/api/health` — expect `{"ok":true,…,"db":"postgres"}`. The tables are created automatically on first request.
4. **Custom domain:** Project → Settings → Domains → add `sassmiglobal.com`; accept "redirect apex → www". Vercel shows an **A** record (apex) and a **CNAME** (www). At GoDaddy → My Products → sassmiglobal.com → DNS: *edit* the existing `A @` (Parked) to Vercel's IP and the existing `CNAME www` to Vercel's target. Propagation < 1 h usually; SSL is automatic.
5. Every later `git push` to `main` redeploys. Env changes need **Deployments → Redeploy**.

## 4. Razorpay: from test to live
1. **Test first:** with `rzp_test_` keys, place an order on the deployed site. Test UPI: `success@razorpay`; test card 4111 1111 1111 1111 (any future expiry/CVV, any OTP).
2. **KYC (live keys):** Dashboard → Account & Settings → Activate. Business type **Proprietorship**; documents: proprietor PAN + Aadhaar, GST certificate (07ACJPJ0611R2ZE), FSSAI licence (D2), Kotak account (name must match the PAN/GST name exactly), Udyam certificate helps as second business proof. Website field = `https://www.sassmiglobal.com` — the site must be live with About/Contact/Terms/Privacy/Refund/Shipping pages (all present in the footer).
3. **Webhook:** Dashboard → Webhooks → Add: URL `https://www.sassmiglobal.com/api/razorpay/webhook`, secret = any long string (put the same in `RAZORPAY_WEBHOOK_SECRET`), events `order.paid`, `payment.captured`, `payment.failed`. Create one for Test mode and one for Live mode.
4. **Go live:** replace the two keys in Vercel with `rzp_live_…` values → Redeploy. Fees: 2% + GST per transaction; new merchants get 0% platform fee for 90 days / ₹5 lakh (2026 offer). Settlement T+2 working days by default.

## 5. Day-to-day operation
- **Orders, reviews, queries, subscribers:** `https://www.sassmiglobal.com/admin` (password = `ADMIN_PASSWORD`). Reviews appear on the site only after you press **Approve**. Queries have ticket numbers (customers receive an acknowledgement email automatically; the Consumer Protection Rules require a reply within 48 h and resolution within a month).
- **Every paid order** emails the customer a receipt and emails `NOTIFY_EMAIL` the full shipping details with a WhatsApp link to the buyer.
- **Marketplace links** (Amazon/Flipkart/Blinkit/Zepto): paste URLs into `shared/config.ts → channels`; until then the site shows "Listing coming soon".
- **Content edits** (prices, copy, flavours): `shared/products.ts` and `shared/config.ts`. Policies: `src/content/policies/*.md`. Push to GitHub → live in 2 minutes.
- **Backups:** Supabase → Database → Backups (daily on Pro). Orders are also in the notification emails.

## 6. What is intentionally NOT built yet
- Shipping-partner integration (Shiprocket/Delhivery) — orders are shipped manually from the admin list; add when volume justifies it.
- GST invoice PDF generation — the order email is the receipt; the CA can issue tax invoices from the admin list.
- Cash on delivery (set `codAvailable` when a COD partner exists).
- Customer accounts / order history (email lookup on the order page covers the need).
- Nutrition tables per flavour (need the lab values from the final labels; the product page has a slot in "Ingredients & declarations").

## 7. Claims discipline (from the compliance review)
Allowed on the site because they are on the approved packs: Roasted in Olive Oil · Gluten Free · No Added Preservatives · Rich in Protein · the nine on-pack flavour lines · "Rooted in Mithila" as an origin statement. Keep lab reports for gluten (≤20 mg/kg) and protein (≥20% RDA per 100 g) on file per SKU. Never: organic, any health/medical wording, "natural", "fresh", "homemade", "Mithila Makhana" (registered GI), ® before registration, superlatives ("India's best").
