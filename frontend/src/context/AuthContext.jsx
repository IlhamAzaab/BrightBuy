import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  // Inactivity timer
  useEffect(() => {
    if (!token) return;

    const resetTimer = () => {
      clearTimeout(window.inactivityTimer);
      window.inactivityTimer = setTimeout(() => {
        logout();
      }, 60*60*1000); // 15 minutes inactivity
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer(); // start timer on mount

    return () => {
      clearTimeout(window.inactivityTimer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post("http://localhost:9000/auth/login", { email, password });
    const { accessToken, refreshToken, user } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(accessToken);
    setUser(user);

  };

  const signup = async (name, email, password) => {
    const res = await axios.post("http://localhost:9000/auth/signup", { name, email, password });
    const { accessToken, refreshToken, user } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(accessToken);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
