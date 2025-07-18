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

interface WalkInData {
  id: number;
  enquiry_id: number;
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

const WalkInListPage = () => {
  const [walkIns, setWalkIns] = useState<WalkInData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNoDataMsg, setShowNoDataMsg] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);

  type FiltersType = {
    search: string;
    branch_name: string;
    telecaller_name: string;
    call_status: string;
    follow_up_date: string;
    ordering: string;
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
  };

  const defaultFilters: FiltersType = {
    search: "",
    branch_name: "",
    telecaller_name: "",
    call_status: "",
    follow_up_date: "",
    ordering: "-call_start_time",
    start_date: "",
    end_date: "",
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
    if (filters.search) params.append("search", filters.search);
    if (filters.branch_name) params.append("branch_name", filters.branch_name);
    if (filters.telecaller_name) params.append("telecaller_name", filters.telecaller_name);
    if (filters.call_status) params.append("call_status", filters.call_status);
    if (filters.follow_up_date) params.append("follow_up_date", filters.follow_up_date);
    if (filters.ordering) params.append("ordering", filters.ordering);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    params.append("page", String(page));
    params.append("limit", String(limit));
    return params.toString();
  };

  // Fetch walk-ins from API with filters and pagination
  const fetchWalkIns = async (filters: FiltersType, page: number, limit: number, isInitial = false) => {
    setLoading(true);
    setShowNoDataMsg(false);
    let loadingTimeout = setTimeout(() => setDelayedLoading(true), 1000);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const query = buildQueryParams(filters, page, limit);
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_WALKIN_LIST}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.code === 200) {
        setWalkIns(response.data.data || []);
        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: Math.ceil(response.data.pagination.total / response.data.pagination.limit) || 1,
            totalRecords: response.data.pagination.total || 0,
          }));
        } else {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.totalPages || 1,
            totalRecords: response.data.totalRecords || 0,
          }));
        }
        // Show no data message only if filters/search are applied and no data
        if (!isInitial && response.data.data.length === 0) setShowNoDataMsg(true);
        else setShowNoDataMsg(false);
      } else {
        setWalkIns([]);
        setPagination((prev) => ({ ...prev, totalPages: 1, totalRecords: 0 }));
        if (!isInitial) setShowNoDataMsg(true);
        else setShowNoDataMsg(false);
      }
    } catch (error) {
      setWalkIns([]);
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
    fetchWalkIns(appliedFilters, pagination.currentPage, pagination.limit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When filters or pagination changes, fetch data
  useEffect(() => {
    const isInitial =
      JSON.stringify(appliedFilters) === JSON.stringify(defaultFilters) && pagination.currentPage === 1;
    fetchWalkIns(appliedFilters, pagination.currentPage, pagination.limit, isInitial);
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
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_WALKIN_LIST}?${query}`, {
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
        "Telecaller",
        "Branch",
        "Call Type",
        "Call Status",
        "Call Outcome",
        "Created At",
      ];
      const csvContent = [
        headers.join(","),
        ...data.map((item: WalkInData, index: number) => [
          csvSafe(index + 1),
          csvSafe(item.enquiry_details?.candidate_name),
          csvSafe(item.enquiry_details?.phone),
          csvSafe(item.enquiry_details?.email),
          csvSafe(item.telecaller_name),
          csvSafe(item.branch_name),
          csvSafe(item.call_type),
          csvSafe(item.call_status),
          csvSafe(item.call_outcome),
          csvSafe(formatDate(item.created_at)),
        ].join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "walkin-list.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting walk-in list:', error);
    } finally {
      setLoading(false);
    }
  };


  
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Walk-in List</h2>
          <p className="text-gray-600">Track and manage walk-in enquiries</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={filterInputs.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by candidate name or phone..."
                />
              </div>
              <div>
                <Label htmlFor="branch_name">Branch Name</Label>
                <Input
                  id="branch_name"
                  value={filterInputs.branch_name}
                  onChange={(e) => handleFilterChange("branch_name", e.target.value)}
                  placeholder="Enter branch name..."
                />
              </div>
              <div>
                <Label htmlFor="telecaller_name">Telecaller Name</Label>
                <Input
                  id="telecaller_name"
                  value={filterInputs.telecaller_name}
                  onChange={(e) => handleFilterChange("telecaller_name", e.target.value)}
                  placeholder="Enter telecaller name..."
                />
              </div>
              <div>
                <Label htmlFor="call_status">Call Status</Label>
                <Select
                  value={filterInputs.call_status}
                  onValueChange={(value) => handleFilterChange("call_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacted">contacted</SelectItem>
                    <SelectItem value="Not Answered">Not Answered</SelectItem>
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
              <div className="flex gap-3 w-full">
                <div className="w-1/2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={filterInputs.start_date}
                    onChange={(e) => handleFilterChange("start_date", e.target.value)}
                    placeholder="Start date"
                  />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={filterInputs.end_date}
                    onChange={(e) => handleFilterChange("end_date", e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </div>
              {/* <div>
                <Label htmlFor="ordering">Order By</Label>
                <Select value={filterInputs.ordering} onValueChange={(value) => handleFilterChange("ordering", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-call_start_time">Newest First</SelectItem>
                    <SelectItem value="call_start_time">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
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
              {/* <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={exportToExcel} disabled={loading || walkIns.length === 0}>
                <FileDown className="w-4 h-4 mr-2" />
                Export Excel
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Walk-in List </CardTitle>
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
                      <TableHead>Telecaller</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Call Type</TableHead>
                      <TableHead>Call Status</TableHead>
                      <TableHead>Call Outcome</TableHead>
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
                    ) : walkIns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          {showNoDataMsg ? "No walk-in data found matching your criteria" : null}
                        </TableCell>
                      </TableRow>
                    ) : (
                      walkIns.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell>{(pagination.currentPage - 1) * pagination.limit + idx + 1}</TableCell>
                          <TableCell>{item.enquiry_details?.candidate_name}</TableCell>
                          <TableCell>{item.enquiry_details?.phone}</TableCell>
                          <TableCell>{item.enquiry_details?.email}</TableCell>
                          <TableCell>{item.telecaller_name}</TableCell>
                          <TableCell>{item.branch_name}</TableCell>
                          <TableCell>{item.call_type}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.call_status === 'contacted' ? 'bg-green-100 text-green-800' :
                                item.call_status === 'not_contacted' ? 'bg-yellow-100 text-yellow-800' :
                                  item.call_status === 'not_answered' ? 'bg-red-100 text-red-800' :
                                    item.call_status === 'do_not_call' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                              }`}>
                              {item.call_status}
                            </span>
                          </TableCell>
                          <TableCell>{item.call_outcome}</TableCell>
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

export default WalkInListPage;