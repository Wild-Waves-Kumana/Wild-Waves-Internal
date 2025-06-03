import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/unauthorized';
import UserDashboard from './pages/UserDashboard';

function App() {
  const { isLoggedIn, login, role } = useContext(UserContext);

  // 🔁 Determine where to redirect on login
  const getDashboardRedirect = () => {
    if (role === 'admin') return '/admindashboard';
    if (role === 'superadmin') return '/superadminpanel'; // if used
    return '/userdashboard';
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to={getDashboardRedirect()} /> : <Login onLogin={login} />} 
      />
      <Route path="/unauthorized" element={<Unauthorized />} />


      //Protected routes
      <Route
        path="/admindashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

       <Route
        path="/userdashboard"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <ProtectedRoute>
            <Signup />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
