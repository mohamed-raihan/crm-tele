import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DynamicTable,
  TableColumn,
  TableAction,
  TableFilter,
} from "@/components/ui/dynamic-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Eye, Trash } from "lucide-react";
import axiosInstance from "./apiconfig/axios";
import { API_URLS } from "./apiconfig/api_urls";
import { error } from "console";
import { toast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import * as XLSX from "xlsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";

export function ActiveEnquiryTable() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // Get user role from localStorage
  let userRole = "";
  try {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const user = JSON.parse(userData);
      userRole = user.role;
    }
  } catch (e) {
    userRole = "";
  }

  // Set button color class based on role
  const buttonColorClass =
    userRole === "Telecaller"
      ? "bg-green-600 hover:bg-green-700"
      : userRole === "Admin"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-green-600 hover:bg-green-700";

  const [Enquiries, setEnquiry] = useState([]);
  const [filters, setFilters] = useState<TableFilter[]>([
    {
      key: "time",
      label: "All time",
      value: "",
      onRemove: () => removeFilter("time"),
    },
    {
      key: "recent",
      label: "Recent",
      value: "",
      onRemove: () => removeFilter("recent"),
    },
  ]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Will be set from API response
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [searchFields, setSearchFields] = useState({
    candidate_name: "",
    email: "",
    phone: "",
    branch_name: "",
    telecaller_name: "",
    mettad_name: "",
  });
  const [dateRange, setDateRange] = useState<{
    from: string | undefined;
    to?: string | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const removeFilter = (key: string) => {
    setFilters(filters.filter((f) => f.key !== key));
  };

  const fetchEnquiry = async (pageNum = 1, searchParams = {}) => {
    setLoading(true);
    try {
      let url = `${API_URLS.ENQUIRY.GET_ACTIVE_ENQUIRY}?page=${pageNum}`;
      const params = [];

      // Handle search parameters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value)
          params.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
          );
      });

      // Add date range params if set
      if (dateRange.from) {
        params.push(`start_date=${dateRange.from}`);
      }
      if (dateRange.to) {
        params.push(`end_date=${dateRange.to}`);
      }

      if (params.length > 0) {
        url += `&${params.join("&")}`;
      }

      console.log(url);
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(searchParams);

      // Reset search fields when no search params
      if (Object.keys(searchParams).length === 0) {
        setSearchFields({
          candidate_name: "",
          email: "",
          phone: "",
          branch_name: "",
          telecaller_name: "",
          mettad_name: "",
        });
        setDateRange({ from: undefined, to: undefined });
      }

      setEnquiry(response.data.data);
      if (response.data.pagination && response.data.pagination.totalPages) {
        setTotalPages(response.data.pagination.totalPages);
      } else if (response.data.total_pages) {
        setTotalPages(response.data.total_pages);
      } else if (response.data.total) {
        setTotalPages(Math.ceil(response.data.total / pageSize));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiry(page);
  }, [page]);

  console.log(Enquiries);

  // Delete handler
  const handleDelete = async (row: any) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?"))
      return;
    try {
      await axiosInstance.delete(`${API_URLS.ENQUIRY.DELETE_ENQUIRY(row.id)}`);
      toast({ title: "Enquiry deleted successfully", variant: "success" });
      fetchEnquiry(page);
    } catch (err) {
      toast({ title: "Failed to delete enquiry", variant: "destructive" });
      console.error(err);
    }
  };

  const columns: TableColumn[] = [
    {
      key: "id",
      label: "ID",
      sortable: false,
      render: (_value, _row, index) => (
        <span className="font-medium">{(page - 1) * pageSize + index + 1}</span>
      ),
    },
    { key: "candidate_name", label: "Name" },
    { key: "phone", label: "Phone" },
    {
      key: "required_service_name",
      label: "Service",
      // render: (value, row) => (
      //   <Badge className={row.serviceColor}>{value}</Badge>
      // )
    },
    {
      key: "preferred_course_name",
      label: "Preferred Course",
      // render: (value, row) => (
      //   <Badge className={row.examsColor}>{value}</Badge>
      // )
    },
    { key: "created_by_name", label: "Created by" },
    {
      key: "created_at",
      label: "Created Date",
      render: (value) => {
        if (!value) return "";
        try {
          const date = new Date(value);
          return isNaN(date.getTime())
            ? ""
            : `${date.getDate().toString().padStart(2, "0")}-${(
                date.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}-${date.getFullYear()}`;
        } catch {
          return "";
        }
      },
    },
    { key: "branch_name", label: "Branch" },
    { key: "mettad_name", label: "Source" },
    { key: "assigned_by_name", label: "Telecaller" },
  ];

  const actions: TableAction[] = [
    {
      label: "View Profile",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (row) => {
        const userData = localStorage.getItem("user_data");
        const user = userData ? JSON.parse(userData) : null;

        if (user && user.role === "Telecaller") {
          navigate(`/telecaller-leads/profile/${row.id}`);
        } else {
          navigate(`/leads/profile/${row.id}`);
        }
      },
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4 mr-2 text-red-600" />, // Added red color
      onClick: handleDelete,
    },
    // {
    //   label: 'Refresh',
    //   icon: <RotateCcw className="h-4 w-4 mr-2" />,
    //   onClick: (row) => console.log('Refresh:', row)
    // }
  ];

  const handleExportExcel = () => {
    if (!Enquiries || Enquiries.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    // Prepare data for export with current page index as ID
    const exportData = Enquiries.map((enquiry, index) => ({
      ID: (page - 1) * pageSize + index + 1,
      Name: enquiry.candidate_name || "",
      Phone: enquiry.phone || "",
      Service: enquiry.required_service_name || "",
      "Preferred Course": enquiry.preferred_course_name || "",
      "Created by": enquiry.created_by_name || "",
      "Created Date": enquiry.created_at
        ? (() => {
            try {
              const date = new Date(enquiry.created_at);
              return isNaN(date.getTime())
                ? ""
                : `${date.getDate().toString().padStart(2, "0")}-${(
                    date.getMonth() + 1
                  )
                    .toString()
                    .padStart(2, "0")}-${date.getFullYear()}`;
            } catch {
              return "";
            }
          })()
        : "",
      Branch: enquiry.branch_name || "",
      Source: enquiry.mettad_name || "",
      Telecaller: enquiry.assigned_by_name || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Enquiries");

    // Make header row bold
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.font = { bold: true };
    }

    // Auto-size columns
    const colWidths = [];
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellValue = cell.v.toString();
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
      }
      colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    worksheet["!cols"] = colWidths;

    const fileName = `active_enquiries_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({ title: "Excel file exported successfully", variant: "success" });
  };

  const handleSearch = () => {
    fetchEnquiry(1, searchFields);
    setPage(1);
  };

  // Helper to generate page numbers with ellipsis
  function getPageNumbers(current: number, total: number) {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, "...", total);
      } else if (current >= total - 2) {
        pages.push(1, "...", total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }
    return pages;
  }

  return (
    <>
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <svg
              className="animate-spin h-8 w-8 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          </div>
        ) : (
          <div>
            {/* Search Form */}
            {/* Search Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">
                  Search Enquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Candidate Name
                    </label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      placeholder="Candidate Name"
                      value={searchFields.candidate_name}
                      onChange={(e) =>
                        setSearchFields((f) => ({
                          ...f,
                          candidate_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      placeholder="Phone"
                      value={searchFields.phone}
                      onChange={(e) =>
                        setSearchFields((f) => ({
                          ...f,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      placeholder="Branch"
                      value={searchFields.branch_name}
                      onChange={(e) =>
                        setSearchFields((f) => ({
                          ...f,
                          branch_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      className="border rounded px-3 py-2 w-full"
                      value={dateRange.from || ""}
                      onChange={(e) =>
                        setDateRange((dr) => ({
                          ...dr,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      className="border rounded px-3 py-2 w-full"
                      value={dateRange.to || ""}
                      onChange={(e) =>
                        setDateRange((dr) => ({
                          ...dr,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telecaller Name
                    </label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      placeholder="Telecaller Name"
                      value={searchFields.telecaller_name}
                      onChange={(e) =>
                        setSearchFields((f) => ({
                          ...f,
                          telecaller_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <input
                      className="border rounded px-3 py-2 w-full"
                      placeholder="Source"
                      value={searchFields.mettad_name}
                      onChange={(e) =>
                        setSearchFields((f) => ({
                          ...f,
                          mettad_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div></div> {/* Empty div */}
                  <div></div> {/* Empty div */}
                </div>
                <div className="flex justify-end gap-3">
                  {userRole === "Admin" && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleExportExcel}
                    >
                      Export to Excel
                    </Button>
                  )}

                  <Button className={buttonColorClass} onClick={handleSearch}>
                    Search
                  </Button>
                  <Button
                    className={buttonColorClass}
                    onClick={() => fetchEnquiry()}
                  >
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="overflow-x-auto w-full">
              <DynamicTable
                data={Enquiries}
                columns={columns}
                actions={actions}
                // Removed checkbox-related props
                rowIdKey="id"
                showBulkActions={false}
              />
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Pagination className="w-full max-w-full overflow-x-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {getPageNumbers(page, totalPages).map((p, idx) =>
                p === "..." ? (
                  <PaginationEllipsis key={"ellipsis-" + idx} />
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Number(p));
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
