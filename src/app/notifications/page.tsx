import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
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

const NotificationPage = () => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterInputs, setFilterInputs] = useState({ title: "", date: "" });
  const [appliedFilters, setAppliedFilters] = useState({ title: "", date: "" });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });

  // Fetch all notifications once
  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const response = await axiosInstance.get(`${API_URLS.NOTIFICATIONS.GET_NOTIFICATIONS}?page=1&limit=10000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.code === 200) {
        setAllNotifications(response.data.data || []);
      } else {
        setAllNotifications([]);
      }
    } catch (error) {
      setAllNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const applyFilters = (rawData: Notification[], filters: { title: string; date: string }) => {
    return rawData.filter((item) => {
      const matchesTitle = !filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase());
      const matchesDate = !filters.date || (item.created_at ? item.created_at.slice(0, 10) === filters.date : false);
      return matchesTitle && matchesDate;
    });
  };

  // Pagination logic
  const paginate = (data: Notification[], page: number, limit: number) => {
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

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  useEffect(() => {
    setLoading(true);
    const filtered = applyFilters(allNotifications, appliedFilters);
    const { paginated, totalPages, totalRecords } = paginate(filtered, pagination.currentPage, pagination.limit);
    setNotifications(paginated);
    setPagination((prev) => ({ ...prev, totalPages, totalRecords }));
    setLoading(false);
  }, [allNotifications, appliedFilters, pagination.currentPage, pagination.limit]);

  const handleFilterChange = (field: string, value: string) => {
    setFilterInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters({ ...filterInputs });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleReset = () => {
    setFilterInputs({ title: "", date: "" });
    setAppliedFilters({ title: "", date: "" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
            <p className="text-gray-600">View your recent notifications</p>
          </div>

          {/* Filters Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input
                    id="title"
                    value={filterInputs.title}
                    onChange={(e) => handleFilterChange("title", e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    id="date"
                    type="date"
                    value={filterInputs.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
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
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notifications ({pagination.totalRecords} total)</CardTitle>
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
                        <TableHead>Title</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No notifications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        notifications.map((item) => (
                          <TableRow key={item.id} className={item.read ? "" : "bg-blue-50"}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell className="max-w-xs truncate" title={item.title}>{item.title}</TableCell>
                            <TableCell className="max-w-md truncate" title={item.message}>{item.message}</TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              {item.read ? (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Read</span>
                              ) : (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Unread</span>
                              )}
                            </TableCell>
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
                    {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                      const pageNum = pagination.currentPage <= 3 ? index + 1 : 
                        pagination.currentPage >= pagination.totalPages - 2 ? pagination.totalPages - 4 + index :
                        pagination.currentPage - 2 + index;
                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
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
        </div>
      </main>
    </div>
  );
};

export default NotificationPage; 