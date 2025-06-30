import React, { useState } from 'react';
import { DynamicTable, TableColumn, TableFilter } from '@/components/ui/dynamic-table';
import { DynamicForm, FormSection } from '@/components/ui/dynamic-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const walkInListData = [
  {
    sl: '12122',
    candidate: 'Rishita Raj',
    phone: '9997776543',
    counselor: '9997776543',
    branch: 'Kozhikode',
    state: 'Kerala',
    walkInDate: '12/12/23',
    fixedOn: '9997776543',
    remark: 'Will call tomorrow at 4pm',
  },
  {
    sl: '12122',
    candidate: 'Rishita Raj',
    phone: '9997776543',
    counselor: '9997776543',
    branch: 'Kozhikode',
    state: 'Kerala',
    walkInDate: '12/12/23',
    fixedOn: '9997776543',
    remark: 'Good to hear about topic',
  },
  {
    sl: '12122',
    candidate: 'Rishita Raj',
    phone: '9997776543',
    counselor: '9997776543',
    branch: 'Kozhikode',
    state: 'Kerala',
    walkInDate: '12/12/23',
    fixedOn: '9997776543',
    remark: 'Will call tomorrow at 4pm',
  },
  {
    sl: '12122',
    candidate: 'Rishita Raj',
    phone: '9997776543',
    counselor: '9997776543',
    branch: 'Kozhikode',
    state: 'Kerala',
    walkInDate: '12/12/23',
    fixedOn: '9997776543',
    remark: 'Good to hear about topic',
  },
];

const columns: TableColumn[] = [
    { key: 'sl', label: 'SL', sortable: true, width: 'w-20' },
    { key: 'candidate', label: 'Candidate' },
    { key: 'phone', label: 'Phone' },
    { key: 'branch', label: 'Branch' },
    { key: 'state', label: 'State' },
    { key: 'walkInDate', label: 'Date' },
    { key: 'fixedOn', label: 'Fixed On' },
    { key: 'remark', label: 'Remark' },
    { key: 'actions', label: 'Actions' },
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
          type: 'text',
          placeholder: 'Search Here',
          required: false,
        },
        {
          name: 'branch',
          label: 'Branch',
          type: 'text',
          placeholder: 'Search Here',
          required: false,
        },
        {
          name: 'counselor',
          label: 'Counselor',
          type: 'text',
          placeholder: 'Search Here',
          required: false,
        },
      ],
      columns: 2,
      className: 'grid grid-cols-1 md:grid-cols-1 gap-4',
    },
  ];
  

export default function FollowUps() {
  const [filters, setFilters] = useState<TableFilter[]>([
    { key: 'allTime', label: 'All time', value: '', onRemove: () => removeFilter('allTime') },
    { key: 'recent', label: 'Recent', value: '', onRemove: () => removeFilter('recent') },
  ]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [data, setData] = useState(walkInListData);

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
      <div className="text-xs text-gray-400 mb-1">Follow Ups</div>
      <h1 className="text-3xl font-bold mb-6">Follow Ups</h1>
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
