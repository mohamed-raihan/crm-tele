import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicTable, TableColumn, TableAction, TableFilter } from "@/components/ui/dynamic-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, RotateCcw, Eye } from "lucide-react";

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

  const removeFilter = (key: string) => {
    setFilters(filters.filter(f => f.key !== key));
  };

  const columns: TableColumn[] = [
    { 
      key: 'id', 
      label: 'ID', 
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'service', 
      label: 'Service',
      render: (value, row) => (
        <Badge className={row.serviceColor}>{value}</Badge>
      )
    },
    { 
      key: 'exams', 
      label: 'Exams',
      render: (value, row) => (
        <Badge className={row.examsColor}>{value}</Badge>
      )
    },
    { key: 'source', label: 'Source' },
    { key: 'branch', label: 'Branch' },
    { 
      key: 'job', 
      label: 'Job',
      render: (value) => (
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          {value}
        </Button>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      label: 'View Profile',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (row) => navigate(`/leads/profile/${row.id}`)
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
      label: 'PDF',
      onClick: () => console.log('Export PDF'),
      variant: 'outline' as const
    },
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
    {
      label: 'COPY',
      onClick: () => console.log('Copy'),
      variant: 'outline' as const
    },
    {
      label: 'COLUMNS',
      onClick: () => console.log('Columns'),
      variant: 'outline' as const
    }
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
    <DynamicTable
      data={activeEnquiries}
      columns={columns}
      actions={actions}
      filters={filters}
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
  );
}
