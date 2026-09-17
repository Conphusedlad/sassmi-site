import { Suspense, lazy } from 'react'
import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router-dom'
import { IS_ARTIFACT } from './lib/env'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

const ProductPage = lazy(() => import('./pages/ProductPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderPage = lazy(() => import('./pages/OrderPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))
const CrunchyPage = lazy(() => import('./pages/CrunchyPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

const Fallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center text-muted">
    <span className="kicker animate-pulse">Loading</span>
  </div>
)
const S = (el: React.ReactNode) => <Suspense fallback={<Fallback />}>{el}</Suspense>

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product/:slug', element: S(<ProductPage />) },
      { path: 'checkout', element: S(<CheckoutPage />) },
      { path: 'order/:id', element: S(<OrderPage />) },
      { path: 'policies/:slug', element: S(<PolicyPage />) },
      { path: 'crunchy-makhana', element: S(<CrunchyPage />) },
      { path: 'admin', element: S(<AdminPage />) },
      { path: '*', element: S(<NotFound />) },
    ],
  },
]

export const router = IS_ARTIFACT ? createHashRouter(routes) : createBrowserRouter(routes)
