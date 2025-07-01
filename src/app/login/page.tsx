import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext"; // Update this path

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userRole, setUserRole] = useState("");

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    return "";
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear server error when user starts typing
    if (serverError) setServerError("");

    // Real-time validation
    let error = "";
    if (field === "email") {
      error = validateEmail(value);
    } else if (field === "password") {
      error = validatePassword(value);
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Validate entire form
  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleSubmit = async () => {
    console.log("Form submitted with data:", formData);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      console.log("Attempting login...");
      const result = await login(formData.email, formData.password);
      console.log("Login result:", result);

      if (result.success) {
        // Show success alert
        setUserRole(result.userRole);
        setSuccessMessage("Welcome back! Redirecting to your dashboard...");
        setShowSuccessAlert(true);
      } else {
        // Handle different types of errors from the API
        if (
          result.error.includes("Invalid credentials") ||
          result.error.includes("non_field_errors")
        ) {
          setServerError("Invalid email or password. Please try again.");
        } else {
          setServerError(result.error || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  // Handle Enter key press for form submission
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Success Alert Overlay */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header with animated icon */}
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 to-blue-600 rounded-full mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white animate-pulse" />
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 animate-ping opacity-20"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 animate-ping opacity-30 animation-delay-75"></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Login successful! You can now access your dashboard.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowSuccessAlert(false);
                  // Navigate based on user role from state
                  if (userRole === "Admin") {
                    console.log("Navigating to admin dashboard");
                    navigate("/admin");
                  } else if (userRole === "Telecaller") {
                    console.log("Navigating to telecaller dashboard");
                    navigate("/dashboard"); // Changed from /telecallerdashboard to /dashboard
                  } else {
                    console.log("Unknown role, navigating to default dashboard");
                    navigate("/dashboard");
                  }
                }}
                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:from-violet-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute top-4 left-4 w-2 h-2 bg-violet-400 rounded-full animate-bounce opacity-60"></div>
              <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-60 animation-delay-150"></div>
              <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-violet-300 rounded-full animate-bounce opacity-60 animation-delay-300"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-blue-300 rounded-full animate-bounce opacity-60 animation-delay-500"></div>
            </div>

            {/* Close button - subtle */}
            <button
              onClick={closeSuccessAlert}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TeleCRM</h1>
          <p className="text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-violet-200 focus:border-violet-400"
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-violet-200 focus:border-violet-400"
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {serverError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:from-violet-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium bg-none border-none cursor-pointer underline"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@telecrm.com"
              className="text-violet-600 hover:text-violet-800 font-medium"
            >
              support@telecrm.com
            </a>
          </p>
        </div>
      </div>

      <style>{`
  .animation-delay-75 {
    animation-delay: 75ms;
  }
  
  .animation-delay-150 {
    animation-delay: 150ms;
  }
  
  .animation-delay-300 {
    animation-delay: 300ms;
  }
  
  .animation-delay-500 {
    animation-delay: 500ms;
  }
  
  @media (max-width: 640px) {
    .max-w-sm {
      max-width: calc(100vw - 2rem);
    }
  }
`}</style>
    </div>
  );
};

export default LoginPage;