const get = (k: string, fallback = '') => (process.env[k] ?? fallback).trim()

export const env = {
  razorpayKeyId: get('RAZORPAY_KEY_ID'),
  razorpayKeySecret: get('RAZORPAY_KEY_SECRET'),
  razorpayWebhookSecret: get('RAZORPAY_WEBHOOK_SECRET'),
  databaseUrl: get('DATABASE_URL'),
  adminPassword: get('ADMIN_PASSWORD'),
  notifyEmail: get('NOTIFY_EMAIL', 'crunchymakhanaa@gmail.com'),
  resendApiKey: get('RESEND_API_KEY'),
  mailFrom: get('MAIL_FROM', 'Sassmi <onboarding@resend.dev>'),
  gmailUser: get('GMAIL_USER'),
  gmailAppPassword: get('GMAIL_APP_PASSWORD'),
  siteUrl: get('SITE_URL', 'http://localhost:5173'),
  isVercel: get('VERCEL') === '1',
  isBun: typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined',
}

export const paymentsEnabled = () => Boolean(env.razorpayKeyId && env.razorpayKeySecret)
