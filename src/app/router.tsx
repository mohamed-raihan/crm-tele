import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./dashboard/page";
import CustomersPage from "./customers/page";
import LeadsPage from "./leads/page";
import EnquiryProfilePage from "./leads/profile/[id]/page";
import NotFound from "@/pages/NotFound";
import LoginPage from "./login/page";
import ForgotPasswordPage from "./forgot-password/page";
import { useAuth } from "@/hooks/AuthContext";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
      <Route path="/leads" element={<PrivateRoute><LeadsPage /></PrivateRoute>} />
      <Route path="/leads/profile/:id" element={<PrivateRoute><EnquiryProfilePage /></PrivateRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
