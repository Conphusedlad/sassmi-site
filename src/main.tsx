import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MotionGlobalConfig } from 'framer-motion'
import './index.css'
import { router } from './router'

// QA aid: ?noanim=1 skips entrance animations (used for screenshots and slow devices)
if (new URLSearchParams(location.search).has('noanim')) MotionGlobalConfig.skipAnimations = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
