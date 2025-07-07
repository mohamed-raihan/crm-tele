import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicTable, TableColumn, TableAction, TableFilter } from "@/components/ui/dynamic-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Eye } from "lucide-react";
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
} from "@/components/ui/pagination";

// Mock data for active enquiries
const activeEnquiries = [
  {
    id: "12122",
    name: "Rishita Raj",
    phone: "9997776543",
    service: "Adm A",
    serviceColor: "bg-green-100 text-green-800",
    exams: "Customer",
    examsColor: "bg-green-100 text-green-800",
    source: "Direct",
    branch: "Kozhikode",
    job: "+ Create Job"
  },
  {
    id: "12123",
    name: "Rishita Raj",
    phone: "9997776543",
    service: "Customer",
    serviceColor: "bg-blue-100 text-blue-800",
    exams: "Customer",
    examsColor: "bg-green-100 text-green-800",
    source: "Mathrboomi Online",
    branch: "Kozhikode",
    job: "+ Create Job"
  },
  {
    id: "12124",
    name: "Rishita Raj",
    phone: "9997776543",
    service: "Customer",
    serviceColor: "bg-blue-100 text-blue-800",
    exams: "Customer",
    examsColor: "bg-green-100 text-green-800",
    source: "Direct",
    branch: "Kozhikode",
    job: "+ Create Job"
  },
  {
    id: "12125",
    name: "Rishita Raj",
    phone: "9997776543",
    service: "Customer",
    serviceColor: "bg-blue-100 text-blue-800",
    exams: "Customer",
    examsColor: "bg-green-100 text-green-800",
    source: "Direct",
    branch: "Kozhikode",
    job: "+ Create Job"
  },
  {
    id: "12126",
    name: "Rishita Raj",
    phone: "9997776543",
    service: "Customer",
    serviceColor: "bg-blue-100 text-blue-800",
    exams: "Customer",
    examsColor: "bg-green-100 text-green-800",
    source: "Direct",
    branch: "Kozhikode",
    job: "+ Create Job"
  }
];

export function ActiveEnquiryTable() {
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
  const [totalPages, setTotalPages] = useState(5); // Default to 5, update if API returns total
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  const removeFilter = (key: string) => {
    setFilters(filters.filter(f => f.key !== key));
  };

  const fetchEnquiry = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_URLS.ENQUIRY.GET_ENQUIRY}?page=${pageNum}`);
      console.log(response);
      const filtered = response.data.data 
      setEnquiry(response.data.data);
      // If API returns total count or total pages, update totalPages here
      if (response.data.total_pages) {
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
      key: 'required_service', 
      label: 'Service',
      render: (value, row) => (
        <Badge className={row.serviceColor}>{value}</Badge>
      )
    },
    { 
      key: 'preferred_course', 
      label: 'Preferred Course',
      render: (value, row) => (
        <Badge className={row.examsColor}>{value}</Badge>
      )
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
      label: 'Edit',
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (row) => console.log('Edit:', row)
    },
    {
      label: 'Refresh',
      icon: <RotateCcw className="h-4 w-4 mr-2" />,
      onClick: (row) => console.log('Refresh:', row)
    }
  ];

  const bulkActions = [
    {
      label: 'Bulk Actions',
      onClick: (selectedIds: string[]) => console.log('Bulk action:', selectedIds),
      variant: 'outline' as const
    }
  ];

  const exportActions = [
    {
      label: 'CSV',
      onClick: () => console.log('Export CSV'),
      variant: 'outline' as const
    },
    {
      label: 'EXCEL',
      onClick: () => console.log('Export Excel'),
      variant: 'outline' as const
    },
  ];

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(activeEnquiries.map(item => item.id));
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
    console.log('Search:', term);
    // Implement search functionality
  };

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
              bulkActions={bulkActions}
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
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    onClick={e => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
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
