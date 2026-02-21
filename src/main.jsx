import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BcvProvider } from './context/BcvContext'
import { NotificacionesProvider } from './context/NotificacionesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BcvProvider>
      <NotificacionesProvider>
        <App />
      </NotificacionesProvider>
    </BcvProvider>
  </React.StrictMode>,
)
