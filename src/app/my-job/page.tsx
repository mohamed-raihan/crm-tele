import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URLS } from "@/components/apiconfig/api_urls";
import axiosInstance from "@/components/apiconfig/axios";
import { RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";

interface JobData {
  enquiry_id: number;
  name: string;
  contact: string;
  email: string;
  status: string;
  outcome: string;
  telecaller_name: string;
  assigned_date: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

const MyJobPage = () => {
  const { tab } = useParams<{ tab: string }>();
  console.log(tab);

  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10 });

  const fetchJobs = async (page = 1, status = tab || "remaining", name = search) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status,
      });
      if (name) params.append("name", name);
      const response = await axiosInstance.get(`/api/jobs-summary/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.code === 200) {
        setJobs(response.data.data || []);
        if (response.data.pagination) {
          setPagination((prev) => ({ ...prev, ...response.data.pagination }));
        } else {
          setPagination((prev) => ({ ...prev, total: response.data.data?.length || 0 }));
        }
      } else {
        setJobs([]);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1, tab, search);
    // eslint-disable-next-line
  }, [tab]);

  const handleSearch = () => {
    fetchJobs(1, tab, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage, tab, search);
  };

  // Sort jobs by assigned_date ascending (oldest first, latest last)
  const sortedJobs = [...jobs].sort((a, b) => new Date(a.assigned_date).getTime() - new Date(b.assigned_date).getTime());

  // Generate pagination numbers with ellipsis
  const generatePaginationNumbers = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = pagination.page;
    const pages = [];

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
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

      // Always show last page
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Job - {tab === "completed" ? "Completed" : "Remaining"}</h2>
          <p className="text-gray-600">View your assigned jobs</p>
        </div>
        {/* Search Bar */}
        <div className="flex flex-row items-center gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700 text-white">
            Search
          </Button>
        </div>
        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Telecaller</TableHead>
                    <TableHead>Assigned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : sortedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedJobs.map((job, idx) => (
                      <TableRow key={job.enquiry_id}>
                        <TableCell>{(pagination.page - 1) * pagination.limit + idx + 1}</TableCell>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>{job.contact}</TableCell>
                        <TableCell>{job.email}</TableCell>
                        <TableCell>{job.status}</TableCell>
                        <TableCell>{job.telecaller_name}</TableCell>
                        <TableCell>{job.assigned_date}</TableCell>
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
                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Prev
                  </Button>
                  {paginationNumbers.map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      ) : (
                        <Button
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum as number)}
                          className={pagination.page === pageNum ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </React.Fragment>
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

export default MyJobPage;