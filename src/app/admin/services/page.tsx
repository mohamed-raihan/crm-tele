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
import { Pencil } from "lucide-react";

interface Ad {
    id: string;
    name: string;
}

export default function ServicePage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [ad, setAd] = useState({
        id: "",
        name: ""
    });
    const [adding, setAdding] = useState(false);
    const { toast } = useToast();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(ads.length / pageSize);

    // Helper for pagination numbers (like notanswered)
    const generatePaginationNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | string)[] = [1];
        if (currentPage > 3) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== totalPages) pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };
    const paginationNumbers = generatePaginationNumbers();

    // Fetch ads
    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(API_URLS.SERVICES.GET_SERVICES);
            console.log(res);

            setAds(res.data.data || []);
        } catch (err) {
            console.log(err);
            toast({ title: "Failed to fetch ads", description: "Please try again later.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    // Add ad
    const handleAddAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ad.name.trim()) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        setAdding(true);
        try {
            if (ad.id) {
                await axiosInstance.patch(API_URLS.SERVICES.PATCH_SERVICES(ad.id), { name: ad.name });
                toast({ title: "Source Updated successfully", variant: "success" });
            } else {
                await axiosInstance.post(API_URLS.SERVICES.POST_SERVICES, { name: ad.name });
                toast({ title: "Source added successfully", variant: "success" });
            }
            setAd({ id: "", name: "" });
            setOpen(false);
            fetchAds();
        } catch (err) {
            toast({ title: "Failed to add ad", description: "Please try again.", variant: "destructive" });
        } finally {
            setAdding(false);
        }
    };

    // Edit ad (open modal with name, not implemented in UI for brevity)
    const handleEditAd = (ad: Ad) => {
        // You can implement edit modal logic here
        setOpen(true)
        setAd(ad)
    };

    // Delete ad
    const handleDeleteAd = async (ad: Ad) => {
        if (!window.confirm(`Delete ad '${ad.name}'?`)) return;
        try {
            const response = await axiosInstance.delete(API_URLS.SERVICES.DELETE_SERVICES(ad.id));
            console.log(response);
            toast({ title: "Service deleted successfully", variant: "success" });
            fetchAds();
        } catch (err) {
            console.log(err);

            toast({ title: err.response.data.message, description: "Please try again.", variant: "destructive" });
        }
    };

    // Table columns
    const columns: TableColumn[] = [
        {
            key: "id",
            label: "ID",
            sortable: false,
            width: "w-24",
            render: (value, _row, index) => {
                // Calculate the actual index considering pagination
                const actualIndex = (currentPage - 1) * pageSize + index + 1;
                return actualIndex;
            }
        },
        { key: "name", label: "Name" },
    ];

    // Table actions
    const actions: TableAction[] = [
        {
            label: "Edit",
            icon: <Pencil className="mr-2 h-4 w-4 text-blue-500" />, // changed from Edit to Pencil
            onClick: handleEditAd,
            variant: "outline",
        },
        {
            label: "Delete",
            icon: <Trash2 className="mr-2 h-4 w-4 text-red-500" />,
            onClick: handleDeleteAd,
            variant: "destructive",
        },
    ];

    // Sort and paginate data
    const sortedAds = ads.slice().sort((a, b) => {
        const numA = parseInt(a.id, 10);
        const numB = parseInt(b.id, 10);
        if (isNaN(numA) && isNaN(numB)) return 0;
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
    });
    const paginatedAds = sortedAds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Ensure currentPage is valid after ads change (e.g., after deletion)
    useEffect(() => {
        const newTotalPages = Math.ceil(ads.length / pageSize);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }
        // Optionally, if ads.length === 0, you could reset to page 1
        // if (ads.length === 0) setCurrentPage(1);
    }, [ads, pageSize, currentPage]);

    return (
        <div>
            <DashboardHeader />
            <div className=" mx-8 py-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-2xl font-bold">SERVICE</CardTitle>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default" className="gap-2 bg-violet-500" size="sm">
                                    <Plus className="h-4 w-4" />Add Service
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{ad.id ? "Edit Service" : "Add New Service"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddAd} className="space-y-4">
                                    <div>
                                        <label htmlFor="ad-name" className="block text-sm font-medium mb-1">Name</label>
                                        <Input
                                            id="ad-name"
                                            name="name"
                                            value={ad.name}
                                            onChange={e => setAd({ ...ad, name: e.target.value })}
                                            placeholder="Enter service name"
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="bg-violet-500" disabled={adding}>
                                            {adding ? (ad.id ? "Updating..." : "Adding...") : (ad.id ? "Update" : "Add")}
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
                            data={paginatedAds}
                            columns={columns}
                            actions={actions}
                            searchPlaceholder="Search ads..."
                        />
                        {/* Pagination Controls */}
                        {ads.length > pageSize && (
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-2">
                                <div className="text-sm text-gray-600">
                                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, ads.length)} of {ads.length} entries
                                </div>
                                <div className="flex gap-2 flex-wrap items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        Prev
                                    </Button>
                                    {paginationNumbers.map((pageNum, index) => (
                                        <React.Fragment key={index}>
                                            {typeof pageNum === 'string' ? (
                                                <span className="px-2 py-1 text-gray-500">...</span>
                                            ) : (
                                                <Button
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={currentPage === pageNum ? "bg-green-500 hover:bg-green-600" : ""}
                                                >
                                                    {pageNum}
                                                </Button>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
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