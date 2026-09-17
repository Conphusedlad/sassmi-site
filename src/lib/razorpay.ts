type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
type RzpOptions = {
  key: string; amount: number; currency: string; name: string; description?: string; image?: string; order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string; backdrop_color?: string }
  modal?: { ondismiss?: () => void; confirm_close?: boolean; escape?: boolean }
  handler: (r: RzpResponse) => void
  retry?: { enabled: boolean; max_count?: number }
}
type RzpInstance = { open(): void; on(event: 'payment.failed', cb: (r: { error: { code: string; description: string; reason: string } }) => void): void; close(): void }
declare global { interface Window { Razorpay?: new (o: RzpOptions) => RzpInstance } }

let loading: Promise<void> | null = null
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { loading = null; reject(new Error('Could not load Razorpay checkout. Check your connection and try again.')) }
      document.body.appendChild(s)
    })
  }
  return loading
}

export async function openRazorpay(o: RzpOptions) {
  await loadRazorpay()
  if (!window.Razorpay) throw new Error('Razorpay unavailable')
  const rzp = new window.Razorpay(o)
  return rzp
}
