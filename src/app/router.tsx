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
import AdminBranches from "../app/admin/branch/page";
import Adminaddtelecallers from "../app/admin/addtelecallers/page";

import NotAnswerPage from "./not-answer/page";
import ReportPage from "./report/page";
import AdsPage from "./admin/ads/page";
import FollowUpsPage from "./calls/follow-ups/page";
import NotAnsweredPage from "./calls/not-answered/page";
import MyJobPage from "./my-job/page";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // Fixed: Check for "Admin" (capitalized) instead of "admin"
  if (user.role !== "Admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function TelecallerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // Fixed: Check for "Telecaller" (capitalized) and redirect to admin if not telecaller
  if (user.role !== "Telecaller") return <Navigate to="/admin" replace />;
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
      <Route path="/admin/ads" element={<AdminRoute><AdsPage /></AdminRoute>} />
      <Route
        path="/admin/branches"
        element={
          <AdminRoute>
            <AdminBranches />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/addtelecallers"
        element={
          <AdminRoute>
            <Adminaddtelecallers />
          </AdminRoute>
        }
      />
      <Route
        path="/leads/profile/:id"
        element={
          <AdminRoute>
            <EnquiryProfilePage />
          </AdminRoute>
        }
      />
      <Route path="/admin/not-answer" element={<AdminRoute><NotAnswerPage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><ReportPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><div>Settings Page</div></AdminRoute>} />

      {/* Telecaller Routes */}
      <Route
        path="/"
        element={
          <TelecallerRoute>
            <DashboardPage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/telecaller-leads/profile/:id"
        element={
          <TelecallerRoute>
            <EnquiryProfilePage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <TelecallerRoute>
            <DashboardPage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <TelecallerRoute>
            <LeadsPage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/call-queue"
        element={
          <TelecallerRoute>
            <div>Call Queue Page</div>
          </TelecallerRoute>
        }
      />
      <Route
        path="/follow-ups"
        element={
          <TelecallerRoute>
            <FollowUps />
          </TelecallerRoute>
        }
      />
      <Route
        path="/calls/follow-ups"
        element={
          <TelecallerRoute>
            <FollowUpsPage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/calls/not-answered"
        element={
          <TelecallerRoute>
            <NotAnsweredPage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/call-history"
        element={
          <TelecallerRoute>
            <div>Call History Page</div>
          </TelecallerRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <TelecallerRoute>
            <div>Schedule Page</div>
          </TelecallerRoute>
        }
      />
      <Route
        path="/completed-calls"
        element={
          <TelecallerRoute>
            <div>Completed Calls Page</div>
          </TelecallerRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <TelecallerRoute>
            <div>Documents Page</div>
          </TelecallerRoute>
        }
      />
      <Route
        path="/leads/profile/:id"
        element={
          <TelecallerRoute>
            <EnquiryProfilePage />
          </TelecallerRoute>
        }
      />
      <Route
        path="/my-job"
        element={<Navigate to="/my-job/remaining" replace />}
      />
      <Route
        path="/my-job/:tab"
        element={
          <TelecallerRoute>
            <MyJobPage />
          </TelecallerRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/customers"
        element={
          <PrivateRoute>
            <CustomersPage />
          </PrivateRoute>
        }
      />

      {/* Redirect based on user role */}
      <Route
        path="/redirect"
        element={
          user ? (
            user.role === "Admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route
        path="/walk-in-list"
        element={
          <TelecallerRoute>
            <WalkInListPage />
          </TelecallerRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
