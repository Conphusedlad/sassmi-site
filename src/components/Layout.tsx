import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { CartDrawer } from './CartDrawer'
import { QuickView } from './QuickView'
import { IntroBurst } from './intro/IntroBurst'
import { Toaster } from '../lib/toast'
import { useScrollManager } from '../lib/scroll'
import { introStore, useIntroVisible } from '../lib/intro'

export function Layout() {
  useScrollManager()
  const intro = useIntroVisible()
  return (
    <>
      {intro && <IntroBurst onDone={introStore.finish} />}
      <Nav />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <QuickView />
      <Toaster />
    </>
  )
}
