import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { SystemOverview } from "@/components/SystemOverview";
import { UserPlus, BarChart3, FileText } from "lucide-react";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">System overview and management</p>
          </div>
          <DashboardStats />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <SystemOverview />
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleQuickAction("/admin/addtelecallers")}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">Add New Telecaller</div>
                      <div className="text-sm text-gray-500">Create a new user account</div>
                    </div>
                  </div>
                </button> 
                <button 
                  onClick={() => handleQuickAction("/admin/reports")}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">Generate Reports</div>
                      <div className="text-sm text-gray-500">View performance analytics</div>
                    </div>
                  </div>
                </button>
                <button 
                  onClick={() => handleQuickAction("/admin/enquiries")}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">Enquiries</div>
                      <div className="text-sm text-gray-500">View all enquiries</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage; 