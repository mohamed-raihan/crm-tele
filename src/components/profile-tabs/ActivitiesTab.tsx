
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for activities
const activities = [
  {
    counselor: "Bindhya",
    date: "9997776543",
    time: "02:30 PM",
    status: "Answered"
  },
  {
    counselor: "Bindhya",
    date: "9997776543",
    time: "02:30 PM",
    status: "Answered"
  },
  {
    counselor: "Bindhya",
    date: "9997776543",
    time: "02:30 PM",
    status: "Answered"
  }
];

export function ActivitiesTab() {
  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Counselor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{activity.counselor}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell className="text-green-600">{activity.time}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {activity.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
