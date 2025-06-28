import React, { useState } from 'react';
import { DynamicTable, TableColumn, TableFilter } from '@/components/ui/dynamic-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

const executiveData = [
  {
    id: '12122',
    name: 'Rishita Raj',
    email: 'rishita123@gmail.com',
    mobile: '9997776543',
    type: 'Executive',
    activation: 'Active',
  },
  {
    id: '12122',
    name: 'Rishita Raj',
    email: 'rishita123@gmail.com',
    mobile: '9997776543',
    type: 'Executive',
    activation: 'Active',
  },
  {
    id: '12122',
    name: 'Rishita Raj',
    email: 'rishita123@gmail.com',
    mobile: '9997776543',
    type: 'Executive',
    activation: 'Inactive',
  },
  {
    id: '12122',
    name: 'Rishita Raj',
    email: 'rishita123@gmail.com',
    mobile: '9997776543',
    type: 'Executive',
    activation: 'Active',
  },
  {
    id: '12122',
    name: 'Rishita Raj',
    email: 'rishita123@gmail.com',
    mobile: '9997776543',
    type: 'Branch Manager',
    activation: 'Inactive',
  },
  {
    id: '12122',
    name: 'Rishita Raj',
    email: 'rishita123@gmail.com',
    mobile: '9997776543',
    type: 'Branch Manager',
    activation: 'Active',
  },
];

const columns: TableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: 'w-24',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'mobile',
    label: 'Mobile',
  },
  {
    key: 'type',
    label: 'Type',
    render: (value) => (
      <Badge variant="secondary" className={
        value === 'Executive' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
      }>
        {value}
      </Badge>
    ),
  },
  {
    key: 'activation',
    label: 'Activation',
    render: (value) => (
      <Badge variant="secondary" className={
        value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }>
        {value}
      </Badge>
    ),
  },
];

export default function ExecutivePage() {
  const [filters, setFilters] = useState<TableFilter[]>([
    { key: 'allTime', label: 'All time', value: '', onRemove: () => removeFilter('allTime') },
    { key: 'recent', label: 'Recent', value: '', onRemove: () => removeFilter('recent') },
  ]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [data, setData] = useState(executiveData);

  function removeFilter(key: string) {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  }

  function handleSearch(term: string) {
    // Implement search logic here
  }

  function handleSelectAll(selected: boolean) {
    setSelectedRows(selected ? data.map((row) => row.id) : []);
  }

  function handleSelectRow(id: string, selected: boolean) {
    setSelectedRows((prev) =>
      selected ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  }

  function handleDelete(row: any) {
    setData((prev) => prev.filter((item) => item.id !== row.id));
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xs text-gray-400 mb-1">Executive</div>
          <h1 className="text-3xl font-bold">Executive</h1>
        </div>
        <Button className="bg-[#7367f0] hover:bg-[#5e50ee] text-white" onClick={() => alert('Add Executive clicked!')}>
          <Plus className="mr-2 h-4 w-4" /> Add Executive
        </Button>
      </div>
      <DynamicTable
        data={data}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search"
        onSearch={handleSearch}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        selectedRows={selectedRows}
        rowIdKey="id"
        exportActions={[
          { label: 'PDF', onClick: () => {}, variant: 'outline' },
          { label: 'CSV', onClick: () => {}, variant: 'outline' },
          { label: 'EXCEL', onClick: () => {}, variant: 'outline' },
          { label: 'COPY', onClick: () => {}, variant: 'outline' },
          { label: 'COLUMNS', onClick: () => {}, variant: 'outline' },
        ]}
        actions={[
          {
            label: 'Delete',
            icon: <Trash2 className="mr-2 h-4 w-4 text-red-500" />,
            onClick: handleDelete,
            variant: 'destructive',
          },
        ]}
      />
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>Page 1 of 10</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
