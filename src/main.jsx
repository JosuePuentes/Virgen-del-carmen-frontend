import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BcvProvider } from './context/BcvContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BcvProvider>
      <App />
    </BcvProvider>
  </React.StrictMode>,
)
