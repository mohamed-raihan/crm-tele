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
import { API_URLS } from "@/components/apiconfig/api_urls";

interface FollowUpData {
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

const FollowUpsPage = () => {
  const [followUps, setFollowUps] = useState<FollowUpData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNoDataMsg, setShowNoDataMsg] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);
  type FiltersType = {
    candidate_name: string;
    phone: string;
    email: string;
    call_status: string;
    follow_up_date: string;
    telecaller_name: string;
    search: string;
  };
  const defaultFilters: FiltersType = {
    candidate_name: "",
    phone: "",
    email: "",
    call_status: "",
    follow_up_date: "",
    telecaller_name: "",
    search: "",
  };
  const [filterInputs, setFilterInputs] = useState<FiltersType>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FiltersType>(defaultFilters);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });

  // Helper to build query params from filters and pagination
  const buildQueryParams = (filters: FiltersType, page: number, limit: number) => {
    const params = new URLSearchParams();
    if (filters.candidate_name) params.append("candidate_name", filters.candidate_name);
    if (filters.phone) params.append("phone", filters.phone);
    if (filters.email) params.append("email", filters.email);
    if (filters.call_status && filters.call_status !== "all") params.append("call_status", filters.call_status);
    if (filters.follow_up_date) params.append("follow_up_date", filters.follow_up_date);
    if (filters.telecaller_name) params.append("telecaller_name", filters.telecaller_name);
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(page));
    params.append("limit", String(limit));
    return params.toString();
  };

  // Fetch follow-ups from API with filters and pagination
  const fetchFollowUps = async (filters: FiltersType, page: number, limit: number, isInitial = false) => {
    setLoading(true);
    setShowNoDataMsg(false);
    let loadingTimeout = setTimeout(() => setDelayedLoading(true), 1000);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const query = buildQueryParams(filters, page, limit);
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_FOLLOW_UPS}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.code === 200) {
        setFollowUps(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalRecords: response.data.totalRecords || 0,
        }));
        // Show no data message only if filters/search are applied and no data
        if (!isInitial && response.data.data.length === 0) setShowNoDataMsg(true);
        else setShowNoDataMsg(false);
      } else {
        setFollowUps([]);
        setPagination((prev) => ({ ...prev, totalPages: 1, totalRecords: 0 }));
        if (!isInitial) setShowNoDataMsg(true);
        else setShowNoDataMsg(false);
      }
    } catch (error) {
      setFollowUps([]);
      setPagination((prev) => ({ ...prev, totalPages: 1, totalRecords: 0 }));
      if (!isInitial) setShowNoDataMsg(true);
      else setShowNoDataMsg(false);
    } finally {
      clearTimeout(loadingTimeout);
      setLoading(false);
      setDelayedLoading(false);
    }
  };

  // On mount, fetch initial data
  useEffect(() => {
    fetchFollowUps(appliedFilters, pagination.currentPage, pagination.limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When filters or pagination changes, fetch data
  useEffect(() => {
    const isInitial =
      JSON.stringify(appliedFilters) === JSON.stringify(defaultFilters) && pagination.currentPage === 1;
    fetchFollowUps(appliedFilters, pagination.currentPage, pagination.limit, isInitial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, pagination.currentPage, pagination.limit]);

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

  // Helper to safely wrap CSV fields
  function csvSafe(val: any) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  // Export filtered data from API (all records)
  const exportToExcel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      // Use a large limit to get all filtered records
      const query = buildQueryParams(appliedFilters, 1, 10000);
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_FOLLOW_UPS}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data?.data || [];
      const headers = [
        "ID",
        "Candidate Name",
        "Phone",
        "Email",
        "Call Status",
        "Call Outcome",
        "Follow Up Date",
        "Telecaller Name",
        "Branch Name",
        "Created At",
      ];
      const csvContent = [
        headers.join(","),
        ...data.map((item: FollowUpData, index: number) => [
          csvSafe(index + 1),
          csvSafe(item.enquiry_details?.candidate_name),
          // Fix: Prepend tab to phone number to force Excel to treat as text
          csvSafe(item.enquiry_details?.phone ? `\t${item.enquiry_details.phone}` : ""),
          csvSafe(item.enquiry_details?.email),
          csvSafe(item.call_status),
          csvSafe(item.call_outcome),
          csvSafe(formatDate(item.follow_up_date)),
          csvSafe(item.telecaller_name),
          csvSafe(item.branch_name),
          csvSafe(formatDate(item.created_at)),
        ].join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "follow-ups.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort followUps by created_at ascending (oldest first, latest last)
  const sortedFollowUps = [...followUps].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const generatePaginationNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };
  const paginationNumbers = generatePaginationNumbers();

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6">
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
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="not_answered">Not Answered</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="no_response">No Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow Up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={filterInputs.follow_up_date}
                  onChange={(e) => handleFilterChange("follow_up_date", e.target.value)}
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
              <div>
                <Label htmlFor="search">Search All Fields</Label>
                <Input
                  id="search"
                  value={filterInputs.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search candidate, phone, email..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSearch} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
                {delayedLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={loading} className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={exportToExcel} disabled={loading || followUps.length === 0}>
                <FileDown className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Candidate Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Call Status</TableHead>
                      <TableHead>Call Outcome</TableHead>
                      <TableHead>Follow Up Date</TableHead>
                      <TableHead>Telecaller Name</TableHead>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : sortedFollowUps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          {showNoDataMsg ? "No follow-ups found matching your criteria" : null}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedFollowUps.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{(pagination.currentPage - 1) * pagination.limit + idx + 1}</TableCell>
                          <TableCell>{item.enquiry_details?.candidate_name}</TableCell>
                          <TableCell>{item.enquiry_details?.phone}</TableCell>
                          <TableCell>{item.enquiry_details?.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.call_status === 'contacted' ? 'bg-green-100 text-green-800' :
                              item.call_status === 'not_answered' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.call_status}
                            </span>
                          </TableCell>
                          <TableCell>{item.call_outcome}</TableCell>
                          <TableCell>{formatDate(item.follow_up_date)}</TableCell>
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
            {pagination.totalRecords > pagination.limit && (
              <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Prev
                  </Button>
                  {paginationNumbers.map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      ) : (
                        <Button
                          variant={pagination.currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum as number)}
                          className={pagination.currentPage === pageNum ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === Math.ceil(pagination.totalRecords / pagination.limit)}
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

export default FollowUpsPage;