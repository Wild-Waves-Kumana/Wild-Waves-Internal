// context/UserContext.js
import { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('role') || '';
  });

  // Sync to localStorage when values change
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
  }, [isLoggedIn, username, role]);

  // 🔐 Login method with token decoding
  const login = (token) => {
    try {
      const decoded = jwtDecode(token); // { userId, username, role, iat, exp }
      setIsLoggedIn(true);
      setUsername(decoded.username);
      setRole(decoded.role);

      localStorage.setItem('token', token); // Store token for requests
    } catch (err) {
      console.error('Failed to decode token:', err);
      logout();
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setRole('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  };

  if (isLoggedIn === null) {
    return <div>Loading...</div>; // or show a spinner
  }

  return (
    <UserContext.Provider value={{ isLoggedIn, username, role, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
