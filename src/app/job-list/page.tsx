import React, { useState } from 'react';
import { DynamicTable, TableColumn, TableFilter } from '@/components/ui/dynamic-table';
import { DynamicForm, FormField, FormSection } from '@/components/ui/dynamic-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

const jobListData = [
  {
    id: '12122',
    jobName: 'Rishita Raj',
    counselor: '9997776543',
    datePeriod: { label: 'Adm A', value: 'adm_a' },
    progress: { value: 40, label: '40/100' },
    remark: 'Will call tomorrow at 4pm',
    createdBy: 'Kozhikode',
  },
  {
    id: '12122',
    jobName: 'Rishita Raj',
    counselor: '9997776543',
    datePeriod: { label: 'Customer', value: 'customer' },
    progress: { value: 40, label: '40/100' },
    remark: 'Good to hear about topic',
    createdBy: 'Kozhikode',
  },
  {
    id: '12122',
    jobName: 'Rishita Raj',
    counselor: '9997776543',
    datePeriod: { label: 'Customer', value: 'customer' },
    progress: { value: 40, label: '40/100' },
    remark: 'Will call tomorrow at 4pm',
    createdBy: 'Kozhikode',
  },
  {
    id: '12122',
    jobName: 'Rishita Raj',
    counselor: '9997776543',
    datePeriod: { label: 'Customer', value: 'customer' },
    progress: { value: 40, label: '40/100' },
    remark: 'Good to hear about topic',
    createdBy: 'Kozhikode',
  },
  {
    id: '12122',
    jobName: 'Rishita Raj',
    counselor: '9997776543',
    datePeriod: { label: 'Customer', value: 'customer' },
    progress: { value: 40, label: '40/100' },
    remark: 'i ll call later',
    createdBy: 'Kozhikode',
  },
  {
    id: '12122',
    jobName: 'Rishita Raj',
    counselor: '9997776543',
    datePeriod: { label: 'Customer', value: 'customer' },
    progress: { value: 40, label: '40/100' },
    remark: 'busy right now',
    createdBy: 'Kozhikode',
  },
];

const columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: 'w-24' },
  { key: 'jobName', label: 'Job Name' },
  { key: 'counselor', label: 'Councelor' },
  {
    key: 'datePeriod',
    label: 'Date Period',
    render: (value) => (
      <Badge variant="secondary" className={
        value.label === 'Adm A' ? 'bg-green-100 text-green-800' : 'bg-green-50 text-green-700'
      }>
        {value.label}
      </Badge>
    ),
  },
  {
    key: 'progress',
    label: 'Progress',
    type: 'progress',
  },
  { key: 'remark', label: 'Remark' },
  { key: 'createdBy', label: 'Created By' },
];

const formSections: FormSection[] = [
  {
    fields: [
      {
        name: 'branch',
        label: 'Branch',
        type: 'select',
        placeholder: 'Search Here',
        options: [
          { value: 'kozhikode', label: 'Kozhikode' },
          { value: 'adm_a', label: 'Adm A' },
        ],
        required: false,
      },
      {
        name: 'counselor',
        label: 'Councelor',
        type: 'text',
        placeholder: 'Search Here',
        required: false,
      },
    ],
    columns: 2,
    className: 'grid grid-cols-1 md:grid-cols-1 gap-4',
  },
];

export default function JobListPage() {
  const [filters, setFilters] = useState<TableFilter[]>([
    { key: 'allTime', label: 'All time', value: '', onRemove: () => removeFilter('allTime') },
    { key: 'recent', label: 'Recent', value: '', onRemove: () => removeFilter('recent') },
  ]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [data, setData] = useState(jobListData);

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

  function handleEdit(row: any) {
    alert('Edit: ' + row.id);
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-8">
      <div className="text-xs text-gray-400 mb-1">Job List {'>'} Remaining Job List</div>
      <h1 className="text-3xl font-bold mb-6">Remaining Job List</h1>
      <div className="mb-6">
        <DynamicForm
          sections={formSections}
          onSubmit={() => {}}
          showCancel={false}
          submitLabel="Search"
          className="bg-white shadow-none border border-gray-200 pt-6"
        />
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
            label: 'Edit',
            icon: <Pencil className="mr-2 h-4 w-4 text-gray-500" />,
            onClick: handleEdit,
            variant: 'outline',
          },
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
