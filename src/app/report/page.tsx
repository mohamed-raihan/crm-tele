import React, { useEffect, useState } from "react";
import { API_URLS } from "../../components/apiconfig/api_urls.js";
import axiosInstance from "../../components/apiconfig/axios.ts";

const columns = [
  "Counselor",
  "Total Calls",
  "Contacted",
  "Not Contacted",
  "Answered",
  "Not Answered",
  "Positive",
  "Negative",
  "Walk-in List",
  "Follow-ups",
  "Actions",
];

export default function ReportPage() {
  const [branch, setBranch] = useState("");
  const [counselor, setCounselor] = useState("");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [branches, setBranches] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20,
  });

  // Get auth config helper function
  const getAuthConfig = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showToast("Authentication required. Please login.", "error");
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // Toast helper function
  const showToast = (message, type) => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Replace with your actual toast implementation
  };

  const fetchAllReports = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (branch) params.append("branch_name", branch);
      if (counselor) params.append("counsellor_name", counselor);
      if (search) params.append("search", search);

      const response = await axiosInstance.get(
        `${API_URLS.REPORTS.GET_REPORTS}?${params.toString()}`,
        authConfig
      );

      if (response.data?.code === 200) {
        setReports(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        showToast("Failed to fetch reports", "error");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      if (err.response?.status === 401) {
        showToast("Authentication failed. Please login again.", "error");
      } else {
        showToast(
          err.response?.data?.message || "Failed to fetch reports",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBranches = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.get(
        `${API_URLS.BRANCH.GET_BRANCH}`,
        authConfig
      );

      console.log(response);

      if (response.data?.code === 200) {
        setBranches(response.data.data || []);
      } else {
        showToast("Failed to fetch branches", "error");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch branches",
        "error"
      );
    }
  };

  const fetchTelecaller = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.get(
        `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}`,
        authConfig
      );

      if (response.data?.code === 200) {
        setTelecallers(response.data.data || []);
      } else {
        showToast("Failed to fetch telecallers", "error");
      }
    } catch (err) {
      console.error("Error fetching telecallers:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch telecallers",
        "error"
      );
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      // Build query parameters for export
      const params = new URLSearchParams();
      if (branch) params.append("branch", branch);
      if (counselor) params.append("telecaller_name", counselor);
      if (search) params.append("search", search);
      params.append("export", "excel");

      const response = await axiosInstance.get(
        `${API_URLS.REPORTS.GET_REPORTS}?${params.toString()}`,
        {
          ...authConfig,
          responseType: "blob",
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reports_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("Report exported successfully", "success");
    } catch (err) {
      console.error("Error exporting report:", err);
      showToast("Failed to export report", "error");
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchAllReports(1, pagination.limit);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchAllReports(newPage, pagination.limit);
  };

  useEffect(() => {
    fetchAllReports();
    fetchAllBranches();
    fetchTelecaller();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchAllReports(1, 10);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [branch, counselor, search]);

  console.log(branch);
  console.log(reports);
  console.log(telecallers);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Branch</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map((branchItem) => (
                  <option
                    key={branchItem.id || branchItem.branch_id}
                    value={branchItem.name || branchItem.branch_name}
                  >
                    {branchItem.name || branchItem.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Counselor</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={counselor}
                onChange={(e) => setCounselor(e.target.value)}
              >
                <option value="">All Counselors</option>
                {telecallers.map((telecaller) => (
                  <option
                    key={telecaller.id || telecaller.telecaller_id}
                    value={telecaller.name || telecaller.telecaller_name}
                  >
                    {telecaller.name || telecaller.telecaller_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by counselor name..."
              className="border rounded px-3 py-2 w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 font-medium"
              onClick={exportToExcel}
            >
              Export to Excel
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-gray-700 font-semibold mb-2">
            COUNSELOR ACTIVITIES
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report, i) => (
                      <tr key={report.telecaller_id || i} className="border-t">
                        <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                          {report.telecaller_name}
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.total_calls || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-green-100 text-green-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.contacted || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-red-100 text-red-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.not_contacted || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-green-100 text-green-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.answered || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-red-100 text-red-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.not_answered || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-green-100 text-green-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.positive || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-red-100 text-red-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.negative || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.walk_in_list || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="inline-block w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-center text-sm font-bold leading-8">
                            {report.total_follow_ups || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button className="text-gray-500 hover:text-gray-700">
                            <span className="material-icons">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalRecords
                )}{" "}
                of {pagination.totalRecords} entries
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 border rounded ${
                      pagination.currentPage === index + 1
                        ? "bg-violet-100 text-violet-700 border-violet-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
