import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URLS } from "@/components/apiconfig/api_urls";
import axiosInstance from "@/components/apiconfig/axios";
import { RefreshCw, Download } from "lucide-react";

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
  total: number;
  page: number;
  limit: number;
}

const WalkInListPage = () => {
  const [walkIns, setWalkIns] = useState<WalkInData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10 });

  const fetchWalkIns = async (page = 1, searchValue = search) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchValue) params.append("search", searchValue);
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_WALKIN_LIST}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.code === 200) {
        setWalkIns(response.data.data || []);
        if (response.data.pagination) {
          setPagination((prev) => ({ ...prev, ...response.data.pagination }));
        } else {
          setPagination((prev) => ({ ...prev, total: response.data.data?.length || 0 }));
        }
      } else {
        setWalkIns([]);
      }
    } catch {
      setWalkIns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkIns(1);
    // eslint-disable-next-line
  }, []);

  const handleSearch = () => {
    fetchWalkIns(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchWalkIns(newPage, search);
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.append("search", search);
      params.append("export", "excel");
      const response = await axiosInstance.get(`${API_URLS.CALLS.GET_WALKIN_LIST}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      });
      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `walkin_list_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Optionally show a toast or error
      console.error("Failed to export walk-in list", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Walk-in List</h1>
          <p className="text-gray-600">Track and manage walk-in enquiries</p>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Walk-in List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row items-center gap-2 mb-4">
              <Input
                type="text"
                placeholder="Search by candidate name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline" className="w-auto">
                Search
              </Button>
              <Button onClick={exportToExcel} className="w-auto flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4" /> Export to Excel
              </Button>
            </div>
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
                    <TableHead>Start Time</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : walkIns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        No walk-in data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    walkIns.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.enquiry_details?.candidate_name}</TableCell>
                        <TableCell>{item.enquiry_details?.phone}</TableCell>
                        <TableCell>{item.enquiry_details?.email}</TableCell>
                        <TableCell>{item.telecaller_name}</TableCell>
                        <TableCell>{item.branch_name}</TableCell>
                        <TableCell>{item.call_type}</TableCell>
                        <TableCell>{item.call_status}</TableCell>
                        <TableCell>{item.call_outcome}</TableCell>
                        <TableCell>{item.call_start_time}</TableCell>
                        <TableCell>{item.created_at}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, index) => (
                    <Button
                      key={index}
                      variant={pagination.page === index + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
                    onClick={() => handlePageChange(pagination.page + 1)}
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
