
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarIcon, Plus, Search, Filter, Download, FileText, FileSpreadsheet, Copy, Columns } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActiveEnquiryTable } from "@/components/ActiveEnquiryTable";

export function ActiveEnquirySection() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Active Enquiry</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Enquiry
        </Button>
      </div>

      {/* Filtration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 uppercase">New Enquiry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Exam Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Exam</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Search Here" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jee">JEE</SelectItem>
                  <SelectItem value="neet">NEET</SelectItem>
                  <SelectItem value="gate">GATE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Service</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Search Here" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coaching">Coaching</SelectItem>
                  <SelectItem value="online">Online Classes</SelectItem>
                  <SelectItem value="test-series">Test Series</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Branch</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Search Here" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kozhikode">Kozhikode</SelectItem>
                  <SelectItem value="kochi">Kochi</SelectItem>
                  <SelectItem value="trivandrum">Trivandrum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Search Here" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Starting Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Sep 30, 2025"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ending Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd, yyyy") : "Sep 30, 2025"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <ActiveEnquiryTable />
    </div>
  );
}
