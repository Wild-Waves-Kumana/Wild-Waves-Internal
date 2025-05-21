import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './pages/Signup';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Routes>
      <Route path="/" element={
        isLoggedIn ? <Navigate to="/admindashboard" /> : <Login onLogin={() => setIsLoggedIn(true)} />
      } />
      <Route path="/admindashboard" element={
        isLoggedIn ? <AdminDashboard /> : <Navigate to="/" />
      } />
      <Route path="/signup" element={
        isLoggedIn ? <Signup /> : <Navigate to="/" />
      } />
    </Routes>
  );
}

export default App;
