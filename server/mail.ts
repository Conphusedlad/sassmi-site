import { env } from './env'
import { business, formatINR } from '../shared/config'
import type { Order, Query } from './store/types'

type Mail = { to: string | string[]; subject: string; html: string; replyTo?: string }

/** Sends via Resend if configured, else Gmail SMTP (app password), else logs to the console. */
export async function sendMail(m: Mail): Promise<void> {
  const to = Array.isArray(m.to) ? m.to : [m.to]
  try {
    if (env.resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(10_000),
        headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.mailFrom, to, subject: m.subject, html: m.html, reply_to: m.replyTo }),
      })
      if (!res.ok) console.error('[mail] resend failed', res.status, await res.text())
      return
    }
    if (env.gmailUser && env.gmailAppPassword) {
      const nodemailer = await import('nodemailer')
      const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: env.gmailUser, pass: env.gmailAppPassword },
      })
      await transport.sendMail({ from: `"${business.brand}" <${env.gmailUser}>`, to: to.join(','), subject: m.subject, html: m.html, replyTo: m.replyTo })
      return
    }
    console.log(`[mail:console] to=${to.join(',')} subject="${m.subject}"\n${m.html.replace(/<[^>]+>/g, '').slice(0, 600)}`)
  } catch (err) {
    console.error('[mail] error', err)
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const shell = (title: string, body: string) => `
<div style="font-family:Georgia,'Times New Roman',serif;background:#F4EEE1;padding:32px 16px;color:#1E1B16">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E6DCC6">
    <div style="background:#0F1A30;color:#F4EEE1;padding:22px 28px;font-size:26px;letter-spacing:.5px">${esc(business.brand)}<span style="float:right;color:#C9A867;font-size:12px;letter-spacing:3px;margin-top:10px">PREMIUM MAKHANA</span></div>
    <div style="padding:26px 28px;font-size:15px;line-height:1.6">
      <h2 style="margin:0 0 14px;font-weight:500;font-size:22px">${esc(title)}</h2>
      ${body}
    </div>
    <div style="padding:16px 28px;background:#F8F3E8;font-size:12px;color:#6B655A;line-height:1.5">
      ${esc(business.operator.name)} · ${esc(business.operator.address)}<br/>
      FSSAI Lic. No. ${esc(business.operator.fssai)} · ${esc(business.contact.phoneDisplay)} · ${esc(business.contact.email)}
    </div>
  </div>
</div>`

const itemsTable = (o: Order) => `
<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:14px">
  ${o.items.map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #EEE6D6">${esc(i.name)} × ${i.qty}</td><td style="text-align:right;padding:6px 0;border-bottom:1px solid #EEE6D6">${formatINR(i.unitPrice * i.qty)}</td></tr>`).join('')}
  <tr><td style="padding:6px 0">Shipping</td><td style="text-align:right">${o.shippingFee ? formatINR(o.shippingFee) : 'Free'}</td></tr>
  <tr><td style="padding:8px 0;font-weight:600">Total paid</td><td style="text-align:right;font-weight:600">${formatINR(o.amount / 100)}</td></tr>
</table>`

const addressBlock = (o: Order) => {
  const c = o.customer
  return `<p style="margin:0;color:#4A453C">${esc(c.name)}<br/>${esc(c.address1)}${c.address2 ? '<br/>' + esc(c.address2) : ''}<br/>${esc(c.city)}, ${esc(c.state)} – ${esc(c.pincode)}<br/>${esc(c.phone)} · ${esc(c.email)}</p>`
}

export async function sendOrderEmails(o: Order) {
  const customerHtml = shell(`Thank you, ${o.customer.name.split(' ')[0]} — order ${o.id} is confirmed`, `
    <p>Your payment of <strong>${formatINR(o.amount / 100)}</strong> has been received (Razorpay payment ${esc(o.rzpPaymentId ?? '')}).</p>
    ${itemsTable(o)}
    <p><strong>Shipping to</strong></p>${addressBlock(o)}
    <p style="margin-top:16px">We roast in small batches and dispatch within 1–2 working days; delivery usually takes ${esc(business.shipping.etaDays)}. Questions? Reply to this email or WhatsApp us at ${esc(business.contact.phoneDisplay)}.</p>
    <p style="color:#6B655A;font-size:13px">Rooted in Mithila. Crafted for today.</p>`)
  const familyHtml = shell(`New order ${o.id} — ${formatINR(o.amount / 100)}`, `
    ${itemsTable(o)}
    <p><strong>Customer</strong></p>${addressBlock(o)}
    ${o.customer.note ? `<p><strong>Note:</strong> ${esc(o.customer.note)}</p>` : ''}
    <p>Razorpay order ${esc(o.rzpOrderId)} · payment ${esc(o.rzpPaymentId ?? '')} · via ${esc(o.paidVia ?? '')}</p>
    <p><a href="https://wa.me/91${esc(o.customer.phone)}">WhatsApp the customer</a> · <a href="${esc(env.siteUrl)}/admin">Open admin</a></p>`)
  await Promise.all([
    sendMail({ to: o.customer.email, subject: `Sassmi order ${o.id} confirmed`, html: customerHtml, replyTo: business.contact.email }),
    sendMail({ to: env.notifyEmail.split(',').map((s) => s.trim()).filter(Boolean), subject: `🛍️ New Sassmi order ${o.id} — ${formatINR(o.amount / 100)}`, html: familyHtml }),
  ])
}

export async function sendQueryEmails(q: Query) {
  const ack = shell(`We’ve received your message — ticket ${q.ticket}`, `
    <p>Namaste ${esc(q.name.split(' ')[0])}, thank you for writing to ${esc(business.brand)}.</p>
    <p>Your ticket number is <strong>${esc(q.ticket)}</strong>. We acknowledge every query within 48 hours and aim to resolve it within a few working days.</p>
    <p style="color:#4A453C"><em>Topic:</em> ${esc(q.topic)}<br/><em>Your message:</em> ${esc(q.message)}</p>
    <p>Need us faster? WhatsApp ${esc(business.contact.phoneDisplay)}.</p>`)
  const notify = shell(`New website query ${q.ticket} — ${q.topic}`, `
    <p><strong>${esc(q.name)}</strong> · ${esc(q.email)}${q.phone ? ' · ' + esc(q.phone) : ''}</p>
    <p style="white-space:pre-wrap">${esc(q.message)}</p>
    <p><a href="mailto:${esc(q.email)}?subject=Re: ${esc(q.ticket)}">Reply by email</a>${q.phone ? ` · <a href="https://wa.me/91${esc(q.phone)}">WhatsApp</a>` : ''} · <a href="${esc(env.siteUrl)}/admin">Open admin</a></p>`)
  await Promise.all([
    sendMail({ to: q.email, subject: `Sassmi — we’ve received your message (${q.ticket})`, html: ack, replyTo: business.contact.email }),
    sendMail({ to: env.notifyEmail.split(',').map((s) => s.trim()).filter(Boolean), subject: `✉️ Website query ${q.ticket}: ${q.topic}`, html: notify, replyTo: q.email }),
  ])
}
