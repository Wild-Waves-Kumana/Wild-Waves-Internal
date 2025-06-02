import { useContext, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, logout } = useContext(UserContext);
  const location = useLocation();
  const alertShownRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        
        const expiryTime = decoded.exp * 1000; // convert to milliseconds
        console.log('Token is valid until:', new Date(expiryTime).toLocaleTimeString());

        if (decoded.exp < now && !alertShownRef.current) {
          alertShownRef.current = true; // ✅ only allow one alert
          alert('Session expired. Please log in again.');
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

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
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
