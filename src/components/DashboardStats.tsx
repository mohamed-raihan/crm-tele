import { useEffect, useState } from "react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardStats() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Calls
          </CardTitle>
          <Phone className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.total_calls}
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Leads
          </CardTitle>
          <Users className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.total_leads}
          </div>
        </CardContent>
      </Card>
      {stats.dashboard_type === "admin" ? (
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Telecallers
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.total_telecallers}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Followups
              </CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.pending_followups}
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Walk-in List
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.walkin_list}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
