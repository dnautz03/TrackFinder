import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import TryPage from './TryPage'

const root = document.getElementById('root')!
const page = (
  <StrictMode>
    <TryPage />
  </StrictMode>
)

// Prerendered at build time (see entry-server.tsx); dev renders from scratch.
if (root.hasChildNodes()) hydrateRoot(root, page)
else createRoot(root).render(page)
