/**Holds authentication state (logged in user, token, etc.)
Can provide login(), logout(), signup() functions globally.**/
import React, { createContext, useState } from "react";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Simulate API login (replace with real API)
    if (email === "ilhamazaab@gmail.com" && password === "123456") {
      setUser({ email });
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (name, email, password) => {
  // Simulate API signup (replace with real API later)
    if (email && password) {
      setUser({ name, email });
    } else {
      throw new Error("Signup failed");
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login,signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
