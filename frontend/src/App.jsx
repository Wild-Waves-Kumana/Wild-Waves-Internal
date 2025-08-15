import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/UserCreation';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/unauthorized';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminCreation from './pages/AdminCreation';
import UserCreation from './pages/UserCreation';
import EquipmentCreate from './pages/EquipmentCreation';
import UserList from './pages/UserList';
import EquipmentUser from './pages/EquipmentUser';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import CreateCompany from './pages/CreateCompany';
import CompanyList from './pages/CompanyList';
import VillaCreate from './pages/VillaCreation';
import VillaList from './pages/VillaList';
import VillaProfile from './pages/VillaProfile';

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
        path="/create-company"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <CreateCompany />
            </Layout>
            
          </ProtectedRoute>
        }
      />
      <Route
        path="/company-list"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <CompanyList />
            </Layout>
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipment"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <EquipmentUser />
            </Layout>
            
          </ProtectedRoute>
        }
      />
      <Route
        path="/admincreation"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <AdminCreation />
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
        path="/villa-create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <VillaCreate />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-profile/:userId"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
            <Layout>
              <UserProfile />
            </Layout>
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <AdminProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/villa-profile/:villa_id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <VillaProfile />
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
        path="/usercreation"
        element={
          <ProtectedRoute>
            <UserCreation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipment-create"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <EquipmentCreate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/userlist"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <UserList />
            </Layout>
          </ProtectedRoute>
        }
      />

    
      <Route
        path="/villalist"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <VillaList />
            </Layout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
