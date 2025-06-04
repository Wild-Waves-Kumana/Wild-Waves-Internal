import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/unauthorized';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  const { isLoggedIn, login, role } = useContext(UserContext);

  // 🔁 Determine where to redirect on login
  const getDashboardRedirect = () => {
    if (role === 'user') return '/userdashboard';
    if (role === 'admin') return '/admindashboard';
    if (role === 'superadmin') return '/superadmindashboard';  
    return '/unauthorized';
  };

  return (
    <Routes>
      <Route  path="/" element={isLoggedIn ? <Navigate to={getDashboardRedirect()} /> : <Login onLogin={login} />} />
      

      //Protected routes
      <Route path="/unauthorized" 
        element={
        <ProtectedRoute>
          <Unauthorized />
        </ProtectedRoute>} 
      />

      <Route
        path="/superadmindashboard"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <SuperAdminDashboard />
            </Layout>
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/admindashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
            
          </ProtectedRoute>
        }
      />

       <Route
        path="/userdashboard"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
            <Layout>
              <UserDashboard />
            </Layout>
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
