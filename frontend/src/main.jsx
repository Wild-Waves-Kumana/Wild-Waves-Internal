import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
)


