import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URLS } from "@/components/apiconfig/api_urls";
import axiosInstance from "@/components/apiconfig/axios";
import { RefreshCw } from "lucide-react";
import ProgressBar from "@/components/ui/progressBar";
import { DashboardHeader } from "@/components/DashboardHeader";

interface JobData {
  telecaller_id: number;
  name: string;
  contact: string;
  progress: string;
  status: string;
  branch_name: string;
  telecaller_name: string;
  assigned_date: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

const AdminJobPage = () => {
  const { job } = useParams<{ job: string }>();
  console.log(job);

  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10 });

  const fetchJobs = async (page = 1, status = job || "remaining", name = search) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status,
      });
      if (name) params.append("search", name);

      console.log(name);
      
      console.log(`/api/jobs-view/?${params.toString()}`);
      

      const response = await axiosInstance.get(`/api/jobs-view/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(response);

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
    fetchJobs(1, job, search);
    // eslint-disable-next-line
  }, [job]);

  const handleSearch = () => {
    fetchJobs(1, job, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage, job, search);
  };

  // Sort jobs by assigned_date ascending (oldest first, latest last)
  const sortedJobs = [...jobs].sort((a, b) => new Date(a.assigned_date).getTime() - new Date(b.assigned_date).getTime());

  return (
    <div>
      <DashboardHeader/>
      <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 bg-gray-50">
      <div className=" mx-auto w-full">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Job - {job === "completed" ? "Completed" : "Remaining"}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="flex flex-row items-center gap-2 mb-4">
              <Input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline" className="w-auto">
                Search
              </Button>
            </div> */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Telecaller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Branch name</TableHead>
                    <TableHead>Assigned Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : sortedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedJobs.map((job, idx) => {
                      const [completed, total] = job.progress.split("/").map(Number);
                      return (
                        <TableRow key={`${job.telecaller_id}-${job.assigned_date}`}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{job.telecaller_name}</TableCell>
                          <TableCell>{job.status}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 ">
                              <ProgressBar value={completed} max={total} />
                              <span className="text-sm">{job.progress}</span>
                            </div>
                          </TableCell>
                          <TableCell>{job.branch_name}</TableCell>
                          <TableCell>{job.assigned_date}</TableCell>
                        </TableRow>
                      );
                    })
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
      </div>
    </div>
    </div>
  );
};

export default AdminJobPage; 