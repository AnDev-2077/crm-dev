import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import AppRoutes from '@/routes/routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </StrictMode>,
)
