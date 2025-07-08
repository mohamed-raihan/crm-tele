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
import { API_URLS } from "@/components/apiconfig/api_urls";

interface NotAnsweredData {
  id: number;
  enquiry_details: {
    id: number;
    candidate_name: string;
    phone: string;
    email: string;
    preferred_course: string;
    enquiry_status: string;
  };
  telecaller_name: string;
  branch_name: string;
  call_type: string;
  call_status: string;
  call_outcome: string;
  call_duration: string | null;
  call_duration_formatted: string | null;
  call_start_time: string;
  call_end_time: string | null;
  notes: string | null;
  follow_up_date: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString();
}

const NotAnsweredPage = () => {
  const [allNotAnswered, setAllNotAnswered] = useState<NotAnsweredData[]>([]);
  const [notAnswered, setNotAnswered] = useState<NotAnsweredData[]>([]);
  const [loading, setLoading] = useState(false);
  type FiltersType = {
    candidate_name: string;
    phone: string;
    email: string;
    call_status: string;
    call_start_time: string;
    telecaller_name: string;
  };
  const defaultFilters: FiltersType = {
    candidate_name: "",
    phone: "",
    email: "",
    call_status: "",
    call_start_time: "",
    telecaller_name: "",
  };
  const [filterInputs, setFilterInputs] = useState<FiltersType>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FiltersType>(defaultFilters);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });

  // Fetch all not-answered calls once
  const fetchAllNotAnswered = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      // Try to fetch a large number of records
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_NOT_ANSWERED}?page=1&limit=10000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.code === 200) {
        setAllNotAnswered(response.data.data || []);
      } else {
        setAllNotAnswered([]);
      }
    } catch (error) {
      setAllNotAnswered([]);
    } finally {
      setLoading(false);
    }
  };

  // Frontend filter logic
  const applyFilters = (rawData: NotAnsweredData[], filters: FiltersType) => {
    return rawData.filter((item) => {
      const { candidate_name, phone, email, call_status, call_start_time, telecaller_name } = filters;
      const matchesCandidate = candidate_name ? item.enquiry_details?.candidate_name?.toLowerCase().includes(candidate_name.toLowerCase()) : true;
      const matchesPhone = phone ? item.enquiry_details?.phone?.includes(phone) : true;
      const matchesEmail = email ? item.enquiry_details?.email?.toLowerCase().includes(email.toLowerCase()) : true;
      const matchesCallStatus = !call_status || call_status === 'all' || item.call_status === call_status;
      const matchesCallStartTime = call_start_time ? (item.call_start_time ? item.call_start_time.slice(0, 10) === call_start_time : false) : true;
      const matchesTelecaller = telecaller_name ? item.telecaller_name?.toLowerCase().includes(telecaller_name.toLowerCase()) : true;
      return matchesCandidate && matchesPhone && matchesEmail && matchesCallStatus && matchesCallStartTime && matchesTelecaller;
    });
  };

  // Frontend pagination logic
  const paginate = (data: NotAnsweredData[], page: number, limit: number) => {
    const totalRecords = data.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      paginated: data.slice(start, end),
      totalPages,
      totalRecords,
    };
  };

  // On mount, fetch all data
  useEffect(() => {
    fetchAllNotAnswered();
  }, []);

  // When allNotAnswered, appliedFilters, or pagination changes, update displayed data
  useEffect(() => {
    setLoading(true);
    const filtered = applyFilters(allNotAnswered, appliedFilters);
    const { paginated, totalPages, totalRecords } = paginate(filtered, pagination.currentPage, pagination.limit);
    setNotAnswered(paginated);
    setPagination((prev) => ({ ...prev, totalPages, totalRecords }));
    setLoading(false);
  }, [allNotAnswered, appliedFilters, pagination.currentPage, pagination.limit]);

  const handleFilterChange = (field: string, value: string) => {
    setFilterInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters({ ...filterInputs });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleReset = () => {
    setFilterInputs(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const exportToExcel = () => {
    const headers = [
      "ID",
      "Candidate Name",
      "Phone",
      "Email",
      "Call Status",
      "Call Outcome",
      "Call Start Time",
      "Telecaller Name",
      "Branch Name",
      "Created At",
    ];
    // Export filtered data, not just current page
    const filtered = applyFilters(allNotAnswered, appliedFilters);
    const csvContent = [
      headers.join(","),
      ...filtered.map((item) => [
        item.id,
        `"${item.enquiry_details?.candidate_name || ""}"`,
        item.enquiry_details?.phone || "",
        `"${item.enquiry_details?.email || ""}"`,
        item.call_status,
        item.call_outcome,
        item.call_start_time,
        item.telecaller_name,
        item.branch_name,
        item.created_at,
      ].join(",")),
    ].join("\n");
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
    <div className="flex-1 flex flex-col">
      {/* <DashboardHeader /> */}
      <main className="flex-1 p-6">
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
                <Label htmlFor="candidate_name">Candidate Name</Label>
                <Input
                  id="candidate_name"
                  value={filterInputs.candidate_name}
                  onChange={(e) => handleFilterChange("candidate_name", e.target.value)}
                  placeholder="Enter candidate name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={filterInputs.phone}
                  onChange={(e) => handleFilterChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={filterInputs.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="call_status">Call Status</Label>
                <Select value={filterInputs.call_status} onValueChange={(value) => handleFilterChange("call_status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_answered">Not Answered</SelectItem>
                    <SelectItem value="do_not_call">Do Not Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="call_start_time">Call Start Time</Label>
                <Input
                  id="call_start_time"
                  type="date"
                  value={filterInputs.call_start_time}
                  onChange={(e) => handleFilterChange("call_start_time", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telecaller_name">Telecaller Name</Label>
                <Input
                  id="telecaller_name"
                  value={filterInputs.telecaller_name}
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
              <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={exportToExcel} disabled={loading || notAnswered.length === 0}>
                <FileDown className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Not Answered Calls </CardTitle>
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
                      <TableHead>Candidate Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Call Status</TableHead>
                      <TableHead>Call Outcome</TableHead>
                      <TableHead>Call Start Time</TableHead>
                      <TableHead>Telecaller Name</TableHead>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notAnswered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No not answered calls found
                        </TableCell>
                      </TableRow>
                    ) : (
                      notAnswered.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{(pagination.currentPage - 1) * pagination.limit + idx + 1}</TableCell>
                          <TableCell>{item.enquiry_details?.candidate_name}</TableCell>
                          <TableCell>{item.enquiry_details?.phone}</TableCell>
                          <TableCell>{item.enquiry_details?.email}</TableCell>
                          <TableCell>{item.call_status}</TableCell>
                          <TableCell>{item.call_outcome}</TableCell>
                          <TableCell>{formatDate(item.call_start_time)}</TableCell>
                          <TableCell>{item.telecaller_name}</TableCell>
                          <TableCell>{item.branch_name}</TableCell>
                          <TableCell>{formatDate(item.created_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <Button
                      key={index}
                      variant={pagination.currentPage === index + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotAnsweredPage; 