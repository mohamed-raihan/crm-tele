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
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";


const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) return "New password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters long";
    return "";
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
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
    } else if (field === "new_password") {
      error = validatePassword(value);
      // Also re-validate confirm password if it has a value
      if (formData.confirm_password) {
        const confirmError = validateConfirmPassword(
          formData.confirm_password,
          value
        );
        setErrors((prev) => ({ ...prev, confirm_password: confirmError }));
      }
    } else if (field === "confirm_password") {
      error = validateConfirmPassword(value, formData.new_password);
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Validate entire form
  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.new_password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirm_password,
      formData.new_password
    );

    setErrors({
      email: emailError,
      new_password: passwordError,
      confirm_password: confirmPasswordError,
    });

    return !emailError && !passwordError && !confirmPasswordError;
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
      console.log("Attempting password reset...");
      const response = await axiosInstance.post(API_URLS.FORGOT_PASSWORD.POST_FORGOT_PASSWORD, {
        email: formData.email,
        new_password: formData.new_password,
      });

      console.log("Password reset response:", response);

      if (response.status === 200) {
        // Show success alert
        setShowSuccessAlert(true);
      }
    } catch (error) {
      console.error("Password reset error:", error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.log("Error response:", errorData);

        // Handle different types of errors
        if (status === 400 || status === 404) {
          if (errorData.email && errorData.email.includes("never exist")) {
            setServerError(
              "Email address not found. Please check and try again."
            );
          } else if (
            errorData.message &&
            errorData.message.includes("never exist")
          ) {
            setServerError(
              "Email address not found. Please check and try again."
            );
          } else if (errorData.detail) {
            setServerError(errorData.detail);
          } else {
            setServerError(
              "Email address not found. Please check and try again."
            );
          }
        } else {
          const errorMessage =
            errorData?.message ||
            errorData?.detail ||
            errorData?.error ||
            "Password reset failed. Please try again.";
          setServerError(errorMessage);
        }
      } else if (error.request) {
        setServerError(
          "Network error. Please check your connection and try again."
        );
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const handleGoToLogin = () => {
    setShowSuccessAlert(false);
    navigate("/login");
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
                Password Reset Successful!
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Your password has been updated successfully. You can now log in
                with your new password.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleGoToLogin}
                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:from-violet-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go to Login
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
            Reset your password to regain access to your account.
          </p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {/* Back to Login Button */}
              <div className="flex items-center mb-4">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </div>

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

              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="new_password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={(e) =>
                      handleInputChange("new_password", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.new_password
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-violet-200 focus:border-violet-400"
                    }`}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
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
                {errors.new_password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.new_password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm_password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleInputChange("confirm_password", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.confirm_password
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-violet-200 focus:border-violet-400"
                    }`}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirm_password}
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
                disabled={
                  loading ||
                  !formData.email ||
                  !formData.new_password ||
                  !formData.confirm_password
                }
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:from-violet-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-violet-600 hover:text-violet-800 font-medium underline"
              >
                Sign in here
              </button>
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

export default ForgotPasswordPage;