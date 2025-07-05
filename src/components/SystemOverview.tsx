import React, { useEffect, useState } from "react";
import { Users, Activity, CheckCircle, Target, TrendingUp, Phone } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";
import { useAuth } from "@/hooks/AuthContext";

export function SystemOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    dashboard_type: "",
    total_calls: 0,
    total_leads: 0,
    pending_followups: 0,
    walkin_list: 0,
    total_telecallers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const response = await axiosInstance.get(API_URLS.DASHBOARD.GET_STATS, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data) {
          setStats(response.data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchStats();
  }, []);

  const isAdmin = user?.role === "Admin";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
      <div className="space-y-3">
        {isAdmin ? (
          // Admin System Overview
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Total Telecallers</span>
              </div>
              <span className="font-medium">{stats.total_telecallers}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Total Calls</span>
              </div>
              <span className="font-medium">{stats.total_calls}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Total Leads</span>
              </div>
              <span className="font-medium">{stats.total_leads}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">System Status</span>
              </div>
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </>
        ) : (
          // Telecaller System Overview
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">My Total Calls</span>
              </div>
              <span className="font-medium">{stats.total_calls}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">My Total Leads</span>
              </div>
              <span className="font-medium">{stats.total_leads}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Pending Followups</span>
              </div>
              <span className="font-medium">{stats.pending_followups}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Walk-in List</span>
              </div>
              <span className="font-medium">{stats.walkin_list}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 