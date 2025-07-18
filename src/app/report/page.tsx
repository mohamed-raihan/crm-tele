import { API_URLS } from "@/components/apiconfig/api_urls";
import axiosInstance from "@/components/apiconfig/axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { RefreshCw, Search, ChevronDown, X, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import DateFilter from './Datefilter';


// TypeScript interfaces
interface Report {
  telecaller_id: number;
  telecaller_name: string;
  branch_name: string;
  total_calls: number;
  contacted: number;
  not_contacted: number;
  answered: number;
  not_answered: number;
  won: number; // changed from qualified
  not_interested: number; // changed from negative
  walk_in_list: number;
  total_follow_ups: number;
}

interface Branch {
  id: number;
  branch_name: string;
}

interface Telecaller {
  id: number;
  name: string;
  branch_name?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface DropdownPagination {
  currentPage: number;
  hasMore: boolean;
  limit: number;
}


interface DateFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}



const columns = [
  "Counselor",
  "Branch",
  "Total Calls",
  "Contacted",
  "Not Contacted",
  "Answered",
  "Not Answered",
  "Won",
  "Not Interested",
  "Walk-in List",
  "Follow-ups",
];

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: string; className?: string }> = ({
  size = "w-4 h-4",
  className = "",
}) => <Loader2 className={`animate-spin ${size} ${className}`} />;

// Full Screen Loader Component
const FullScreenLoader: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 min-w-[200px]">
      <LoadingSpinner size="w-8 h-8" className="text-blue-600" />
      <span className="text-gray-700 font-medium">{message}</span>
    </div>
  </div>
);

