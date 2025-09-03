import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token validity
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);

        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          console.warn("Token is expired");
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (err) {
        console.error("Token is invalid:", err);
        localStorage.removeItem('token');
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
