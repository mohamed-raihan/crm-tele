
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import axiosInstance from '../apiconfig/axios';
import { API_URLS } from '../apiconfig/api_urls';

// Mock data for contact history
interface history {
    telecaller: string;
    call_status: string;
    call_type: string;
    call_outcome: string;
    call_start_time: string;
    call_duration: string;
    feedback: string;
    follow_up_date: string;
  }

interface id {
  id: string;
}

export function ContactHistoryTab(id:id) {

  const [history,setHistory] = useState<history[]>([])

  const fetchHistory = async()=>{
    try{
      const response = await axiosInstance.get(API_URLS.HISTORY.GET_HISTORY(id.id))
      console.log(response);
      setHistory(response.data.call_history)
    }catch(err){
      console.log(err);
      
    }
  }

  useEffect(()=>{
    fetchHistory();
  },[])

  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Telecaller</TableHead>
              <TableHead>Call Status</TableHead>
              <TableHead>Call Type</TableHead>
              <TableHead>Call Outcome</TableHead>
              {/* <TableHead>Call Start Time</TableHead>
              <TableHead>Call Duration</TableHead> */}
              <TableHead>Feedback</TableHead>
              <TableHead>Follow Up Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((contact, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{contact.telecaller}</TableCell>
                <TableCell>{contact.call_status}</TableCell>
                <TableCell>{contact.call_type}</TableCell>
                <TableCell>{contact.call_outcome}</TableCell>
                {/* <TableCell>{contact.call_start_time ? contact.call_start_time : '-'}</TableCell>
                <TableCell>{contact.call_duration ? contact.call_duration : '-'}</TableCell> */}
                <TableCell>{contact.feedback}</TableCell>
                <TableCell>{contact.follow_up_date ? contact.follow_up_date : '-'}</TableCell>
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
