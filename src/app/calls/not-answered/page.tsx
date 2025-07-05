import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Search, RefreshCw, PhoneOff } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";

interface NotAnsweredData {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  call_date: string;
  call_time: string;
  reason: string;
  notes: string;
  telecaller_name: string;
  attempt_count: number;
  last_attempt_date: string;
}

const NotAnsweredPage = () => {
  const [notAnswered, setNotAnswered] = useState<NotAnsweredData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    customer_name: "",
    phone_number: "",
    email: "",
    reason: "",
    call_date: "",
    telecaller_name: "",
  });

  const fetchNotAnswered = async (params = {}) => {
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

      const response = await axiosInstance.get(`/calls/not-answered/?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        setNotAnswered(response.data);
      }
    } catch (error) {
      console.error("Error fetching not answered calls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotAnswered();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    fetchNotAnswered();
  };

  const handleReset = () => {
    setFilters({
      customer_name: "",
      phone_number: "",
      email: "",
      reason: "",
      call_date: "",
      telecaller_name: "",
    });
    fetchNotAnswered();
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["ID", "Customer Name", "Phone Number", "Email", "Call Date", "Call Time", "Reason", "Notes", "Telecaller Name", "Attempt Count", "Last Attempt Date"];
    const csvContent = [
      headers.join(","),
      ...notAnswered.map(item => [
        item.id,
        `"${item.customer_name}"`,
        item.phone_number,
        `"${item.email}"`,
        item.call_date,
        item.call_time,
        `"${item.reason}"`,
        `"${item.notes}"`,
        `"${item.telecaller_name}"`,
        item.attempt_count,
        item.last_attempt_date
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "not-answered-calls.csv");
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Answered Calls</h2>
            <p className="text-gray-600">Track and manage calls that were not answered</p>
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
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={filters.reason} onValueChange={(value) => handleFilterChange("reason", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="wrong_number">Wrong Number</SelectItem>
                      <SelectItem value="voicemail">Voicemail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="call_date">Call Date</Label>
                  <Input
                    id="call_date"
                    type="date"
                    value={filters.call_date}
                    onChange={(e) => handleFilterChange("call_date", e.target.value)}
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
                <Button variant="outline" onClick={exportToExcel} disabled={loading || notAnswered.length === 0}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Not Answered Calls ({notAnswered.length})</CardTitle>
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
                        <TableHead>Call Date</TableHead>
                        <TableHead>Call Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Telecaller Name</TableHead>
                        <TableHead>Attempt Count</TableHead>
                        <TableHead>Last Attempt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notAnswered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                            No not answered calls found
                          </TableCell>
                        </TableRow>
                      ) : (
                        notAnswered.map((call) => (
                          <TableRow key={call.id}>
                            <TableCell>{call.id}</TableCell>
                            <TableCell>{call.customer_name}</TableCell>
                            <TableCell>{call.phone_number}</TableCell>
                            <TableCell>{call.email}</TableCell>
                            <TableCell>{call.call_date}</TableCell>
                            <TableCell>{call.call_time}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                call.reason === 'no_answer' ? 'bg-gray-100 text-gray-800' :
                                call.reason === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                                call.reason === 'rejected' ? 'bg-red-100 text-red-800' :
                                call.reason === 'wrong_number' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {call.reason.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{call.notes}</TableCell>
                            <TableCell>{call.telecaller_name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                {call.attempt_count}
                              </span>
                            </TableCell>
                            <TableCell>{call.last_attempt_date}</TableCell>
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

export default NotAnsweredPage; 