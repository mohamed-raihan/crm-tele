import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./dashboard/page";
import AdminDashboardPage from "./admin/page";
import CustomersPage from "./customers/page";
import LeadsPage from "./leads/page";
import EnquiryProfilePage from "./leads/profile/[id]/page";
import NotFound from "@/pages/NotFound";
import LoginPage from "./login/page";
import ForgotPasswordPage from "./forgot-password/page";
import { useAuth } from "@/hooks/AuthContext";
import ExecutivePage from "./executive/page";
import JobListPage from "./job-list/page";
import WalkInListPage from "./walk-in-list/page";
import FollowUps from "./follow-ups/page";
import CallRegisterPage from "./call-register/page";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function TelecallerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'telecaller') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/enquiries" element={<AdminRoute><LeadsPage /></AdminRoute>} />
      <Route path="/admin/telecallers" element={<AdminRoute><ExecutivePage /></AdminRoute>} />
      <Route path="/admin/jobs" element={<AdminRoute><JobListPage /></AdminRoute>} />
      <Route path="/admin/walk-ins" element={<AdminRoute><WalkInListPage /></AdminRoute>} />
      <Route path="/admin/follow-ups" element={<AdminRoute><FollowUps /></AdminRoute>} />
      <Route path="/admin/call-analytics" element={<AdminRoute><CallRegisterPage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><div>Reports Page</div></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><div>Settings Page</div></AdminRoute>} />
      
      {/* Telecaller Routes */}
      <Route path="/" element={<TelecallerRoute><DashboardPage /></TelecallerRoute>} />
      <Route path="/dashboard" element={<TelecallerRoute><DashboardPage /></TelecallerRoute>} />
      <Route path="/leads" element={<TelecallerRoute><LeadsPage /></TelecallerRoute>} />
      <Route path="/call-queue" element={<TelecallerRoute><div>Call Queue Page</div></TelecallerRoute>} />
      <Route path="/follow-ups" element={<TelecallerRoute><FollowUps /></TelecallerRoute>} />
      <Route path="/call-history" element={<TelecallerRoute><div>Call History Page</div></TelecallerRoute>} />
      <Route path="/schedule" element={<TelecallerRoute><div>Schedule Page</div></TelecallerRoute>} />
      <Route path="/completed-calls" element={<TelecallerRoute><div>Completed Calls Page</div></TelecallerRoute>} />
      <Route path="/documents" element={<TelecallerRoute><div>Documents Page</div></TelecallerRoute>} />
      <Route path="/leads/profile/:id" element={<TelecallerRoute><EnquiryProfilePage /></TelecallerRoute>} />
      
      {/* Shared Routes */}
      <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
      
      {/* Redirect based on user role */}
      <Route path="/redirect" element={
        user ? (
          user.role === 'admin' ? 
            <Navigate to="/admin" replace /> : 
            <Navigate to="/" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
