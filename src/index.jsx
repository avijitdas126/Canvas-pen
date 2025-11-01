import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Appbar from './ui/Appbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Appbar />
  </StrictMode>,
)
