import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState<number>(0);
  const raf = useRef<number>();
  useEffect(() => {
    let start = 0;
    let startTime: number | undefined;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(progress * (target - start) + start));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }
    raf.current = requestAnimationFrame(animate);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

export function DashboardStats() {
  const [stats, setStats] = useState({
    dashboard_type: "",
    total_calls: 0,
    total_leads: 0,
    pending_followups: 0,
    walkin_list: 0,
    total_telecallers: 0,
  });
  const navigate = useNavigate();

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

  // Animated numbers
  const calls = useCountUp(stats.total_calls);
  const leads = useCountUp(stats.total_leads);
  const telecallers = useCountUp(stats.total_telecallers);
  const followups = useCountUp(stats.pending_followups);
  const walkins = useCountUp(stats.walkin_list);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Calls - Always show */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Calls
          </CardTitle>
          <Phone className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => navigate("/calls")} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {calls}
          </div>
        </CardContent>
      </Card>

      {/* Total Leads - Always show */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Leads
          </CardTitle>
          {stats.dashboard_type === "admin" ? (
            <Users className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => navigate("/admin/enquiries")} />
          ) : (
            <Users className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => navigate("/leads")} />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {leads}
          </div>
        </CardContent>
      </Card>

      {/* Conditional third card based on dashboard type */}
      {stats.dashboard_type === "admin" ? (
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Telecallers
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => navigate("/admin/addtelecallers")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {telecallers}
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
              <Target className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => navigate("/follow-ups")} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {followups}
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Walk-in List
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => navigate("/walk-in-list")} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {walkins}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}