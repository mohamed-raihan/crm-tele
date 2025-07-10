import React, { useState, useEffect } from "react";
import { DynamicTable, TableColumn } from "@/components/ui/dynamic-table";
import {
  DynamicForm,
  FormField,
  FormSection,
} from "@/components/ui/dynamic-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/components/apiconfig/axios.js";
import { API_URLS } from "@/components/apiconfig/api_urls";
import { DashboardHeader } from "@/components/DashboardHeader";

// Define Branch interface
interface Branch {
  id: number;
  branch_name: string;
  address: string;
  city: string;
  email: string;
  contact: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define ApiResponse interface
interface ApiResponse {
  code: number;
  message: string;
  data: Branch[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Define FormField with explicit validation type
interface CustomFormField extends Omit<FormField, "validation"> {
  validation?: {
    required?: string | boolean;
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    pattern?: {
      value: RegExp;
      message: string;
    };
  };
}

// Zod Schema for validation - strict for POST (creating new branch)
const branchCreateSchema = z.object({
  branch_name: z
    .string()
    .min(2, "Branch name must be at least 2 characters")
    .max(50, "Branch name must not exceed 50 characters")
    .nonempty("Branch name is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .nonempty("Address is required"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .nonempty("City is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
  contact: z
    .string()
    .regex(/^[0-9]{10}$/, "Contact must be exactly 10 digits")
    .nonempty("Contact is required"),
});

// Zod Schema for editing - only validate if field has content
const branchEditSchema = z.object({
  branch_name: z
    .string()
    .min(2, "Branch name must be at least 2 characters")
    .refine((val) => val === undefined || val.trim() !== "", {
      message: "Branch name is required",
    })
    .optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .refine((val) => val === undefined || val.trim() !== "", {
      message: "Address is required",
    })
    .optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .refine((val) => val === undefined || val.trim() !== "", {
      message: "City is required",
    })
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional(),
  contact: z
    .string()
    .regex(/^[0-9]{10}$/, "Contact must be exactly 10 digits")
    .optional(),
});

const columns: TableColumn[] = [
  {
    key: "serial",
    label: "ID",
    sortable: false,
    render: (_: any, __: Branch, index: number) => index + 1,
    width: "w-16",
  },
  { key: "branch_name", label: "Branch Name", sortable: true },
  { key: "address", label: "Address", sortable: true },
  { key: "city", label: "City", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "contact", label: "Contact", sortable: true },
];

// Update formSections to make fields optional for editing
const formSections: FormSection[] = [
  {
    fields: [
      {
        name: "branch_name",
        label: "Branch Name",
        type: "text",
        placeholder: "Enter branch name",
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter branch address",
      },
      {
        name: "city",
        label: "City",
        type: "text",
        placeholder: "Enter city",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter email address",
      },
      {
        name: "contact",
        label: "Contact",
        type: "text",
        placeholder: "Enter contact number",
      },
    ] as FormField[], // Cast to FormField[] instead of CustomFormField[]
    columns: 1,
    className: "grid grid-cols-1 gap-4",
  },
];

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const { toast } = useToast();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get access token from localStorage
  const getAccessToken = () => {
    return localStorage.getItem("access_token");
  };

  // Get auth config for requests
  const getAuthConfig = () => {
    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication required. Please login again.",
        variant: "destructive",
      });
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  console.log(allBranches);

  // Check for duplicates during creation
  const checkDuplicatesForCreate = (
    data: Omit<Branch, "id">
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    const normalizedData = {
      branch_name: data.branch_name.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      contact: data.contact.trim(),
    };

    if (allBranches.length > 0) {
      if (
        allBranches.some(
          (branch) =>
            branch.branch_name.toLowerCase().trim() ===
            normalizedData.branch_name
        )
      ) {
        errors.branch_name = "Branch name already exists";
      }
      if (
        allBranches.some(
          (branch) => branch.email.toLowerCase().trim() === normalizedData.email
        )
      ) {
        errors.email = "Email already exists";
      }
      if (
        allBranches.some(
          (branch) => branch.contact.trim() === normalizedData.contact
        )
      ) {
        errors.contact = "Contact number already exists";
      }
    }
    return errors;
  };

  // Check for duplicates during editing (only for changed fields)
  const checkDuplicatesForEdit = (
    data: Partial<Branch>,
    currentBranchId: number
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    const normalizedData = {
      branch_name: data.branch_name?.toLowerCase().trim(),
      email: data.email?.toLowerCase().trim(),
      contact: data.contact?.trim(),
    };

    if (allBranches.length > 0) {
      if (
        normalizedData.branch_name &&
        allBranches.some(
          (branch) =>
            branch.id !== currentBranchId &&
            branch.branch_name.toLowerCase().trim() ===
              normalizedData.branch_name
        )
      ) {
        errors.branch_name = "Branch name already exists";
      }
      if (
        normalizedData.email &&
        allBranches.some(
          (branch) =>
            branch.id !== currentBranchId &&
            branch.email.toLowerCase().trim() === normalizedData.email
        )
      ) {
        errors.email = "Email already exists";
      }
      if (
        normalizedData.contact &&
        allBranches.some(
          (branch) =>
            branch.id !== currentBranchId &&
            branch.contact.trim() === normalizedData.contact
        )
      ) {
        errors.contact = "Contact number already exists";
      }
    }
    return errors;
  };

  // Fetch branches with pagination
  const fetchBranches = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.get(
        `${API_URLS.BRANCH.GET_BRANCH}?page=${page}&limit=${limit}`,
        authConfig
      );
      console.log(response);

      if (response.data?.code === 200) {
        setBranches(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        toast({ title: "Failed to fetch branches", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Error fetching branches:", err);
      if (err.response?.status === 401) {
        toast({
          title: "Authentication failed. Please login again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: err.response?.data?.message || "Failed to fetch branches",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all branches for search and duplicate checking
  const fetchAllBranches = async () => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      let allData: Branch[] = [];
      let currentPage = 1;
      const pageLimit = 1000;

      while (true) {
        const response = await axiosInstance.get(
          `${API_URLS.BRANCH.GET_BRANCH}?page=${currentPage}&limit=${pageLimit}`,
          authConfig
        );
        if (response.data?.code === 200) {
          allData = [...allData, ...response.data.data];
          if (currentPage * pageLimit >= response.data.pagination.total) break;
          currentPage++;
        } else {
          break;
        }
      }
      setAllBranches(allData);
    } catch (err: any) {
      console.error("Error fetching all branches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create branch with full validation and duplicate checks
  const createBranch = async (data: Omit<Branch, "id">) => {
    setLoading(true);
    setFormErrors({});

    try {
      // 1. Validate with Zod schema for creation
      branchCreateSchema.parse(data);

      // 2. Check for duplicates
      const duplicateErrors = checkDuplicatesForCreate(data);
      if (Object.keys(duplicateErrors).length > 0) {
        setFormErrors(duplicateErrors);
        setLoading(false);
        return;
      }

      // 3. Make API call
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.post(
        API_URLS.BRANCH.POST_BRANCH,
        data,
        authConfig
      );

      if (response.data?.code === 200 || response.status === 201) {
        await fetchBranches(pagination.page, pagination.limit);
        await fetchAllBranches();
        setIsModalOpen(false);
        toast({ title: "Branch created successfully!", variant: "success" });
      } else {
        toast({
          title: response.data?.message || "Failed to create branch",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.errors) {
        const errors = error.errors.reduce(
          (acc: Record<string, string>, curr: any) => {
            acc[curr.path[0]] = curr.message;
            return acc;
          },
          {}
        );
        setFormErrors(errors);
      } else {
        console.error("Error creating branch:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to create branch";
        toast({ title: errorMessage, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Update branch with minimal validation and duplicate checks
  const updateBranch = async (id: number, data: Partial<Branch>) => {
    setLoading(true);
    setFormErrors({});

    try {
      // 1. Validate with Zod schema for editing
      branchEditSchema.parse(data);

      // 2. Check for duplicates on fields that have values
      const fieldsToCheck: Partial<Branch> = {};
      if (data.branch_name && data.branch_name.trim())
        fieldsToCheck.branch_name = data.branch_name;
      if (data.email && data.email.trim()) fieldsToCheck.email = data.email;
      if (data.contact && data.contact.trim())
        fieldsToCheck.contact = data.contact;

      const duplicateErrors = checkDuplicatesForEdit(fieldsToCheck, id);
      if (Object.keys(duplicateErrors).length > 0) {
        setFormErrors(duplicateErrors);
        setLoading(false);
        return;
      }

      // 3. Make API call with proper URL construction
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const updateUrl = API_URLS.BRANCH.PATCH_BRANCH(id);

      const response = await axiosInstance.patch(updateUrl, data, authConfig);

      if (response.data?.code === 200 || response.status === 200) {
        await fetchBranches(pagination.page, pagination.limit);
        await fetchAllBranches();
        setIsModalOpen(false);
        setEditingBranch(null);
        toast({ title: "Branch updated successfully!", variant: "success" });
      } else {
        toast({
          title: response.data?.message || "Failed to update branch",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      if (err.errors) {
        const errors = err.errors.reduce(
          (acc: Record<string, string>, curr: any) => {
            acc[curr.path[0]] = curr.message;
            return acc;
          },
          {}
        );
        setFormErrors(errors);
      } else {
        console.error("Error updating branch:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to update branch";
        toast({ title: errorMessage, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete branch
  const deleteBranch = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) {
      return;
    }

    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const deleteUrl = API_URLS.BRANCH.DELETE_BRANCH(id);

      const response = await axiosInstance.delete(deleteUrl, authConfig);

      if (response.data?.code === 200 || response.status === 204) {
        await fetchBranches(pagination.page, pagination.limit);
        await fetchAllBranches();
        setSelectedRows((prev) =>
          prev.filter((rowId) => rowId !== id.toString())
        );
        toast({ title: "Branch deleted successfully!", variant: "success" });
      } else {
        toast({
          title: response.data?.message || "Failed to delete branch",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting branch:", err);
      if (err.response?.status === 401) {
        toast({
          title: "Authentication failed. Please login again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: err.response?.data?.message || "Failed to delete branch",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(!!term.trim());

    if (!term.trim()) {
      setBranches(allBranches.slice(0, pagination.limit * pagination.page)); // Limit to paginated view
      return;
    }

    const filtered = allBranches.filter(
      (branch) =>
        branch.branch_name.toLowerCase().includes(term.toLowerCase()) ||
        branch.city.toLowerCase().includes(term.toLowerCase()) ||
        branch.email.toLowerCase().includes(term.toLowerCase()) ||
        branch.contact.includes(term) ||
        branch.id.toString().includes(term)
    );
    setBranches(filtered);
  };

  // Form submission handler
  const handleFormSubmit = async (data: any) => {
    const submitData = {
      branch_name: data.branch_name || "",
      address: data.address || "",
      city: data.city || "",
      email: data.email || "",
      contact: data.contact || "",
    };
    if (editingBranch) {
      await updateBranch(editingBranch.id, submitData);
    } else {
      await createBranch(submitData);
    }
  };
  // Modal handlers
  const openAddModal = () => {
    setEditingBranch(null);
    setFormErrors({});
    setIsModalOpen(true);
  };
  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch); // Set editingBranch
    setFormErrors({});
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormErrors({});
  };

  // Row selection handlers
  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(
      selected ? branches.map((branch) => branch.id.toString()) : []
    );
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    setSelectedRows((prev) =>
      selected ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  // Action handlers
  const handleEdit = (branch: Branch) => {
    openEditModal(branch);
  };

  const handleDelete = (branch: Branch) => {
    deleteBranch(branch.id);
  };

  // Load initial data
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      toast({
        title: "No access token found. Please login first.",
        variant: "destructive",
      });
      return;
    }
    fetchBranches();
    fetchAllBranches(); // Fetch all branches for duplicate checking
  }, []);

  console.log(editingBranch);

  // Sort branches by createdAt ascending (oldest first, latest last)
  const sortedBranches = [...branches].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div>
      <DashboardHeader/>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-400 mb-1">
          Branch Management {">"} All Branches
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Branch Management
          </h1>
          <Button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Branch
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search branches by name, city, email, contact, ..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {isSearching && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {branches.length} results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DynamicTable
            data={sortedBranches.map((row, idx) => ({ ...row, serial: idx + 1 }))}
            columns={columns}
            rowIdKey="id"
            actions={[
              {
                label: "Edit",
                icon: <Pencil className="mr-2 h-4 w-4 text-gray-500" />,
                onClick: handleEdit,
                variant: "outline",
              },
              {
                label: "Delete",
                icon: <Trash2 className="mr-2 h-4 w-4 text-red-500" />,
                onClick: handleDelete,
                variant: "destructive",
              },
            ]}
          />

          {/* Pagination Info */}
          {!isSearching && (
            <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
              Showing {branches.length} of {pagination.total} branches (Page{" "}
              {pagination.page} of {pagination.totalPages})
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6">
                <DynamicForm
                  sections={formSections}
                  onSubmit={handleFormSubmit}
                  submitLabel={editingBranch ? "Update Branch" : "Add Branch"}
                  showCancel={true}
                  onCancel={closeModal}
                  defaultValues={
                    editingBranch
                      ? {
                          branch_name: editingBranch.branch_name || "",
                          address: editingBranch.address || "",
                          city: editingBranch.city || "",
                          email: editingBranch.email || "",
                          contact: editingBranch.contact || "",
                        }
                      : {}
                  }
                  errors={formErrors}
                  validationSchema={
                    editingBranch ? branchEditSchema : branchCreateSchema
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
