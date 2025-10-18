import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/create-pages/CreateUser';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CreateAdmin from './pages/create-pages/CreateAdmin';
import CreateUser from './pages/create-pages/CreateUser';
import CreateEquipment from './pages/create-pages/CreateEquipment';
import Users from './pages/Users';
import EquipmentUser from './pages/EquipmentUser';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import CreateCompany from './pages/create-pages/CreateCompany';
import CompanyDashboard from './pages/CompanyDashboard';
import CreateVilla from './pages/create-pages/CreateVilla';
import VillaProfile from './pages/VillaProfile';
import UserFaceRegistration from './pages/UserFaceRegistration';
import FoodCreate from './pages/create-pages/CreateFoods';
import CompanyFoods from './pages/food-pages/CompanyFoods';
import CompanyFoodProfile from './pages/food-pages/CompanyFoodProfile';
import FoodMenu from './pages/food-pages/UserFoodMenu';
import SuperadminFoodMenu from './pages/food-pages/SAdminFoodMenu';
import UserFoodProfile from './pages/food-pages/UserFoodProfile';
import UserFoodCart from './pages/food-pages/UserFoodCart';
import UserFoodOrders from './pages/food-pages/UserFoodOrders'; 
import CompanyFoodOrders from './pages/food-pages/CompanyFoodOrders'; 
import SuperAdminProfile from './pages/SAdminProfile';
import SuperadminFoodOrdersHistory from './pages/food-pages/SAdminFoodOrders';
import CompanyProfile from './pages/CompanyProfile';
import Settings from './pages/Settings';

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
        path="/company-dashboard"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <CompanyDashboard />
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
        path="/food-menu"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <FoodMenu />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-food-profile/:foodId"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserFoodProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/food-cart"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserFoodCart />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-food-orders"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserFoodOrders />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/company-food-orders"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CompanyFoodOrders />
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
        path="/create-admin"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <CreateAdmin />
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
        path="/create-villa"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CreateVilla />
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
        path="/superadmin-food-menu"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <SuperadminFoodMenu />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/company-food-profile/:foodId"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
            <Layout>
              <CompanyFoodProfile />
            </Layout>

          </ProtectedRoute>
        }
      />

    <Route
      path="/superadmin-food-orders-history"
      element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <Layout>
            <SuperadminFoodOrdersHistory />
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
        path="/admin-profile/:adminId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <AdminProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin-profile"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <SuperAdminProfile />
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
        path="/company-profile/:companyId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CompanyProfile />
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
        path="/create-user"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CreateUser />
            </Layout> 
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-equipment"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Layout>
              <CreateEquipment />
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

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'superadmin']}>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

    

    </Routes>
  );
}

export default App;
