import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  email: string;
  role: 'admin' | 'telecaller';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fake login (replace with API call later)
  const login = async (email: string, password: string) => {
    // TODO: Replace with real API call
    if (email && password) {
      // Determine role based on email (for demo purposes)
      const role = email.includes('admin') ? 'admin' : 'telecaller';
      const name = email.includes('admin') ? 'Admin User' : 'Telecaller User';
      
      setUser({
        email,
        role,
        name
      });
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