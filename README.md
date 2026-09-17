# Sassmi — website

Premium makhana D2C site for SASSMI Global / JJ Mithika Foods. React 19 + Vite + Tailwind 4 + Framer Motion front-end; Hono API (Vercel Function) with Razorpay payments, Postgres (Supabase) or SQLite (local), email via Resend or Gmail SMTP.

- **Run locally:** `bun run dev` → http://localhost:5173 (API on :8787, SQLite in `data/`). Needs Bun 1.3+.
- **Deploy:** see `LAUNCH-KIT.md` (GitHub → Vercel import, env vars, Razorpay KYC, GoDaddy DNS).
- **Preview artifact build:** `bun run build:artifact` → `dist-artifact/` (relative paths + hash router, simulated checkout).
- **Edit content:** `shared/products.ts` (flavours, prices), `shared/config.ts` (company facts, shipping, marketplace links), `src/content/policies/*.md`.
- **Structure:** `src/` SPA (sections, pages, components, lib) · `server/` Hono app, store, mail, razorpay · `api/index.ts` Vercel entry · `shared/` catalogue + config used by both.
