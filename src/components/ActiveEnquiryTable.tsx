import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicTable, TableColumn, TableAction, TableFilter } from "@/components/ui/dynamic-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Eye, Trash } from "lucide-react";
import axiosInstance from './apiconfig/axios';
import { API_URLS } from './apiconfig/api_urls';
import { error } from 'console';
import { toast } from '@/hooks/use-toast';
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

export function ActiveEnquiryTable() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token")
  
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
  const [totalPages, setTotalPages] = useState(1); // Will be set from API response
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  const removeFilter = (key: string) => {
    setFilters(filters.filter(f => f.key !== key));
  };

  const fetchEnquiry = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      let url = `${API_URLS.ENQUIRY.GET_ACTIVE_ENQUIRY}?page=${pageNum}`;
      if (searchTerm) {
        url += `&candidate_name=${encodeURIComponent(searchTerm)}`;
      }
      console.log(url);
      
      const response = await axiosInstance.get(url,{
        headers:{
          "Authorization":`Bearer ${token}`
        }
      });
      console.log(response);
      const filtered = response.data.data 
      setEnquiry(response.data.data);
      // Set totalPages from API pagination response
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

  // Delete handler
  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await axiosInstance.delete(`${API_URLS.ENQUIRY.DELETE_ENQUIRY(row.id)}`);
      toast({ title: 'Enquiry deleted successfully', variant: 'success' });
      fetchEnquiry(page);
    } catch (err) {
      toast({ title: 'Failed to delete enquiry', variant: 'destructive' });
      console.error(err);
    }
  };

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
    { key: 'mettad_name', label: 'Source'},
    { key: 'assigned_by_name', label: 'Assigned to'}
  ];

  const actions: TableAction[] = [
    {
      label: 'View Profile',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (row) => {
        const userData = localStorage.getItem("user_data");
        const user = userData ? JSON.parse(userData) : null;
        
        if (user && user.role === "Telecaller") {
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
    // {
    //   label: 'Refresh',
    //   icon: <RotateCcw className="h-4 w-4 mr-2" />,
    //   onClick: (row) => console.log('Refresh:', row)
    // }
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

  const exportActions = [
    {
      label: 'EXCEL',
      onClick: handleExportExcel,
      variant: 'outline' as const
    },
  ];

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
      </div>
    </>
  );
}
