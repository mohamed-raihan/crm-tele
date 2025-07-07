import { API_URLS } from "@/components/apiconfig/api_urls";
import axiosInstance from "@/components/apiconfig/axios";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  role: string;
  email: string;
  telecaller?: {
    id: number;
    account: number;
    email: string;
    name: string;
    contact: string;
    address: string;
    branch: number | null;
    branch_name: string | null;
    role: number;
    status: string;
    created_date: string;
    created_by: string;
    password_display: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; userRole?: string }>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  token: string | null;
    showTokenExpiredAlert: boolean; // Add this
  setShowTokenExpiredAlert: (show: boolean) => void; // Add this

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [showTokenExpiredAlert, setShowTokenExpiredAlert] = useState(false);

  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  };

  // Check for existing login on app load
  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user_data");
    const savedIsLoggedIn = localStorage.getItem("isLoggedIn");

    if (savedToken && savedUser && savedIsLoggedIn === "true") {
      if (isTokenExpired(savedToken)) {
        // Token expired, show alert and logout
        setShowTokenExpiredAlert(true);
        logout();
      } else {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);

        // Set up token expiry check
        setupTokenExpiryCheck(savedToken);
      }
    }
  }, []);

  const setupTokenExpiryCheck = (token) => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Set timeout to show alert 5 minutes before expiry
      const alertTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

      setTimeout(() => {
        if (isLoggedIn) {
          setShowTokenExpiredAlert(true);
          logout();
        }
      }, alertTime);
    } catch (error) {
      console.error("Error setting up token expiry check:", error);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Making login request with:", { email, password });

      const response = await axiosInstance.post(API_URLS.LOGIN.POST_LOGIN, {
        email,
        password,
      });

      console.log("Login response:", response);
      const data = response.data;

      if (response.status === 200 && data.access) {
        const accessToken = data.access;

        const userData = {
          role: data.user.role,
          email: email,
          telecaller:
            data.user.role === "Telecaller" ? data.user.telecaller : undefined,
        };

        // Save to localStorage - FIX: Save user data properly
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user_data", JSON.stringify(userData)); 
        localStorage.setItem("isLoggedIn", "true");

        // Update state
        setToken(accessToken);
        setUser(userData);
        setIsLoggedIn(true);

        // Setup token expiry monitoring
        setupTokenExpiryCheck(accessToken);

        return {
          success: true,
          userRole: data.user.role,
        };
      } else {
        return {
          success: false,
          error: data.message || "Login failed. Please check your credentials.",
        };
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.log("Error response:", errorData);

        // Handle 400 Bad Request (Invalid credentials)
        if (status === 400) {
          if (
            errorData.non_field_errors &&
            errorData.non_field_errors.length > 0
          ) {
            const errorMessage = errorData.non_field_errors[0];
            if (errorMessage.includes("Invalid credentials")) {
              return {
                success: false,
                error: "Invalid email or password. Please try again.",
              };
            }
            return {
              success: false,
              error: errorMessage,
            };
          }
          return {
            success: false,
            error: "Invalid email or password. Please try again.",
          };
        }

        // Handle other status codes
        const errorMessage =
          errorData?.message ||
          errorData?.detail ||
          errorData?.error ||
          `Server error: ${status}`;

        return {
          success: false,
          error: errorMessage,
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data"); 
    localStorage.removeItem("isLoggedIn");

    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  // Password reset - implement with real API call when needed
  const resetPassword = async (email: string, newPassword: string) => {
    try {
      // TODO: Replace with actual password reset API endpoint
      // const response = await axiosInstance.post(API_URLS.RESET_PASSWORD, {
      //   email,
      //   newPassword,
      // });
      // return response.status === 200;

      // Temporary implementation
      return !!(email && newPassword);
    } catch (error) {
      console.error("Password reset error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        resetPassword,
        token,
        showTokenExpiredAlert,
        setShowTokenExpiredAlert,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
