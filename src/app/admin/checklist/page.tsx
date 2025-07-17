"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicTable, TableColumn, TableAction } from "@/components/ui/dynamic-table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios.ts";
import { useToast } from "@/components/ui/use-toast";
import { API_URLS } from "@/components/apiconfig/api_urls.ts";
import { DashboardHeader } from "@/components/DashboardHeader";

interface Checklist {
    id: string;
    name: string;
}

export default function ChecklistPage() {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [checklist, setChecklist] = useState({
        id: "",
        name: ""
    });
    const [adding, setAdding] = useState(false);
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Fetch checklists
    const fetchChecklists = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(API_URLS.CHECKLISTS.GET_CHECKLIST);
            setChecklists(res.data.data || []);
        } catch (err) {
            toast({ title: "Failed to fetch checklists", description: "Please try again later.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChecklists();
    }, []);

    // Add or update checklist
    const handleAddChecklist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checklist.name.trim()) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        setAdding(true);
        try {
            if (checklist.id) {
                await axiosInstance.patch(API_URLS.CHECKLISTS.PATCH_CHECKLIST(checklist.id), { name: checklist.name });
                toast({ title: "Checklist updated successfully", variant: "success" });
            } else {
                await axiosInstance.post(API_URLS.CHECKLISTS.POST_CHECKLIST, { name: checklist.name });
                toast({ title: "Checklist added successfully", variant: "success" });
            }
            setChecklist({ id: "", name: "" });
            setOpen(false);
            fetchChecklists();
        } catch (err) {
            toast({ title: "Failed to save checklist", description: "Please try again.", variant: "destructive" });
        } finally {
            setAdding(false);
        }
    };

    // Edit checklist
    const handleEditChecklist = (item: Checklist) => {
        setOpen(true);
        setChecklist(item);
    };

    // Delete checklist
    const handleDeleteChecklist = async (item: Checklist) => {
        if (!window.confirm(`Delete checklist '${item.name}'?`)) return;
        try {
            await axiosInstance.delete(API_URLS.CHECKLISTS.DELETE_CHECKLIST(item.id));
            toast({ title: "Checklist deleted successfully", variant: "success" });
            fetchChecklists();
        } catch (err) {
            toast({ title: "Failed to delete checklist", description: "Please try again.", variant: "destructive" });
        }
    };

    // Table columns
    const columns: TableColumn[] = [
        {
            key: "id",
            label: "ID",
            sortable: false,
            width: "w-24",
            render: (_value, _row, index) => (page - 1) * pageSize + index + 1
        },
        { key: "name", label: "Name" },
    ];

    // Table actions
    const actions: TableAction[] = [
        {
            label: "Edit",
            icon: <Edit className="mr-2 h-4 w-4 text-blue-500" />,
            onClick: handleEditChecklist,
            variant: "outline",
        },
        {
            label: "Delete",
            icon: <Trash2 className="mr-2 h-4 w-4 text-red-500" />,
            onClick: handleDeleteChecklist,
            variant: "destructive",
        },
    ];

    // Pagination logic
    // Sort by creation order (assuming newer items have higher IDs)
    const sortedChecklists = [...checklists];
    sortedChecklists.sort((a, b) => {
        const numA = parseInt(a.id, 10);
        const numB = parseInt(b.id, 10);
        
        // If both are valid numbers, sort numerically (ascending order)
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        
        // Fallback to string comparison if not numeric
        return String(a.id).localeCompare(String(b.id));
    });
    
    const totalPages = Math.ceil(sortedChecklists.length / pageSize);
    const paginatedData = sortedChecklists.slice((page - 1) * pageSize, page * pageSize);

    // Helper for pagination numbers (like notanswered)
    const generatePaginationNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | string)[] = [1];
        if (page > 3) pages.push('...');
        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) pages.push(i);
        }
        if (page < totalPages - 2) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };
    const paginationNumbers = generatePaginationNumbers();

    return (
        <div>
            <DashboardHeader />
            <div className="mx-8 py-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl font-bold">CHECKLIST</CardTitle>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default" className="gap-2 bg-violet-500" size="sm">
                                    <Plus className="h-4 w-4" />Add Checklist
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{checklist.id ? "Edit Checklist" : "Add New Checklist"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddChecklist} className="space-y-4">
                                    <div>
                                        <label htmlFor="checklist-name" className="block text-sm font-medium mb-1">Name</label>
                                        <Input
                                            id="checklist-name"
                                            name="name"
                                            value={checklist.name}
                                            onChange={e => setChecklist({ ...checklist, name: e.target.value })}
                                            placeholder="Enter checklist name"
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="bg-violet-500" disabled={adding}>
                                            {adding ? (checklist.id ? "Updating..." : "Adding...") : (checklist.id ? "Update" : "Add")}
                                        </Button>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <DynamicTable
                            data={paginatedData}
                            columns={columns}
                            actions={actions}
                            searchPlaceholder="Search checklists..."
                        />
                        {/* Pagination Controls */}
                        {checklists.length > pageSize && (
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2">
                                <div className="text-sm text-gray-600">
                                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, checklists.length)} of {checklists.length} entries
                                </div>
                                <div className="flex gap-2 flex-wrap items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Prev
                                    </Button>
                                    {paginationNumbers.map((pageNum, index) => (
                                        <React.Fragment key={index}>
                                            {typeof pageNum === 'string' ? (
                                                <span className="px-2 py-1 text-gray-500">...</span>
                                            ) : (
                                                <Button
                                                    variant={page === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setPage(pageNum)}
                                                    className={page === pageNum ? "bg-green-500 hover:bg-green-600" : ""}
                                                >
                                                    {pageNum}
                                                </Button>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}