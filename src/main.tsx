import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

// npm install
// 리덕스, 테일윈드, 라우터, 아이콘, chartjs
// npm install @reduxjs/toolkit react-redux
// npm install react-router-dom
// npm install react-icons lucide-react
// npm install chart.js react-chartjs-2
// npm install tailwindcss @tailwindcss/vite

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* react-router-dom 사용 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
