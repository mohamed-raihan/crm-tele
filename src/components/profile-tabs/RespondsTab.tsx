
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for responses
const responses = [
  {
    response: "Will call tomorrow at 4pm",
    date: "12/12/23",
    time: "02:30 PM"
  },
  {
    response: "Good to hear about topic",
    date: "12/12/23",
    time: "02:30 PM"
  },
  {
    response: "I'll call later",
    date: "12/12/23",
    time: "02:30 PM"
  },
  {
    response: "busy right now",
    date: "12/12/23",
    time: "02:30 PM"
  }
];

export function RespondsTab() {
  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Response</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{response.response}</TableCell>
                <TableCell>{response.date}</TableCell>
                <TableCell className="text-green-600">{response.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
