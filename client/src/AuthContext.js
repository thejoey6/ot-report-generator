import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    navigate("/");

    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };


  const fetchAccessToken = async () => {
    try {
      const res = await fetch("/api/users/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Refresh token expired");

      const data = await res.json();
      const token = data.accessToken;

      setAccessToken(token);

      const decoded = jwtDecode(token);
      setUser(decoded);

      // Schedule next refresh slightly before expiry
      const timeUntilExpiry = decoded.exp * 1000 - Date.now() - 10000; // 10s early
      setTimeout(fetchAccessToken, timeUntilExpiry);

    } catch (err) {
      console.warn("Session expired or refresh failed. Logging out.");
      logout();
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAccessToken();
  }, []);


  // --- Login function ---
  const login = async (email, password) => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      const token = data.accessToken;

      setAccessToken(token);
      const decoded = jwtDecode(token);
      setUser(decoded);

      // Schedule next refresh slightly before expiry
      const timeUntilExpiry = decoded.exp * 1000 - Date.now() - 10000;
      setTimeout(fetchAccessToken, timeUntilExpiry);

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
