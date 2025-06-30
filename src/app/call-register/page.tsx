import React, { useState } from 'react';
import { DynamicTable, TableColumn, TableFilter } from '@/components/ui/dynamic-table';
import { DynamicForm, FormSection } from '@/components/ui/dynamic-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const callRegisterData = [
  {
    sl: '12122',
    counselor: 'Bindya',
    candidate: 'Rishita Raj',
    mobile: '9994449494',
    type: 'Direct',
    status: '',
    response: { label: 'Positive', value: 'positive' },
    remark: 'Kerala',
    duration: '1:00 - 2:30 PM',
    date: '12/12/23',
    time: { label: '02:30 PM', value: '02:30 PM' },
    branch: 'Kozhikode',
  },
  {
    sl: '12122',
    counselor: 'Bindya',
    candidate: 'Rishita Raj',
    mobile: '9994449494',
    type: 'Direct',
    status: '',
    response: { label: 'Negative', value: 'negative' },
    remark: 'Kerala',
    duration: '1:00 - 2:30 PM',
    date: '12/12/23',
    time: { label: '02:30 PM', value: '02:30 PM' },
    branch: 'Kozhikode',
  },
];

const columns: TableColumn[] = [
  { key: 'sl', label: 'SL', sortable: true, width: 'w-20' },
  { key: 'counselor', label: 'Councelor' },
  { key: 'candidate', label: 'Candidate' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  {
    key: 'response',
    label: 'Reponse',
    render: (value) => (
      <Badge variant="secondary" className={
        value.label === 'Positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }>
        {value.label}
      </Badge>
    ),
  },
  { key: 'remark', label: 'Remark' },
  { key: 'duration', label: 'Duration' },
  { key: 'date', label: 'Date' },
  {
    key: 'time',
    label: 'Time',
    render: (value) => (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {value.label}
      </Badge>
    ),
  },
  { key: 'branch', label: 'Branch' },
];

const formSections: FormSection[] = [
  {
    fields: [
      {
        name: 'dateRange',
        label: 'Date Range',
        type: 'date',
        placeholder: 'Sep 30, 2023 - Aug 30, 2023',
        required: false,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'Select Status',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
        ],
        required: false,
      },
    ],
    columns: 2,
    className: 'grid grid-cols-1 md:grid-cols-1 gap-4',
  },
  {
    fields: [
      {
        name: 'branch',
        label: 'Branch',
        type: 'select',
        placeholder: 'Select Branch',
        options: [
          { value: 'kozhikode', label: 'Kozhikode' },
          { value: 'kerala', label: 'Kerala' },
        ],
        required: false,
      },
      {
        name: 'counselor',
        label: 'Councelor',
        type: 'select',
        placeholder: 'Select Councelor',
        options: [
          { value: 'bindya', label: 'Bindya' },
        ],
        required: false,
      },
      {
        name: 'response',
        label: 'Response',
        type: 'select',
        placeholder: 'Select Counselor',
        options: [
          { value: 'positive', label: 'Positive' },
          { value: 'negative', label: 'Negative' },
        ],
        required: false,
      },
    ],
    columns: 3,
    className: 'grid grid-cols-1 md:grid-cols-1 gap-4',
  },
];

export default function CallRegisterPage() {
  const [filters, setFilters] = useState<TableFilter[]>([
    { key: 'allTime', label: 'All time', value: '', onRemove: () => removeFilter('allTime') },
    { key: 'recent', label: 'Recent', value: '', onRemove: () => removeFilter('recent') },
  ]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [data, setData] = useState(callRegisterData);

  function removeFilter(key: string) {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  }

  function handleSearch(term: string) {
    // Implement search logic here
  }

  function handleSelectAll(selected: boolean) {
    setSelectedRows(selected ? data.map((row) => row.sl) : []);
  }

  function handleSelectRow(id: string, selected: boolean) {
    setSelectedRows((prev) =>
      selected ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-8">
      <div className="text-xs text-gray-400 mb-1">Call Register</div>
      <h1 className="text-3xl font-bold mb-6">Call Register</h1>
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
        rowIdKey="sl"
        exportActions={[
          { label: 'PDF', onClick: () => {}, variant: 'outline' },
          { label: 'CSV', onClick: () => {}, variant: 'outline' },
          { label: 'EXCEL', onClick: () => {}, variant: 'outline' },
          { label: 'COPY', onClick: () => {}, variant: 'outline' },
          { label: 'COLUMNS', onClick: () => {}, variant: 'outline' },
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
