import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, Edit, RotateCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from '@/components/ui/progress';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  width?: string;
  type?: 'progress';
}

export interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface TableFilter {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface DynamicTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  filters?: TableFilter[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  onSelectAll?: (selected: boolean) => void;
  onSelectRow?: (id: string, selected: boolean) => void;
  selectedRows?: string[];
  rowIdKey?: string;
  showBulkActions?: boolean;
  bulkActions?: Array<{
    label: string;
    onClick: (selectedIds: string[]) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  exportActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}

export function DynamicTable({
  data,
  columns,
  actions = [],
  filters = [],
  searchPlaceholder = "Search",
  onSearch,
  onSelectAll,
  onSelectRow,
  selectedRows = [],
  rowIdKey = 'id',
  showBulkActions = false,
  bulkActions = [],
  exportActions = []
}: DynamicTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    onSelectRow?.(id, checked);
  };

  const showSelectionColumn = onSelectAll && onSelectRow;

  return (
    <Card>
      <CardContent className="p-0">
        {/* Table Controls */}
        <div className="p-4 border-b">
          {(showBulkActions || exportActions.length > 0) && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {showBulkActions && bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => action.onClick(selectedRows)}
                    disabled={selectedRows.length === 0}
                  >
                    {action.label}
                  </Button>
                ))}
                {exportActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    className={
                      action.label === 'EXCEL' || action.label === 'Export Excel' || action.label === 'Export to Excel'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : ''
                    }
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {filter.label}: {filter.value}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={filter.onRemove} />
                </Badge>
              ))}
              {/* <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More filters
              </Button> */}
            </div>
            {onSearch && (
              <div className="relative w-full sm:w-64 min-w-0">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {showSelectionColumn && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.length === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.width}>
                    {column.label}
                    {column.sortable && " ↓"}
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row[rowIdKey] || index}>
                  {showSelectionColumn && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(row[rowIdKey])}
                        onCheckedChange={(checked) => handleSelectRow(row[rowIdKey], checked as boolean)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.type === 'progress' ? (
                        <div className="flex items-center gap-2">
                          <Progress value={row[column.key]?.value || 0} />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {row[column.key]?.label || `${row[column.key] || 0}%`}
                          </span>
                        </div>
                      ) : column.render ? (
                        column.render(row[column.key], row, index)
                      ) : (
                        row[column.key]
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <div className="h-4 w-4 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              ⋮
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem key={actionIndex} onClick={() => action.onClick(row)}>
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
