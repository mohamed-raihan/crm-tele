
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./dashboard/page";
import CustomersPage from "./customers/page";
import LeadsPage from "./leads/page";
import NotFound from "@/pages/NotFound";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/leads" element={<LeadsPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
