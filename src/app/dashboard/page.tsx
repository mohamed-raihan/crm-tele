import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { SystemOverview } from "@/components/SystemOverview";
import { UserPlus, BarChart3, FileText } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardType, setDashboardType] = useState("");
  const [calls, setCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callsPage, setCallsPage] = useState(1);
  const [callsTotalPages, setCallsTotalPages] = useState(1);
  const [callsTotalRecords, setCallsTotalRecords] = useState(0);
  const [callsSearch, setCallsSearch] = useState("");
  const [callsSearchInput, setCallsSearchInput] = useState("");
  const callsDebounceRef = useRef<NodeJS.Timeout | undefined>();

  // Get dashboard type from stats API (assume DashboardStats sets localStorage or similar)
  useEffect(() => {
    const fetchType = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const response = await axiosInstance.get(API_URLS.DASHBOARD.GET_STATS, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data && response.data.dashboard_type) {
          setDashboardType(response.data.dashboard_type);
        }
      } catch {}
    };
    fetchType();
  }, []);

  // Fetch calls data
  useEffect(() => {
    if (dashboardType === "admin") return;
    const fetchCalls = async () => {
      setCallsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const params = new URLSearchParams({
          page: callsPage.toString(),
          limit: "10",
        });
        if (callsSearch) params.append("search", callsSearch);
        const response = await axiosInstance.get(
          `${API_URLS.CALLS.GET_CALLS}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && response.data.data) {
          setCalls(response.data.data);
          setCallsTotalPages(response.data.pagination?.totalPages || 1);
          setCallsTotalRecords(response.data.pagination?.total || 0);
        } else {
          setCalls([]);
          setCallsTotalPages(1);
          setCallsTotalRecords(0);
        }
      } catch {
        setCalls([]);
        setCallsTotalPages(1);
        setCallsTotalRecords(0);
      } finally {
        setCallsLoading(false);
      }
    };
    fetchCalls();
  }, [dashboardType, callsPage, callsSearch]);

  // Debounce search input
  useEffect(() => {
    if (callsDebounceRef.current) clearTimeout(callsDebounceRef.current);
    callsDebounceRef.current = setTimeout(() => {
      setCallsSearch(callsSearchInput);
      setCallsPage(1);
    }, 500);
    return () => {
      if (callsDebounceRef.current) clearTimeout(callsDebounceRef.current);
    };
  }, [callsSearchInput]);

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
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
          {/* Calls Table for Telecaller */}
          {dashboardType !== "admin" && (
            <div className="bg-white rounded-lg shadow p-6 mt-8 overflow-x-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Calls</h3>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full md:w-64"
                  placeholder="Search by candidate name or phone..."
                  value={callsSearchInput}
                  onChange={e => setCallsSearchInput(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-xl overflow-hidden text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">#</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Candidate Name</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Phone</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Call Status</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Call Outcome</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Start Time</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Telecaller</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callsLoading ? (
                      <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td></tr>
                    ) : calls.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-gray-500">No calls found</td></tr>
                    ) : (
                      calls.map((call, idx) => (
                        <tr key={call.id || idx} className="border-t">
                          <td className="px-4 py-2">{(callsPage - 1) * 10 + idx + 1}</td>
                          <td className="px-4 py-2">{call.candidate_name || call.enquiry_details?.candidate_name || "-"}</td>
                          <td className="px-4 py-2">{call.phone || call.enquiry_details?.phone || "-"}</td>
                          <td className="px-4 py-2">{call.call_status || "-"}</td>
                          <td className="px-4 py-2">{call.call_outcome || "-"}</td>
                          <td className="px-4 py-2">{call.call_start_time || "-"}</td>
                          <td className="px-4 py-2">{call.telecaller_name || "-"}</td>
                          <td className="px-4 py-2">{call.branch_name || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {callsTotalPages > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {(callsPage - 1) * 10 + 1} to {Math.min(callsPage * 10, callsTotalRecords)} of {callsTotalRecords} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={callsPage === 1}
                      onClick={() => setCallsPage(callsPage - 1)}
                    >
                      Previous
                    </button>
                    {[...Array(callsTotalPages)].map((_, index) => (
                      <button
                        key={index}
                        className={`px-3 py-1 border rounded ${callsPage === index + 1 ? "bg-violet-100 text-violet-700 border-violet-300" : "hover:bg-gray-50"}`}
                        onClick={() => setCallsPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={callsPage === callsTotalPages}
                      onClick={() => setCallsPage(callsPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
