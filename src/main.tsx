import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FilterPage from './FilterPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FilterPage />
  </StrictMode>,
)