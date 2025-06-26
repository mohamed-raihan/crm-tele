
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";

// Mock data for contact history
const contactHistory = [
  {
    counselor: "Bindhya",
    status: "Positive",
    date: "12/12/23",
    time: "02:30 PM",
    contactStatus: "Incoming",
    response: "Will call tomorrow at 4pm"
  },
  {
    counselor: "Bindhya",
    status: "Positive",
    date: "12/12/23",
    time: "02:30 PM",
    contactStatus: "Outgoing",
    response: "Good to hear about topic"
  },
  {
    counselor: "Bindhya",
    status: "Positive",
    date: "12/12/23",
    time: "02:30 PM",
    contactStatus: "Outgoing",
    response: "I'll call later"
  },
  {
    counselor: "Bindhya",
    status: "Positive",
    date: "12/12/23",
    time: "02:30 PM",
    contactStatus: "Outgoing",
    response: "busy right now"
  }
];

export function ContactHistoryTab() {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              All time
              <X className="h-3 w-3 ml-1 cursor-pointer" />
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Recent
              <X className="h-3 w-3 ml-1 cursor-pointer" />
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
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Counselor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactHistory.map((contact, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{contact.counselor}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell>{contact.date}</TableCell>
                <TableCell className="text-green-600">{contact.time}</TableCell>
                <TableCell>
                  <Badge variant={contact.contactStatus === 'Incoming' ? 'default' : 'secondary'} 
                         className={contact.contactStatus === 'Incoming' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}>
                    {contact.contactStatus}
                  </Badge>
                </TableCell>
                <TableCell>{contact.response}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">Page 1 of 10</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
