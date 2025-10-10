import { useContext, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../context/UserContext';
import Toaster from './common/Toaster';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, logout, role } = useContext(UserContext);
  const location = useLocation();
  const alertShownRef = useRef(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        const expiryTime = decoded.exp * 1000; // convert to milliseconds
        console.log('Token is valid until:', new Date(expiryTime).toLocaleTimeString());

        if (decoded.exp < now && !alertShownRef.current) {
          alertShownRef.current = true;
          setToast({ show: true, message: 'Session expired. Please log in again.', type: 'error' });
          logout();
        }
      } catch (err) {
        console.error('Invalid token:', err);
        logout();
      }
    } else {
      logout();
    }
  }, [logout, location.pathname]);

  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  if (!isLoggedIn) {
    return (
      <>
        <Toaster
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={hideToast}
          duration={4000}
          position="top-right"
        />
        <Navigate to="/" replace />
      </>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      <Toaster
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
        duration={4000}
        position="top-right"
      />
      {children}
    </>
  );
};

export default ProtectedRoute;



// import { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { UserContext } from '../context/UserContext';

// const ProtectedRoute = ({ children }) => {
//   const { isLoggedIn } = useContext(UserContext);

//   return isLoggedIn ? children : <Navigate to="/" />;
// };

// export default ProtectedRoute;
