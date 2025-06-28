import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { TicketProvider } from './utils/constant/TicketContext/TicketContext.jsx'
import { LeaveProvider } from './utils/constant/LeaveContext/LeaveContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <TicketProvider>
    <LeaveProvider>
    <App />
    </LeaveProvider>
    </TicketProvider>
  </BrowserRouter>,
)
