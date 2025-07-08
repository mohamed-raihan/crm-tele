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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <SystemOverview />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleQuickAction("/leads")}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-row items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-gray-900">My Enquiry</div>
                    <div className="text-sm text-gray-500">View and manage your enquiries</div>
                  </div>
                </div>
              </button>
              <button 
                onClick={() => handleQuickAction("/calls")}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-row items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-gray-900">Calls</div>
                    <div className="text-sm text-gray-500">View and manage calls</div>
                  </div>
                </div>
              </button>
              <button 
                onClick={() => handleQuickAction("/walk-in-list")}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-row items-center gap-3">
                  <UserPlus className="w-5 h-5 text-gray-500" />
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-gray-900">Walk in List</div>
                    <div className="text-sm text-gray-500">View walk-in candidates</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
