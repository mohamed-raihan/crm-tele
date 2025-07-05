import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Search, RefreshCw } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";

interface FollowUpData {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  status: string;
  follow_up_date: string;
  notes: string;
  created_date: string;
  telecaller_name: string;
}

const FollowUpsPage = () => {
  const [followUps, setFollowUps] = useState<FollowUpData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    status: "",
    follow_up_date: "",
    telecaller_name: "",
  });

  const fetchFollowUps = async (params = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries({ ...filters, ...params }).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await axiosInstance.get(`/calls/follow-ups/?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        setFollowUps(response.data);
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    fetchFollowUps();
  };

  const handleReset = () => {
    setFilters({
      customer_name: "",
      phone_number: "",
      email: "",
      status: "",
      follow_up_date: "",
      telecaller_name: "",
    });
    fetchFollowUps();
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["ID", "Customer Name", "Phone Number", "Email", "Status", "Follow Up Date", "Notes", "Created Date", "Telecaller Name"];
    const csvContent = [
      headers.join(","),
      ...followUps.map(item => [
        item.id,
        `"${item.customer_name}"`,
        item.phone_number,
        `"${item.email}"`,
        item.status,
        item.follow_up_date,
        `"${item.notes}"`,
        item.created_date,
        `"${item.telecaller_name}"`
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "follow-ups.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Follow-ups</h2>
            <p className="text-gray-600">Manage and track follow-up calls</p>
          </div>

          {/* Filters Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={filters.customer_name}
                    onChange={(e) => handleFilterChange("customer_name", e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={filters.phone_number}
                    onChange={(e) => handleFilterChange("phone_number", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={filters.email}
                    onChange={(e) => handleFilterChange("email", e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="follow_up_date">Follow Up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={filters.follow_up_date}
                    onChange={(e) => handleFilterChange("follow_up_date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="telecaller_name">Telecaller Name</Label>
                  <Input
                    id="telecaller_name"
                    value={filters.telecaller_name}
                    onChange={(e) => handleFilterChange("telecaller_name", e.target.value)}
                    placeholder="Enter telecaller name"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" onClick={exportToExcel} disabled={loading || followUps.length === 0}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-ups ({followUps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Follow Up Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Telecaller Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {followUps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            No follow-ups found
                          </TableCell>
                        </TableRow>
                      ) : (
                        followUps.map((followUp) => (
                          <TableRow key={followUp.id}>
                            <TableCell>{followUp.id}</TableCell>
                            <TableCell>{followUp.customer_name}</TableCell>
                            <TableCell>{followUp.phone_number}</TableCell>
                            <TableCell>{followUp.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                followUp.status === 'completed' ? 'bg-green-100 text-green-800' :
                                followUp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {followUp.status}
                              </span>
                            </TableCell>
                            <TableCell>{followUp.follow_up_date}</TableCell>
                            <TableCell className="max-w-xs truncate">{followUp.notes}</TableCell>
                            <TableCell>{followUp.created_date}</TableCell>
                            <TableCell>{followUp.telecaller_name}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FollowUpsPage; 