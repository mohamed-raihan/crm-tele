import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicTable, TableColumn, TableAction, TableFilter } from "@/components/ui/dynamic-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Eye, Trash, RefreshCw } from "lucide-react";
import axiosInstance from './apiconfig/axios';
import { API_URLS } from './apiconfig/api_urls';
import { error } from 'console';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

export function ClosedEnquiryTable() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [Enquiries, setEnquiry] = useState([]);
  const [filters, setFilters] = useState<TableFilter[]>([
    {
      key: 'time',
      label: 'All time',
      value: '',
      onRemove: () => removeFilter('time')
    },
    {
      key: 'recent',
      label: 'Recent',
      value: '',
      onRemove: () => removeFilter('recent')
    }
  ]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get user role from localStorage
  const userData = localStorage.getItem("user_data");
  const user = userData ? JSON.parse(userData) : null;
  const userRole = user?.role || "";

  const removeFilter = (key: string) => {
    setFilters(filters.filter(f => f.key !== key));
  };

  const fetchEnquiry = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      let url = `${API_URLS.ENQUIRY.GET_CLOSED_ENQUIRY}?page=${pageNum}`;
      if (searchTerm) {
        url += `&candidate_name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await axiosInstance.get(url);
      console.log(response);

      setEnquiry(response.data.data);

      // Fix pagination logic
      if (response.data.total_pages) {
        setTotalPages(response.data.total_pages);
      } else if (response.data.total) {
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } else {
        // If no pagination info from API, calculate based on actual data length
        const dataLength = response.data.data?.length || 0;
        if (dataLength === 0) {
          setTotalPages(0);
        } else if (dataLength < pageSize) {
          // If we have less than pageSize items, it means we're on the last page
          // and there's only 1 page total (assuming this is the complete dataset)
          setTotalPages(1);
        } else {
          // If we have exactly pageSize items, we need to check if there are more pages
          // This is tricky without total count, so we'll assume current page logic
          setTotalPages(Math.max(1, pageNum));
        }
      }
    } catch (err) {
      console.log(err);
      // On error, reset to safe defaults
      setTotalPages(1);
      setEnquiry([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await axiosInstance.delete(`${API_URLS.ENQUIRY.DELETE_ENQUIRY(row.id)}`);
      toast({ title: 'Enquiry deleted successfully', variant: 'success' });
      fetchEnquiry(page, searchTerm);
    } catch (err) {
      toast({ title: 'Failed to delete enquiry', variant: 'destructive' });
      console.error(err);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setPage(1);
    setSearchTerm("");
    fetchEnquiry(1, "");
    toast({ title: 'Table refreshed', variant: 'default' });
  };

  useEffect(() => {
    fetchEnquiry(page, searchTerm);
  }, [page]);

  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: false,
      render: (_value, _row, index) => (
        <span className="font-medium">{(page - 1) * pageSize + index + 1}</span>
      )
    },
    { key: 'candidate_name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'required_service_name',
      label: 'Service',
      // render: (value, row) => (
      //   <Badge className={row.serviceColor}>{value}</Badge>
      // )
    },
    {
      key: 'preferred_course_name',
      label: 'Preferred Course',
      // render: (value, row) => (
      //   <Badge className={row.examsColor}>{value}</Badge>
      // )
    },
    { key: 'created_by_name', label: 'Created by' },
    { key: 'branch_name', label: 'Branch' },
    { key: 'mettad_name', label: 'Source' },
    { key: 'assigned_by_name', label: 'Assigned to' }
  ];

  const actions: TableAction[] = [
    {
      label: 'View Profile',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (row) => {
        if (userRole === "Telecaller") {
          navigate(`/telecaller-leads/profile/${row.id}`);
        } else {
          navigate(`/leads/profile/${row.id}`);
        }
      }
    },
    {
      label: 'Delete',
      icon: <Trash className="h-4 w-4 mr-2" />,
      onClick: handleDelete
    },
  ];

  const handleExportExcel = () => {
    if (!Enquiries || Enquiries.length === 0) {
      return;
    }
    // Prepare data for export (flatten objects, remove unwanted fields)
    const exportData = Enquiries.map(({ id, candidate_name, phone, required_service, preferred_course, created_by_name, branch_name, mettad_name, assigned_by_name }) => ({
      ID: id,
      Name: candidate_name,
      Phone: phone,
      Service: required_service,
      'Preferred Course': preferred_course,
      'Created by': created_by_name,
      Branch: branch_name,
      Source: mettad_name,
      'Assigned to': assigned_by_name
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

    // Make header row bold
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
      worksheet[cellAddress].s.font = { bold: true };
    }
    workbook.Sheets['Enquiries'] = worksheet;
    workbook.SheetNames = ['Enquiries'];
    XLSX.writeFile(workbook, `enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export actions - only show for non-Telecaller users
  const exportActions = userRole !== "Telecaller" ? [
    {
      label: 'EXCEL',
      onClick: handleExportExcel,
      variant: 'outline' as const
    },
  ] : [];

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(Enquiries.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchEnquiry(1, term);
    setPage(1);
  };

  // Helper to generate page numbers with ellipsis
  function getPageNumbers(current: number, total: number) {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  }

  return (
    <>
      <div className="px-2 md:px-6 w-full">
        {/* Add Reset Button */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              setSearchTerm("");
              setPage(1);
              fetchEnquiry(1, "");
              toast({ title: 'Table reset', variant: 'default' });
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <DynamicTable
              data={Enquiries}
              columns={columns}
              actions={actions}
              // filters={filters}
              searchPlaceholder="Search"
              onSearch={handleSearch}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              selectedRows={selectedRows}
              rowIdKey="id"
              showBulkActions={true}
              exportActions={exportActions}
            />
          </div>
        )}

        {/* Only show pagination if there are pages */}
        {totalPages > 0 && (
          <div className="mt-4 flex justify-center">
            <Pagination className="w-full max-w-full overflow-x-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {getPageNumbers(page, totalPages).map((p, idx) =>
                  p === '...'
                    ? <PaginationEllipsis key={"ellipsis-" + idx} />
                    : <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={e => {
                          e.preventDefault();
                          setPage(Number(p));
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}