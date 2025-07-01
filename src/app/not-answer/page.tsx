"use client";

import React from "react";
import { DynamicForm, FormField, FormSection } from "@/components/ui/dynamic-form";
import { DynamicTable, TableColumn, TableAction, TableFilter } from "@/components/ui/dynamic-table";

const NotAnsweredIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 8L8 16M8 8L16 16"
      stroke="#B42318"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="#B42318"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotAnswerPage = () => {
  const formSections: FormSection[] = [
    {
      fields: [
        {
          name: "date",
          label: "Select Date",
          type: "date",
          placeholder: "Sep 30, 2023",
        },
        {
          name: "branch",
          label: "Branch",
          type: "select",
          placeholder: "Select Branch",
          options: [
            { value: "branch1", label: "Branch 1" },
            { value: "branch2", label: "Branch 2" },
          ],
        },
      ],
      columns: 2,
    },
  ];

  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  const callsData = [
    {
      sl: "12122",
      councelor: "Bindya",
      candidate: "Rishita Raj",
      mobile: "9994449494",
      time: "02:30 PM",
    },
    {
      sl: "12122",
      councelor: "Bindya",
      candidate: "Rishita Raj",
      mobile: "9994449494",
      time: "02:30 PM",
    },
  ];

  const tableColumns: TableColumn[] = [
    { key: "sl", label: "SL" },
    { key: "councelor", label: "Councelor" },
    { key: "candidate", label: "Candidate" },
    { key: "mobile", label: "Mobile" },
    { key: "time", label: "Time", render: (value) => <span className="text-green-600 font-semibold">{value}</span> },
  ];

  const tableActions: TableAction[] = [
    {
        label: "Details",
        onClick: (row) => console.log("Viewing details for", row),
        icon: <button className="bg-gray-800 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-900">R</button>
    },
  ];

  const tableFilters: TableFilter[] = [
    { key: "status", label: "All time", value: "all", onRemove: () => console.log("Remove all time filter") },
    { key: "type", label: "Recent", value: "recent", onRemove: () => console.log("Remove recent filter") },
  ];
  
  const exportActions = [
    { label: 'PDF', onClick: () => console.log('Export PDF') },
    { label: 'CSV', onClick: () => console.log('Export CSV') },
    { label: 'EXCEL', onClick: () => console.log('Export EXCEL') },
    { label: 'COPY', onClick: () => console.log('COPY') },
    { label: 'COLUMNS', onClick: () => console.log('COLUMNS') },
  ];

  return (
    <div className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Not Answered Calls</h1>
      </header>
      
      <div className="mb-6">
        <DynamicForm
          sections={formSections}
          onSubmit={handleSubmit}
          submitLabel="Apply Filters"
          showCancel={false} 
          className="pt-4"
        />
      </div>

      <DynamicTable
        data={callsData}
        columns={tableColumns}
        actions={tableActions}
        filters={tableFilters}
        searchPlaceholder="Search..."
        onSearch={(term) => console.log("Searching for:", term)}
        rowIdKey="sl"
        exportActions={exportActions}
        showBulkActions={false}
      />
    </div>
  );
};

export default NotAnswerPage;
