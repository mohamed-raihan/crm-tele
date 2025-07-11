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

interface Ad {
  id: string;
  name: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [ad, setAd] = useState({
    id:"",
    name:""
  });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  // Fetch ads
  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_URLS.ADS.GET_ADS);
      console.log(res);
      
      setAds(res.data.data || []);
    } catch (err) {
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
      if(ad.id){
        await axiosInstance.patch(API_URLS.ADS.PATCH_ADS(ad.id), { name: ad.name });
        toast({ title: "Source Updated successfully", variant: "success" });
      }else{
        await axiosInstance.post(API_URLS.ADS.POST_ADS, { name: ad.name });
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
      await axiosInstance.delete(API_URLS.ADS.DELETE_ADS(ad.id));
      toast({ title: "Source deleted successfully", variant:"success" });
      fetchAds();
    } catch (err) {
      toast({ title: "Failed to delete source", description: "Please try again.", variant: "destructive" });
    }
  };

  // Table columns
  const columns: TableColumn[] = [
    {
      key: "id",
      label: "ID",
      sortable: false,
      width: "w-24",
      render: (_value, _row, index) => index + 1
    },
    { key: "name", label: "Name" },
  ];

  // Table actions
  const actions: TableAction[] = [
    {
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4 text-blue-500" />,
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

  return (
    <div>
      <DashboardHeader/>
      <div className=" mx-8 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">SOURCE</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2 bg-violet-500" size="sm">
                <Plus className="h-4 w-4" />Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{ad.id ? "Edit Source" : "Add New Source"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAd} className="space-y-4">
                <div>
                  <label htmlFor="ad-name" className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    id="ad-name"
                    name="name"
                    value={ad.name}
                    onChange={e => setAd({...ad, name: e.target.value})}
                    placeholder="Enter source name"
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
            data={ads}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search ads..."
            // Optionally implement search, selection, etc.
            // onSearch={...}
          />
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
