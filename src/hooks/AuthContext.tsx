import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  // Fake login (replace with API call later)
  const login = async (email: string, password: string) => {
    // TODO: Replace with real API call
    if (email && password) {
      setUser(email);
      return true;
    }
    return false;
  };

  // Fake logout
  const logout = () => setUser(null);

  // Fake password reset (replace with API call later)
  const resetPassword = async (email: string, newPassword: string) => {
    // TODO: Replace with real API call
    return !!(email && newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}; 