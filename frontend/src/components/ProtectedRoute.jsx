import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);

  return isLoggedIn ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
