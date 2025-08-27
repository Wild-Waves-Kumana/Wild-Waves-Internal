import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/UserCreation';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminCreation from './pages/AdminCreation';
import UserCreation from './pages/UserCreation';
import EquipmentCreate from './pages/EquipmentCreation';
import Users from './pages/Users';
import EquipmentUser from './pages/EquipmentUser';
import UserProfile from './pages/UserProfile';
import CompanyProfile from './pages/CompanyProfile';
import CreateCompany from './pages/CreateCompany';
import CompanyList from './pages/CompanyList';
import VillaCreate from './pages/VillaCreation';
import VillaProfile from './pages/VillaProfile';
import UserFaceRegistration from './pages/UserFaceRegistration';
import FoodCreate from './pages/CreateFoods';
import CompanyFoods from './pages/foods/CompanyFoods';
import FoodProfile from './pages/foods/FoodProfile';

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
        path="/face-registration/:userId"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserFaceRegistration />
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
        path="/create-foods"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <FoodCreate />
            </Layout>
            
          </ProtectedRoute>
        }
      />

      <Route
        path="/company-foods"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CompanyFoods />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/food-profile/:foodId"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
            <Layout>
              <FoodProfile />
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
        path="/company-profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CompanyProfile />
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
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <Users/>
            </Layout>
          </ProtectedRoute>
        }
      />

    

    </Routes>
  );
}

export default App;