// Optimized SearchableDropdown Component
const SearchableDropdown: React.FC<{
  options: any[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  displayKey?: string;
  valueKey?: string;
  onSearch?: (term: string) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  disabled?: boolean;
}> = ({
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
  disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = useCallback(
      (term: string) => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          if (onSearch) {
            onSearch(term);
          }
        }, 300);
      },
      [onSearch]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      handleSearch(term);
    };

    const handleScroll = useCallback(() => {
      if (listRef.current && hasMore && !loading) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          if (onLoadMore) {
            onLoadMore();
          }
        }
      }
    }, [hasMore, loading, onLoadMore]);

    const selectedOption = options.find((opt) => opt[valueKey] === value);

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-pointer flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={!value ? "text-gray-500" : ""}>
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>

        {isOpen && !disabled && (
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
                  autoFocus
                />
                {searchTerm && (
                  <button
                    className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSearchTerm("");
                      handleSearch("");
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

              {options.map((option, index) => (
                <div
                  key={option.id || option[valueKey] || index}
                  className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${value === option[valueKey] ? "bg-blue-50 text-blue-600" : ""
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

              {!loading && options.length === 0 && searchTerm && (
                <div className="px-3 py-2 text-center text-gray-500">
                  No results found
                </div>
              )}

              {!loading && options.length === 0 && !searchTerm && (
                <div className="px-3 py-2 text-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

export default function ReportPage() {
  const [branch, setBranch] = useState<string>("");
  const [counselor, setCounselor] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [branchLoading, setBranchLoading] = useState<boolean>(false);
  const [telecallerLoading, setTelecallerLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState<string>("");
  const [telecallerSearchTerm, setTelecallerSearchTerm] = useState<string>("");
  const [allTelecallers, setAllTelecallers] = useState<Telecaller[]>([]);
  const [filteredTelecallers, setFilteredTelecallers] = useState<Telecaller[]>(
    []
  );
  const [isDrillDown, setIsDrillDown] = useState<boolean>(false);
  const [drillDownData, setDrillDownData] = useState<any[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{
    telecaller_id: string;
    report_type: string;
    telecaller_name: string;
    additional_filter?: string;
  }>({ telecaller_id: '', report_type: '', telecaller_name: '', additional_filter: '' });


  const [drillDownPagination, setDrillDownPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
    hasNext: false,
    hasPrevious: false,
  });

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
    hasNext: false,
    hasPrevious: false,
  });

  const [branchPagination, setBranchPagination] = useState<DropdownPagination>({
    currentPage: 1,
    hasMore: true,
    limit: 10,
  });

  const [telecallerPagination, setTelecallerPagination] =
    useState<DropdownPagination>({
      currentPage: 1,
      hasMore: true,
      limit: 10,
    });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const showToast = (message: string, type: "success" | "error") => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Replace with your actual toast implementation
  };


 const fetchDrillDownData = async (
  telecaller_id: string, 
  report_type: string, 
  additionalFilter: string = '',
  page: number = 1,
  limit: number = 10
) => {
  setLoading(true);
  try {
    const authConfig = getAuthConfig();
    if (!authConfig) return;

    const params = new URLSearchParams({
      report: report_type,
      telecaller_id: telecaller_id,
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add additional filters if needed
    if (additionalFilter) {
      const additionalParams = new URLSearchParams(additionalFilter.replace('&', ''));
      additionalParams.forEach((value, key) => {
        params.append(key, value);
      });
    }

    const response = await axiosInstance.get(
      `${API_URLS.REPORTS.GET_REPORTS}?${params.toString()}`,
      authConfig
    );

    if (response.data?.code === 200) {
      setDrillDownData(response.data.data || []);
      setDrillDownPagination({
        currentPage: response.data.pagination?.page || page,
        totalPages: response.data.pagination?.totalPages || 1,
        totalRecords: response.data.pagination?.total || 0,
        limit: response.data.pagination?.limit || limit,
        hasNext: response.data.pagination?.hasNext || false,
        hasPrevious: response.data.pagination?.hasPrevious || false,
      });
    } else {
      showToast("Failed to fetch detailed data", "error");
    }
  } catch (err: any) {
    console.error("Error fetching drill-down data:", err);
    showToast("Failed to fetch detailed data", "error");
  } finally {
    setLoading(false);
  }
};



  const getColorClass = (value: number) => {
    if (value === 0) return 'bg-gray-100 text-gray-500';
    if (value === 1) return 'bg-red-100 text-red-700';
    if (value === 2) return 'bg-yellow-100 text-yellow-700';
    if (value >= 3 && value <= 5) return 'bg-blue-100 text-blue-700';
    if (value >= 6 && value <= 10) return 'bg-green-100 text-green-700';
    return 'bg-purple-100 text-purple-700'; // for values > 10
  };


  const handleCellClick = (report: Report, columnType: string) => {
    const reportTypeMap: { [key: string]: string } = {
      'totalcalls': 'totalcalls',
      'contacted': 'contacted',
      'not_contacted': 'not_contacted',
      'answered': 'answered',
      'not_answered': 'not_answered',
      'won': 'won',
      'not_interested': 'contacted',
      'walk_in_list': 'walk_in_list',
      'total_follow_ups': 'followup',
      'followup': 'followup',
    };
  
    const reportType = reportTypeMap[columnType];
    if (!reportType) return;
  
    let additionalFilter = '';
    if (columnType === 'won') {
      additionalFilter = '';
    } else if (columnType === 'not_interested') {
      additionalFilter = '&status=not_interested';
    }
  
    setCurrentFilter({
      telecaller_id: report.telecaller_id.toString(),
      report_type: reportType,
      telecaller_name: report.telecaller_name || '',
      additional_filter: additionalFilter
    });
  
    // Reset pagination when switching to drill-down
    setDrillDownPagination({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 10,
      hasNext: false,
      hasPrevious: false,
    });
  
    setIsDrillDown(true);
    fetchDrillDownData(report.telecaller_id.toString(), reportType, additionalFilter, 1, 10);
  };
  

  const handleBackToReport = () => {
    setIsDrillDown(false);
    setDrillDownData([]);
    setCurrentFilter({ telecaller_id: '', report_type: '', telecaller_name: '' });
    setDrillDownPagination({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 10,
      hasNext: false,
      hasPrevious: false,
    });
  };

  const handleDrillDownPageChange = (newPage: number) => {
    setDrillDownPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchDrillDownData(
      currentFilter.telecaller_id,
      currentFilter.report_type,
      currentFilter.additional_filter || '',
      newPage,
      drillDownPagination.limit
    );
  };

  // Fetch reports with optimized pagination
  const fetchAllReports = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (branch) params.append("branch_name", branch);
      if (counselor) params.append("telecaller_name", counselor);
      if (search) params.append("search", search);
      // Add date filters
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await axiosInstance.get(
        `${API_URLS.REPORTS.GET_REPORTS}?${params.toString()}`,
        authConfig
      );

      if (response.data?.code === 200) {
        // Map positive/negative to won/not_interested for frontend
        const mappedReports = (response.data.data || []).map((report: any) => ({
          ...report,
          won: report.won ?? report.qualified ?? report.positive ?? 0,
          not_interested: report.not_interested ?? report.negative ?? 0,
        }));
        setReports(mappedReports);
        setPagination({
          currentPage: response.data.pagination?.page || page,
          totalPages: response.data.pagination?.totalPages || 1,
          totalRecords: response.data.pagination?.total || 0,
          limit: response.data.pagination?.limit || limit,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrevious: response.data.pagination?.hasPrevious || false,
        });
      } else {
        showToast("Failed to fetch reports", "error");
      }
    } catch (err: any) {
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

  // Fetch branches with pagination and search
  const fetchAllBranches = async (
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ""
  ) => {
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
        setBranchPagination({
          currentPage: page,
          hasMore:
            response.data.pagination?.page <
            response.data.pagination?.totalPages,
          limit: limit,
        });
      } else {
        showToast("Failed to fetch branches", "error");
      }
    } catch (err: any) {
      console.error("Error fetching branches:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch branches",
        "error"
      );
    } finally {
      setBranchLoading(false);
    }
  };

  // Fetch telecallers with pagination and search
  const fetchTelecaller = async (
    page: number = 1,
    limit: number = 1000,
    searchTerm: string = ""
  ) => {
    setTelecallerLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Only add branch filter if a branch is selected
      if (branch) {
        params.append("branch_name", branch);
      }

      // Add search parameters for API filtering
      if (searchTerm) {
        params.append("search", searchTerm);
        params.append("key", "name");
        params.append("field", "name");
      }

      const response = await axiosInstance.get(
        `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}?${params.toString()}`,
        authConfig
      );

      if (response.data?.code === 200) {
        const telecallersData = response.data.data || [];
        setAllTelecallers(telecallersData);
        setTelecallers(telecallersData);

        setTelecallerPagination({
          currentPage: page,
          hasMore: false,
          limit: limit,
        });
      } else {
        showToast("Failed to fetch telecallers", "error");
      }
    } catch (err: any) {
      console.error("Error fetching telecallers:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch telecallers",
        "error"
      );
    } finally {
      setTelecallerLoading(false);
    }
  };


  // Export to Excel with drill-down data or report data
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      let excelData: any[] = [];
      let fileName = '';
      let sheetName = '';

      // If we're in drill-down mode, export the drill-down data
      if (isDrillDown && drillDownData.length > 0) {
        excelData = drillDownData.map((item: any) => ({
          'Name': item.enquiry_details?.candidate_name || 'N/A',
          'Phone': item.enquiry_details?.phone || 'N/A',
          'Email': item.enquiry_details?.email || 'N/A',
          'Status': item.enquiry_details?.enquiry_status || 'N/A',
          'Branch': item.branch_name || 'N/A',
          'Created Date': item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
        }));

        fileName = `${currentFilter.telecaller_name}_${currentFilter.report_type.replace('_', '_')}_details_${new Date().toISOString().split("T")[0]}.xlsx`;
        sheetName = `${currentFilter.report_type.replace('_', ' ')} Details`;
      } else {
        // Export main report data
        const params = new URLSearchParams({
          page: "1",
          limit: "1000", // Large limit to get all data
        });

        if (branch) params.append("branch_name", branch);
        if (counselor) params.append("telecaller_name", counselor);
        if (search) params.append("search", search);

        const response = await axiosInstance.get(
          `${API_URLS.REPORTS.GET_REPORTS}?${params.toString()}`,
          authConfig
        );

        if (response.data?.code === 200) {
          const allReports = (response.data.data || []).map((report: any) => ({
            ...report,
            won: report.won ?? report.qualified ?? report.positive ?? 0,
            not_interested: report.not_interested ?? report.negative ?? 0,
          }));

          if (allReports.length === 0) {
            showToast("No data to export", "error");
            return;
          }

          excelData = allReports.map((report: Report) => ({
            'Counselor': report.telecaller_name || "",
            'Branch': report.branch_name || "",
            'Total Calls': report.total_calls || 0,
            'Contacted': report.contacted || 0,
            'Not Contacted': report.not_contacted || 0,
            'Answered': report.answered || 0,
            'Not Answered': report.not_answered || 0,
            'Won': report.won || 0,
            'Not Interested': report.not_interested || 0,
            'Walk-in List': report.walk_in_list || 0,
            'Follow-ups': report.total_follow_ups || 0,
          }));

          fileName = `counselor_reports_${new Date().toISOString().split("T")[0]}.xlsx`;
          sheetName = "Counselor Reports";
        } else {
          showToast("Failed to fetch report data", "error");
          return;
        }
      }

      if (excelData.length === 0) {
        showToast("No data to export", "error");
        return;
      }

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Auto-size columns
      const columnWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...excelData.map(row => String(row[key as keyof typeof row]).length)
        ) + 2
      }));
      worksheet['!cols'] = columnWidths;

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const exportMessage = isDrillDown
        ? `${currentFilter.report_type.replace('_', ' ')} details exported successfully`
        : "Report exported successfully";
      showToast(exportMessage, "success");
    } catch (err: any) {
      console.error("Error exporting data:", err);
      showToast("Failed to export data", "error");
    } finally {
      setExportLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchAllReports(newPage, pagination.limit);
  };

  // Handle search with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleBranchSearch = (searchTerm: string) => {
    setBranchSearchTerm(searchTerm);
    setBranchPagination({ currentPage: 1, hasMore: true, limit: 10 });
    fetchAllBranches(1, 10, searchTerm);
  };

  const handleTelecallerSearch = (searchTerm: string) => {
    setTelecallerSearchTerm(searchTerm);

    // Always call API with search term (empty or not)
    fetchTelecaller(1, 1000, searchTerm);
  };


  // Load more branches
  const loadMoreBranches = () => {
    if (branchPagination.hasMore && !branchLoading) {
      fetchAllBranches(branchPagination.currentPage + 1, 10, branchSearchTerm);
    }
  };

  const loadMoreTelecallers = () => {
    if (telecallerPagination.hasMore && !telecallerLoading) {
      fetchTelecaller(
        telecallerPagination.currentPage + 1,
        10,
        telecallerSearchTerm
      );
    }
  };

  // Handle branch change
  const handleBranchChange = (branchValue: string) => {
    setBranch(branchValue);
    setCounselor("");
    setTelecallerSearchTerm("");
    setTelecallerPagination({ currentPage: 1, hasMore: false, limit: 1000 });

    // Fetch telecallers for the selected branch (or all if no branch selected)
    fetchTelecaller(1, 1000, "");
  };


  // Handle filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchAllReports(1, 10);
      fetchTelecaller(1, 1000, telecallerSearchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [branch, counselor, startDate, endDate]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchAllReports(1, 10),
          fetchAllBranches(1, 10),
          fetchTelecaller(1, 1000, ""), // This will load all telecallers initially
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
  }, []);



  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Show initial loading screen
  if (initialLoading) {
    return <FullScreenLoader message="Loading reports..." />;
  }

  const drillDownColumns = [
    'Name', 'Phone', 'Email', 'Status', 'Branch', 'Created Date'
  ];

  // Allowed clickable columns (from user image)
  const clickableColumns = [
    'totalcalls',
    'contacted',
    'not_contacted',
    'answered',
    'not_answered',
    'followup',
    'walk_in_list',
    'won', // <-- Make 'won' column clickable
  ];

  const renderClickableCell = (value: number, report: Report, columnType: string) => {
    const colorClass = getColorClass(value);

    // Only allow click for allowed columns
    if (!clickableColumns.includes(columnType)) {
      return (
        <span className={`w-8 h-8 rounded-full text-sm font-medium ${colorClass} flex items-center justify-center`}>
          {value}
        </span>
      );
    }

    if (value === 0) {
      return (
        <span className={`w-8 h-8 rounded-full text-sm font-medium ${colorClass} flex items-center justify-center`}>
          0
        </span>
      );
    }

    return (
      <button
        className={`w-8 h-8 rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${colorClass} hover:underline flex items-center justify-center`}
        onClick={() => handleCellClick(report, columnType)}
      >
        {value}
      </button>
    );
  };

  return (
    <div>
      <DashboardHeader />
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
                  onSearch={handleTelecallerSearch}
                  loading={telecallerLoading}
                  hasMore={false}
                  onLoadMore={() => { }}
                />
              </div>

              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onDateChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />


            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  className="border rounded px-10 py-2 w-full md:w-80 bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
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
                  isDrillDown ? "Export Details" : "Export to Excel"
                )}
              </button>
              <button
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 font-medium flex items-center gap-1"
                onClick={() => {
                  setBranch("");
                  setCounselor("");
                  setSearch("");
                  setStartDate(""); // Clear start date
                  setEndDate("");   // Clear end date
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  fetchAllReports(1, 10);
                }}
                disabled={loading}
                title="Refresh Report"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h2 className="text-gray-700 font-semibold text-lg">
                COUNSELOR ACTIVITIES
              </h2>

              {pagination.totalRecords > 0 && (
                <div className="text-sm text-gray-500">
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages} •
                  </span>
                  <span className="ml-1">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalRecords
                    )}{" "}
                    of {pagination.totalRecords} records
                  </span>
                </div>
              )}
            </div>

            {/* {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <LoadingSpinner size="w-6 h-6" />
                  Loading reports...
                </div>
              </div>
            ) : ( */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <LoadingSpinner size="w-6 h-6" />
                  Loading reports...
                </div>
              </div>
            ) : !isDrillDown ? (
              // Main Report Table
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
                        <tr
                          key={report.telecaller_id || i}
                          className="border-t"
                        >
                          <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                            {report.telecaller_name}
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                            {report.branch_name || ""}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.total_calls, report, 'totalcalls')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.contacted, report, 'contacted')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.not_contacted, report, 'not_contacted')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.answered, report, 'answered')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.not_answered, report, 'not_answered')}
                          </td>

                          <td className="px-4 py-2">
                            {renderClickableCell(report.won, report, 'won')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.not_interested, report, 'not_interested')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.walk_in_list, report, 'walk_in_list')}
                          </td>
                          <td className="px-4 py-2">
                            {renderClickableCell(report.total_follow_ups, report, 'followup')}
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
            ) : (
              // Drill-down Table
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToReport}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white"
                    >
                      ← Back to Report
                    </button>
                    <span className="text-sm text-gray-600">
                      Showing {currentFilter.report_type.replace('_', ' ')} details for {currentFilter.telecaller_name}
                    </span>
                  </div>
                 
                </div>
            
                <div className="overflow-x-auto">
                  <table className="min-w-full border rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        {drillDownColumns.map((col, idx) => (
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
                      {drillDownData.length > 0 ? (
                        drillDownData.map((item, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-2 font-medium text-gray-700">
                              {item.enquiry_details?.candidate_name || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                              {item.enquiry_details?.phone || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                              {item.enquiry_details?.email || 'N/A'}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.enquiry_details?.enquiry_status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {item.enquiry_details?.enquiry_status || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                              {item.branch_name || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={drillDownColumns.length}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No detailed data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            
                {/* Drill-down Pagination */}
                {drillDownPagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {(drillDownPagination.currentPage - 1) * drillDownPagination.limit + 1}{" "}
                      to{" "}
                      {Math.min(
                        drillDownPagination.currentPage * drillDownPagination.limit,
                        drillDownPagination.totalRecords
                      )}{" "}
                      of {drillDownPagination.totalRecords} entries
                    </div>
            
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={drillDownPagination.currentPage === 1 || loading}
                        onClick={() => handleDrillDownPageChange(drillDownPagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                      {[...Array(drillDownPagination.totalPages)].map((_, index) => (
                        <button
                          key={index}
                          className={`px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                            drillDownPagination.currentPage === index + 1
                              ? "bg-violet-100 text-violet-700 border-violet-300"
                              : "hover:bg-gray-50"
                          }`}
                          disabled={loading}
                          onClick={() => handleDrillDownPageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          drillDownPagination.currentPage === drillDownPagination.totalPages ||
                          loading
                        }
                        onClick={() => handleDrillDownPageChange(drillDownPagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* )} */}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
                  to{" "}
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
                      className={`px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === index + 1
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
                      pagination.currentPage === pagination.totalPages ||
                      loading
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
