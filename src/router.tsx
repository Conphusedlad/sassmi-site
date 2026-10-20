import { Suspense, lazy, useEffect } from 'react'
import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router-dom'
import { USE_HASH_ROUTER } from './lib/env'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

// Literal on purpose: Vite replaces it at build time, so the Shopify build drops the checkout, order and admin pages
// (and Razorpay) from the bundle — Shopify's own pages do those jobs there.
const SHOPIFY = import.meta.env.VITE_TARGET === 'shopify'

const ProductPage = lazy(() => import('./pages/ProductPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))
const CrunchyPage = lazy(() => import('./pages/CrunchyPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ownPages = SHOPIFY ? null : {
  Checkout: lazy(() => import('./pages/CheckoutPage')),
  Order: lazy(() => import('./pages/OrderPage')),
  Admin: lazy(() => import('./pages/AdminPage')),
}

const Fallback = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex min-h-[60vh] items-center justify-center text-muted">
    <span className="kicker animate-pulse">{label}</span>
  </div>
)
const S = (el: React.ReactNode) => <Suspense fallback={<Fallback />}>{el}</Suspense>

/** Leaves the app for one of Shopify's own pages (checkout, account, admin). */
function Handoff({ to, label }: { to: string; label: string }) {
  useEffect(() => { window.location.replace(to) }, [to])
  return <Fallback label={label} />
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product/:slug', element: S(<ProductPage />) },
      ...(ownPages
        ? [
            { path: 'checkout', element: S(<ownPages.Checkout />) },
            { path: 'order/:id', element: S(<ownPages.Order />) },
            { path: 'admin', element: S(<ownPages.Admin />) },
          ]
        : [
            { path: 'checkout', element: <Handoff to="/checkout" label="Opening secure checkout" /> },
            { path: 'order/:id', element: <Handoff to="/account" label="Opening your account" /> },
            { path: 'admin', element: <Handoff to="/admin" label="Opening Shopify admin" /> },
          ]),
      { path: 'policies/:slug', element: S(<PolicyPage />) },
      { path: 'crunchy-makhana', element: S(<CrunchyPage />) },
      { path: '*', element: S(<NotFound />) },
    ],
  },
]

export const router = USE_HASH_ROUTER ? createHashRouter(routes) : createBrowserRouter(routes)
