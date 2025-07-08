import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [callsPage, setCallsPage] = useState(1);
  const [callsTotalPages, setCallsTotalPages] = useState(1);
  const [callsTotalRecords, setCallsTotalRecords] = useState(0);
  const [callsSearch, setCallsSearch] = useState("");
  const [callsSearchInput, setCallsSearchInput] = useState("");
  const callsDebounceRef = useRef<NodeJS.Timeout | undefined>();

  // Fetch calls data
  useEffect(() => {
    const fetchCalls = async () => {
      setCallsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        const params = new URLSearchParams({
          page: callsPage.toString(),
          limit: "10",
        });
        if (callsSearch) params.append("search", callsSearch);
        const response = await axiosInstance.get(
          `${API_URLS.CALLS.GET_CALLS}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && response.data.data) {
          setCalls(response.data.data);
          setCallsTotalPages(response.data.pagination?.totalPages || 1);
          setCallsTotalRecords(response.data.pagination?.total || 0);
        } else {
          setCalls([]);
          setCallsTotalPages(1);
          setCallsTotalRecords(0);
        }
      } catch {
        setCalls([]);
        setCallsTotalPages(1);
        setCallsTotalRecords(0);
      } finally {
        setCallsLoading(false);
      }
    };
    fetchCalls();
  }, [callsPage, callsSearch]);

  // Debounce search input
  useEffect(() => {
    if (callsDebounceRef.current) clearTimeout(callsDebounceRef.current);
    callsDebounceRef.current = setTimeout(() => {
      setCallsSearch(callsSearchInput);
      setCallsPage(1);
    }, 500);
    return () => {
      if (callsDebounceRef.current) clearTimeout(callsDebounceRef.current);
    };
  }, [callsSearchInput]);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 bg-gray-50">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search by candidate name or phone..."
              value={callsSearchInput}
              onChange={e => setCallsSearchInput(e.target.value)}
              className="w-full md:w-64"
              onKeyDown={e => e.key === "Enter" && setCallsSearch(callsSearchInput)}
            />
            <Button onClick={() => setCallsSearch(callsSearchInput)} variant="outline" className="w-auto">
              Search
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Call Status</TableHead>
                  <TableHead>Call Outcome</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Telecaller</TableHead>
                  <TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : calls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No calls found
                    </TableCell>
                  </TableRow>
                ) : (
                  calls.map((call, idx) => (
                    <TableRow key={call.id || idx}>
                      <TableCell>{(callsPage - 1) * 10 + idx + 1}</TableCell>
                      <TableCell>{call.candidate_name || call.enquiry_details?.candidate_name || "-"}</TableCell>
                      <TableCell>{call.phone || call.enquiry_details?.phone || "-"}</TableCell>
                      <TableCell>{call.call_status || "-"}</TableCell>
                      <TableCell>{call.call_outcome || "-"}</TableCell>
                      <TableCell>{call.call_start_time || "-"}</TableCell>
                      <TableCell>{call.telecaller_name || "-"}</TableCell>
                      <TableCell>{call.branch_name || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {callsTotalPages > 1 && (
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="text-sm text-gray-600">
                Showing {(callsPage - 1) * 10 + 1} to {Math.min(callsPage * 10, callsTotalRecords)} of {callsTotalRecords} entries
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={callsPage === 1}
                  onClick={() => setCallsPage(callsPage - 1)}
                >
                  Previous
                </Button>
                {[...Array(callsTotalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={callsPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCallsPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={callsPage === callsTotalPages}
                  onClick={() => setCallsPage(callsPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 