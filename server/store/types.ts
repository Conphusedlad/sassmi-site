export type OrderItem = { slug: string; name: string; qty: number; unitPrice: number }
export type Customer = {
  name: string; email: string; phone: string
  address1: string; address2?: string; city: string; state: string; pincode: string
  note?: string
}
export type OrderStatus = 'created' | 'paid' | 'failed'
export type Order = {
  id: string
  rzpOrderId: string
  rzpPaymentId: string | null
  status: OrderStatus
  amount: number // paise
  subtotal: number // rupees
  shippingFee: number // rupees
  items: OrderItem[]
  customer: Customer
  paidVia: string | null
  createdAt: string
  updatedAt: string
}
export type Review = {
  id: string; name: string; rating: number; text: string; productSlug: string | null
  approved: boolean; createdAt: string
}
export type Query = {
  id: string; ticket: string; name: string; email: string; phone: string | null
  topic: string; message: string; status: 'new' | 'done'; createdAt: string
}
export type Subscriber = { email: string; createdAt: string }

export interface Store {
  init(): Promise<void>
  createOrder(o: Omit<Order, 'createdAt' | 'updatedAt'>): Promise<Order>
  getOrder(rzpOrderId: string): Promise<Order | null>
  getOrderById(id: string): Promise<Order | null>
  markOrderPaid(rzpOrderId: string, paymentId: string, via: string): Promise<Order | null>
  markOrderFailed(rzpOrderId: string): Promise<void>
  listOrders(limit?: number): Promise<Order[]>
  addReview(r: Omit<Review, 'createdAt'>): Promise<Review>
  listReviews(opts: { approvedOnly: boolean; productSlug?: string; limit?: number }): Promise<Review[]>
  setReviewApproved(id: string, approved: boolean): Promise<void>
  deleteReview(id: string): Promise<void>
  addQuery(q: Omit<Query, 'createdAt'>): Promise<Query>
  listQueries(limit?: number): Promise<Query[]>
  setQueryStatus(id: string, status: Query['status']): Promise<void>
  addSubscriber(email: string): Promise<boolean>
  listSubscribers(): Promise<Subscriber[]>
  hasWebhookEvent(eventId: string): Promise<boolean>
  recordWebhookEvent(eventId: string, type: string): Promise<void>
}
