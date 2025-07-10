import { API_URLS } from "@/components/apiconfig/api_urls";
import axiosInstance from "@/components/apiconfig/axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { RefreshCw, Search, ChevronDown, X, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";

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
];

// Loading Spinner Component
const LoadingSpinner = ({ size = "w-4 h-4", className = "" }) => (
  <Loader2 className={`animate-spin ${size} ${className}`} />
);

// Full Screen Loader Component
const FullScreenLoader = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 min-w-[200px]">
      <LoadingSpinner size="w-8 h-8" className="text-blue-600" />
      <span className="text-gray-700 font-medium">{message}</span>
    </div>
  </div>
);

// Custom SearchableDropdown Component
const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  displayKey = "name",
  valueKey = "name",
  onSearch,
  loading = false,
  hasMore = false,
  onLoadMore,
  useLocalSearch = false, // New prop to control search behavior
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedOptions, setDisplayedOptions] = useState([]);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize with first 10 options
    setDisplayedOptions(options.slice(0, 10));
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (term) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (useLocalSearch) {
          // Local search - filter existing options
          if (term.trim()) {
            const filtered = options.filter((option) =>
              option[displayKey].toLowerCase().includes(term.toLowerCase())
            );
            setDisplayedOptions(filtered);
          } else {
            setDisplayedOptions(options.slice(0, 10));
          }
        } else {
          // API search - let parent handle it
          if (term.trim()) {
            const filtered = options.filter((option) =>
              option[displayKey].toLowerCase().includes(term.toLowerCase())
            );
            setDisplayedOptions(filtered.slice(0, 10));
          } else {
            setDisplayedOptions(options.slice(0, 10));
          }
          if (onSearch) onSearch(term);
        }
      }, 300);
    },
    [options, displayKey, onSearch, useLocalSearch]
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  const handleScroll = useCallback(() => {
    if (listRef.current && !useLocalSearch) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        // Load more items when near bottom
        const currentLength = displayedOptions.length;
        const nextItems = options.slice(currentLength, currentLength + 10);
        if (nextItems.length > 0) {
          setDisplayedOptions((prev) => [...prev, ...nextItems]);
        }
        if (onLoadMore && hasMore) {
          onLoadMore();
        }
      }
    }
  }, [displayedOptions.length, options, hasMore, onLoadMore, useLocalSearch]);

  const selectedOption = options.find((opt) => opt[valueKey] === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "text-gray-500" : ""}>
          {selectedOption ? selectedOption[displayKey] : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSearchTerm("");
                    if (useLocalSearch) {
                      setDisplayedOptions(options.slice(0, 10));
                    } else {
                      setDisplayedOptions(options.slice(0, 10));
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="max-h-48 overflow-y-auto"
            onScroll={handleScroll}
          >
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setSearchTerm("");
              }}
            >
              {placeholder}
            </div>

            {displayedOptions.map((option, index) => (
              <div
                key={option.id || option[valueKey] || index}
                className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                  value === option[valueKey] ? "bg-blue-50 text-blue-600" : ""
                }`}
                onClick={() => {
                  onChange(option[valueKey]);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {option[displayKey]}
              </div>
            ))}

            {loading && (
              <div className="px-3 py-2 text-center text-gray-500 flex items-center justify-center gap-2">
                <LoadingSpinner size="w-4 h-4" />
                Loading...
              </div>
            )}

            {!loading && displayedOptions.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReportPage() {
  const [branch, setBranch] = useState("");
  const [counselor, setCounselor] = useState("");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [branches, setBranches] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [telecallerLoading, setTelecallerLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
const [loaderTimer, setLoaderTimer] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20,
  });
  const [branchPagination, setBranchPagination] = useState({
    currentPage: 1,
    hasMore: true,
    limit: 10,
  });
  const [telecallerPagination, setTelecallerPagination] = useState({
    currentPage: 1,
    hasMore: true,
    limit: 10,
  });
  const [filteredReports, setFilteredReports] = useState([]);
  const searchTimeoutRef = useRef(null);

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
      if (counselor) params.append("telecaller_name", counselor);
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

  const fetchAllBranches = async (page = 1, limit = 10, searchTerm = "") => {
    setBranchLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append("search", searchTerm);

      const response = await axiosInstance.get(
        `${API_URLS.BRANCH.GET_BRANCH}?${params.toString()}`,
        authConfig
      );

      if (response.data?.code === 200) {
        const newBranches = response.data.data || [];
        setBranches((prevBranches) =>
          page === 1 ? newBranches : [...prevBranches, ...newBranches]
        );
        setBranchPagination((prev) => ({
          ...prev,
          currentPage: page,
          hasMore: newBranches.length === limit,
        }));
      } else {
        showToast("Failed to fetch branches", "error");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch branches",
        "error"
      );
    } finally {
      setBranchLoading(false);
    }
  };

  const fetchTelecaller = async (page = 1, limit = 10, searchTerm = "") => {
    setTelecallerLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append("search", searchTerm);

      // Add branch filter if selected to get telecallers for specific branch
      if (branch) params.append("branch_name", branch);

      const response = await axiosInstance.get(
        `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}?${params.toString()}`,
        authConfig
      );

      if (response.data?.code === 200) {
        const newTelecallers = response.data.data || [];
        setTelecallers((prevTelecallers) =>
          page === 1 ? newTelecallers : [...prevTelecallers, ...newTelecallers]
        );
        setTelecallerPagination((prev) => ({
          ...prev,
          currentPage: page,
          hasMore: newTelecallers.length === limit,
        }));
      } else {
        showToast("Failed to fetch telecallers", "error");
      }
    } catch (err) {
      console.error("Error fetching telecallers:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch telecallers",
        "error"
      );
    } finally {
      setTelecallerLoading(false);
    }
  };

  // Export to Excel using XLSX from frontend state
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      if (!reports || reports.length === 0) {
        showToast("No data to export", "error");
        return;
      }
      // Prepare export data (filtered if search is active)
      const filteredData =
        filteredReports.length > 0 || search ? filteredReports : reports;
      const exportData = filteredData.map((report) => ({
        Counselor: report.telecaller_name || "",
        "Total Calls": report.total_calls || 0,
        Contacted: report.contacted || 0,
        "Not Contacted": report.not_contacted || 0,
        Answered: report.answered || 0,
        "Not Answered": report.not_answered || 0,
        Positive: report.positive || 0,
        Negative: report.negative || 0,
        "Walk-in List": report.walk_in_list || 0,
        "Follow-ups": report.total_follow_ups || 0,
      }));

      // Add a small delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      XLSX.writeFile(
        workbook,
        `counselor_reports_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      showToast("Report exported successfully", "success");
    } catch (err) {
      console.error("Error exporting report:", err);
      showToast("Failed to export report", "error");
    } finally {
      setExportLoading(false);
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

  // Handle search with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchAllReports(1, pagination.limit);
    }, 500);
  };

  // Handle branch search
  const handleBranchSearch = (searchTerm) => {
    setBranchPagination({ currentPage: 1, hasMore: true, limit: 10 });
    fetchAllBranches(1, 10, searchTerm);
  };

  // Handle telecaller search
  const handleTelecallerSearch = (searchTerm) => {
    setTelecallerPagination({ currentPage: 1, hasMore: true, limit: 10 });
    fetchTelecaller(1, 10, searchTerm);
  };

  // Load more branches
  const loadMoreBranches = () => {
    if (branchPagination.hasMore) {
      fetchAllBranches(branchPagination.currentPage + 1, 10);
    }
  };

  // Load more telecallers
  const loadMoreTelecallers = () => {
    if (telecallerPagination.hasMore) {
      fetchTelecaller(telecallerPagination.currentPage + 1, 10);
    }
  };

  // Reset telecaller when branch changes
  const handleBranchChange = (branchValue) => {
    setBranch(branchValue);
    setCounselor(""); // Reset counselor when branch changes
    setTelecallers([]); // Clear telecallers list
    setTelecallerPagination({ currentPage: 1, hasMore: true, limit: 10 });

    // Fetch telecallers for new branch
    if (branchValue) {
      fetchTelecaller(1, 100, ""); // Fetch more records for local search
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchAllReports(),
          fetchAllBranches(),
          fetchTelecaller(1, 100, ""), // Fetch more records for local search
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle branch and counselor filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchAllReports(1, 10);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [branch, counselor]);

  // Handle local search filtering
  useEffect(() => {
    if (!search) {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter((r) =>
          (r.telecaller_name || "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, reports]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  console.log(branch);
  console.log(reports);
  console.log(telecallers);

  // Show initial loading screen
  if (initialLoading) {
    return <FullScreenLoader message="Loading reports..." />;
  }

  return (
    <div>
      <DashboardHeader/>
      <div className="min-h-screen bg-gray-50 p-6">
      {/* Export Loading Overlay */}
      {exportLoading && <FullScreenLoader message="Exporting to Excel..." />}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Branch</label>
              <SearchableDropdown
                options={branches}
                value={branch}
                onChange={handleBranchChange}
                placeholder="All Branches"
                displayKey="branch_name"
                valueKey="branch_name"
                onSearch={handleBranchSearch}
                loading={branchLoading}
                hasMore={branchPagination.hasMore}
                onLoadMore={loadMoreBranches}
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Counselor</label>
              <SearchableDropdown
                options={telecallers}
                value={counselor}
                onChange={setCounselor}
                placeholder="All Counsellors"
                displayKey="name"
                valueKey="name"
                onSearch={() => {}} // Empty function to satisfy the prop requirement
                loading={telecallerLoading}
                hasMore={false} // Set to false since we're using local search
                onLoadMore={() => {}} // Empty function to satisfy the prop requirement
                useLocalSearch={true} // Enable local search for counselor dropdown
              />
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
              className="border rounded px-3 py-2 w-full md:w-64 bg-gray-100 text-gray-700"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded font-medium flex items-center gap-2"
              onClick={exportToExcel}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <LoadingSpinner size="w-4 h-4" />
                  Exporting...
                </>
              ) : (
                "Export to Excel"
              )}
            </button>
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 font-medium flex items-center gap-1"
              onClick={() => {
                setBranch("");
                setCounselor("");
                setSearch("");
                fetchAllReports(1, pagination.limit);
              }}
              disabled={loading}
              title="Refresh Report"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-gray-700 font-semibold mb-2">
            COUNSELOR ACTIVITIES
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center gap-2 text-gray-500">
                <LoadingSpinner size="w-6 h-6" />
                Loading reports...
              </div>
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
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report, i) => (
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
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                      pagination.currentPage === index + 1
                        ? "bg-violet-100 text-violet-700 border-violet-300"
                        : "hover:bg-gray-50"
                    }`}
                    disabled={loading}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
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
    </div>
  );
}
