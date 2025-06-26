
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Download, FileText, FileSpreadsheet, Copy, Columns, X, Edit, RotateCcw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    id: "12122",
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
    id: "12122",
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
    id: "12122",
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
    id: "12122",
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(activeEnquiries.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Table Controls */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                Bulk Actions
              </Button>
              <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
                PDF
              </Button>
              <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
                CSV
              </Button>
              <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
                EXCEL
              </Button>
              <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
                COPY
              </Button>
              <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
                COLUMNS
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                All time
                <X className="h-3 w-3 ml-1" />
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Recent
                <X className="h-3 w-3 ml-1" />
              </Badge>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More filters
              </Button>
            </div>
            
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === activeEnquiries.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>ID ↓</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Exams</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Job</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEnquiries.map((enquiry, index) => (
                <TableRow key={`${enquiry.id}-${index}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(enquiry.id)}
                      onCheckedChange={(checked) => handleSelectRow(enquiry.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{enquiry.id}</TableCell>
                  <TableCell>{enquiry.name}</TableCell>
                  <TableCell>{enquiry.phone}</TableCell>
                  <TableCell>
                    <Badge className={enquiry.serviceColor}>{enquiry.service}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={enquiry.examsColor}>{enquiry.exams}</Badge>
                  </TableCell>
                  <TableCell>{enquiry.source}</TableCell>
                  <TableCell>{enquiry.branch}</TableCell>
                  <TableCell>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      {enquiry.job}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <div className="h-4 w-4 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            R
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Refresh
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
