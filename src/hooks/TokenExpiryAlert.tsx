import React from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';

const TokenExpiryAlert = ({ showTokenExpiredAlert, setShowTokenExpiredAlert, onLoginRedirect }) => {
  if (!showTokenExpiredAlert) return null;

  const handleLoginRedirect = () => {
    setShowTokenExpiredAlert(false);
    onLoginRedirect();
  };

  const handleClose = () => {
    setShowTokenExpiredAlert(false);
    onLoginRedirect();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header with animated icon */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-ping opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-ping opacity-30 animation-delay-75"></div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Session Expired
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Your session has expired for security reasons. Please log in again to continue using TeleCRM.
          </p>
        </div>

        {/* Clock icon with time indicator */}
        <div className="flex items-center justify-center mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <Clock className="w-5 h-5 text-orange-600 mr-2" />
          <span className="text-sm font-medium text-orange-800">
            Session valid for 24 hours
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleLoginRedirect}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Log In Again
          </button>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute top-4 left-4 w-2 h-2 bg-orange-400 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-8 right-6 w-1 h-1 bg-red-400 rounded-full animate-bounce opacity-60 animation-delay-150"></div>
          <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce opacity-60 animation-delay-300"></div>
          <div className="absolute bottom-4 right-4 w-1 h-1 bg-red-300 rounded-full animate-bounce opacity-60 animation-delay-500"></div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>

        <style >{`
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
        `}</style>
      </div>
    </div>
  );
};

export default TokenExpiryAlert;