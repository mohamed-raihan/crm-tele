import React, { useState, useEffect } from "react";
import { DynamicTable, TableColumn } from "@/components/ui/dynamic-table";
import {
  DynamicForm,
  FormField,
  FormSection as ImportedFormSection,
} from "@/components/ui/dynamic-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { API_URLS } from "../../../components/apiconfig/api_urls.js";
import axiosInstance from "../../../components/apiconfig/axios.js";
import { z } from "zod";

// Define Telecaller interface
interface Telecaller {
  id: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  role: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Roles {
  id: number;
  name: string;
}

// Define ApiResponse interface
interface ApiResponse {
  code: number;
  message: string;
  data: Telecaller[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Define CustomFormField interface
interface CustomFormField extends Omit<FormField, "validation"> {
  defaultValue?: string;
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

// Define FormSection interface as non-generic
interface FormSection {
  fields: CustomFormField[];
  columns?: number;
  className?: string;
}

// Zod Schema for validation - strict for POST (creating new telecaller)
const telecallerCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  contact: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Contact must be 10-15 digits")
    .min(1, "Contact is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  role: z.string().min(1, "Role is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Zod Schema for editing - only validate if field has content
// Update the telecallerEditSchema
const telecallerEditSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  contact: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Contact must be 10-15 digits")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  role: z.string().min(1, "Role is required").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

// Toast notification component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
    <div
      className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const columns: TableColumn[] = [
  { key: "id", label: "ID", sortable: true, width: "w-16" },
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "contact", label: "Contact", sortable: true },
  { key: "address", label: "Address", sortable: true },
  {
    key: "status",
    label: "Status",
    render: () => (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ),
  },
];

export default function TelecallersManagementPage() {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [allTelecallers, setAllTelecallers] = useState<Telecaller[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roles, setroles] = useState<Roles[]>([]);
  const [formSections, setFormSections] = useState<FormSection[]>([]);

  const [editingTelecaller, setEditingTelecaller] = useState<Telecaller | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    role: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get access token from localStorage
  const getAccessToken = () => {
    return localStorage.getItem("access_token");
  };

  // Get auth config for requests
  const getAuthConfig = () => {
    const token = getAccessToken();
    if (!token) {
      showToast("Authentication required. Please login again.", "error");
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  console.log(allTelecallers);

  // Check for duplicates during creation
  const checkDuplicatesForCreate = (
    data: Omit<Telecaller, "id">
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    const normalizedData = {
      name: data.name.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      contact: data.contact.trim(),
    };

    if (allTelecallers.length > 0) {
      if (
        allTelecallers.some(
          (telecaller) =>
            telecaller.name.toLowerCase().trim() === normalizedData.name
        )
      ) {
        errors.name = "Telecaller name already exists";
      }
      if (
        allTelecallers.some(
          (telecaller) =>
            telecaller.email.toLowerCase().trim() === normalizedData.email
        )
      ) {
        errors.email = "Email already exists";
      }
      if (
        allTelecallers.some(
          (telecaller) => telecaller.contact.trim() === normalizedData.contact
        )
      ) {
        errors.contact = "Contact number already exists";
      }
    }
    return errors;
  };

  // Check for duplicates during editing (only for changed fields)
  const checkDuplicatesForEdit = (
    data: Partial<Telecaller>,
    currentTelecallerId: number
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    const normalizedData = {
      name: data.name?.toLowerCase().trim(),
      email: data.email?.toLowerCase().trim(),
      contact: data.contact?.trim(),
    };

    if (allTelecallers.length > 0) {
      if (
        normalizedData.name &&
        allTelecallers.some(
          (telecaller) =>
            telecaller.id !== currentTelecallerId &&
            telecaller.name.toLowerCase().trim() === normalizedData.name
        )
      ) {
        errors.name = "Telecaller name already exists";
      }
      if (
        normalizedData.email &&
        allTelecallers.some(
          (telecaller) =>
            telecaller.id !== currentTelecallerId &&
            telecaller.email.toLowerCase().trim() === normalizedData.email
        )
      ) {
        errors.email = "Email already exists";
      }
      if (
        normalizedData.contact &&
        allTelecallers.some(
          (telecaller) =>
            telecaller.id !== currentTelecallerId &&
            telecaller.contact.trim() === normalizedData.contact
        )
      ) {
        errors.contact = "Contact number already exists";
      }
    }
    return errors;
  };

  const fetchroles = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ROLES.GET_ROLES);
      setroles(response.data);

      // Create form sections with role options
      const sections: FormSection[] = [
        {
          fields: [
            {
              name: "name",
              label: "Name",
              type: "text",
              placeholder: "Enter telecaller name",
              defaultValue: "",
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "Enter email address",
              defaultValue: "",
            },
            {
              name: "contact",
              label: "Contact",
              type: "text",
              placeholder: "Enter contact number",
              defaultValue: "",
            },
            {
              name: "address",
              label: "Address",
              type: "textarea",
              placeholder: "Enter address",
              defaultValue: "",
            },
            {
              name: "role",
              label: "Role",
              type: "select",
              options: response.data.map((role: Roles) => ({
                value: role.id.toString(), // Store ID as value
                label: role.name, // Display name as label
              })),
              placeholder: "Select role",
              defaultValue: editingTelecaller
                ? roles
                    .find((r) => r.name === editingTelecaller.role)
                    ?.id.toString() || ""
                : "",
            },
            {
              name: "password",
              label: "Password",
              type: "text",
              placeholder: "Enter password",
              defaultValue: "",
            },
          ],
          columns: 1,
          className: "grid grid-cols-1 gap-4",
        },
      ];

      setFormSections(sections);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch roles", "error");
    }
  };

  useEffect(() => {
    fetchroles();
  }, [editingTelecaller]); // Re-fetch roles when editingTelecaller changes to update defaultValue

  // Fetch telecallers with pagination
  const fetchTelecallers = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.get(
        `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}?page=${page}&limit=${limit}`,
        authConfig
      );

      if (response.data?.code === 200) {
        setTelecallers(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        showToast("Failed to fetch telecallers", "error");
      }
    } catch (err: any) {
      console.error("Error fetching telecallers:", err);
      if (err.response?.status === 401) {
        showToast("Authentication failed. Please login again.", "error");
      } else {
        showToast(
          err.response?.data?.message || "Failed to fetch telecallers",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all telecallers for search and duplicate checking
  const fetchAllTelecallers = async () => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      let allData: Telecaller[] = [];
      let currentPage = 1;
      const pageLimit = 1000;

      while (true) {
        const response = await axiosInstance.get(
          `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}?page=${currentPage}&limit=${pageLimit}`,
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
      setAllTelecallers(allData);
    } catch (err: any) {
      console.error("Error fetching all telecallers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create telecaller with full validation and duplicate checks
  const createTelecaller = async (data: Omit<Telecaller, "id">) => {
    setLoading(true);
    setIsSubmitting(true);
    setFormErrors({});

    try {
      console.log("Creating telecaller with data:", data);

      // 1. Validate with Zod schema for creation
      const result = telecallerCreateSchema.safeParse(data);
      if (!result.success) {
        const errors = result.error.issues.reduce(
          (acc: Record<string, string>, issue) => {
            const field = issue.path[0] as string;
            acc[field] = issue.message;
            return acc;
          },
          {}
        );
        setFormErrors(errors);
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      const validatedData = result.data;
      console.log("Validated data:", validatedData);

      // 2. Check for duplicates
      const duplicateErrors = checkDuplicatesForCreate(data);
      if (Object.keys(duplicateErrors).length > 0) {
        setFormErrors(duplicateErrors);
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      // 3. Make API call
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      console.log(
        "Making API call to:",
        API_URLS.TELLE_CALLERS.POST_TELLE_CALLERS
      );

      const response = await axiosInstance.post(
        API_URLS.TELLE_CALLERS.POST_TELLE_CALLERS,
        validatedData,
        authConfig
      );

      console.log("API Response:", response);

      if (response.data?.code === 200 || response.status === 201) {
        await fetchTelecallers(pagination.page, pagination.limit);
        await fetchAllTelecallers();
        setIsModalOpen(false);
        resetForm();
        showToast("Telecaller created successfully!", "success");
      } else {
        showToast(
          response.data?.message || "Failed to create telecaller",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error creating telecaller:", error);

      if (error.response?.data?.errors) {
        // API validation errors
        setFormErrors(error.response.data.errors);
      } else {
        const errorMessage =
          error.response?.data?.message || "Failed to create telecaller";
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Update telecaller with minimal validation and duplicate checks
  const updateTelecaller = async (id: number, data: Partial<Telecaller>) => {
  setLoading(true);
  setIsSubmitting(true);
  setFormErrors({});

  try {
    console.log("Updating telecaller with data:", data);

    // Filter out empty strings and undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== "" && value !== undefined && value !== null
      )
    );

    console.log("Filtered data:", filteredData);

    // 1. Validate with Zod schema for editing
    const result = telecallerEditSchema.safeParse(filteredData);
    if (!result.success) {
      const errors = result.error.issues.reduce(
        (acc: Record<string, string>, issue) => {
          const field = issue.path[0] as string;
          acc[field] = issue.message;
          return acc;
        },
        {}
      );
      setFormErrors(errors);
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const validatedData = result.data;
    console.log("Validated data:", validatedData);

    // 2. Check for duplicates on fields that have values
    const fieldsToCheck: Partial<Telecaller> = {};
    if (data.name && data.name.trim()) fieldsToCheck.name = data.name;
    if (data.email && data.email.trim()) fieldsToCheck.email = data.email;
    if (data.contact && data.contact.trim()) fieldsToCheck.contact = data.contact;

    const duplicateErrors = checkDuplicatesForEdit(fieldsToCheck, id);
    if (Object.keys(duplicateErrors).length > 0) {
      setFormErrors(duplicateErrors);
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // 3. Make API call with proper URL construction
    const authConfig = getAuthConfig();
    if (!authConfig) return;

    const updateUrl = API_URLS.TELLE_CALLERS.PATCH_TELLE_CALLERS(id);
    console.log("Making API call to:", updateUrl);

    const response = await axiosInstance.patch(updateUrl, validatedData, authConfig);
    console.log("Update response:", response);

    if (response.data?.code === 200 || response.status === 200) {
      await fetchTelecallers(pagination.page, pagination.limit);
      await fetchAllTelecallers();
      setIsModalOpen(false);
      setEditingTelecaller(null);
      resetForm();
      showToast("Telecaller updated successfully!", "success");
    } else {
      showToast(response.data?.message || "Failed to update telecaller", "error");
    }
  } catch (err: any) {
    console.error("Error updating telecaller:", err);

    if (err.response?.data?.errors) {
      // API validation errors
      setFormErrors(err.response.data.errors);
    } else {
      const errorMessage = err.response?.data?.message || "Failed to update telecaller";
      showToast(errorMessage, "error");
    }
  } finally {
    setLoading(false);
    setIsSubmitting(false);
  }
};

  // Delete telecaller
  const deleteTelecaller = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this telecaller?")) {
      return;
    }

    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const deleteUrl = API_URLS.TELLE_CALLERS.DELETE_TELLE_CALLERS(id);

      const response = await axiosInstance.delete(deleteUrl, authConfig);

      if (response.data?.code === 200 || response.status === 204) {
        await fetchTelecallers(pagination.page, pagination.limit);
        await fetchAllTelecallers();
        setSelectedRows((prev) =>
          prev.filter((rowId) => rowId !== id.toString())
        );
        showToast("Telecaller deleted successfully!", "success");
      } else {
        showToast(
          response.data?.message || "Failed to delete telecaller",
          "error"
        );
      }
    } catch (err: any) {
      console.error("Error deleting telecaller:", err);
      if (err.response?.status === 401) {
        showToast("Authentication failed. Please login again.", "error");
      } else {
        showToast(
          err.response?.data?.message || "Failed to delete telecaller",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search - searches across all data
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setIsSearching(!!term.trim());

    if (!term.trim()) {
      // Reset to paginated view when search is cleared
      await fetchTelecallers(pagination.page, pagination.limit);
      return;
    }

    setLoading(true);
    try {
      // Search across all telecallers data
      const filtered = allTelecallers.filter(
        (telecaller) =>
          telecaller.name.toLowerCase().includes(term.toLowerCase()) ||
          telecaller.email.toLowerCase().includes(term.toLowerCase()) ||
          telecaller.contact.includes(term) ||
          telecaller.address.toLowerCase().includes(term.toLowerCase()) ||
          telecaller.role.toLowerCase().includes(term.toLowerCase()) ||
          telecaller.id.toString().includes(term)
      );
      setTelecallers(filtered);
    } catch (err) {
      console.error("Error during search:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contact: "",
      address: "",
      role: "",
      password: "",
    });
    setFormErrors({});
  };

  // Form submission handler
  const handleFormSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);

    // Find role name if we have the ID
    const roleName =
      roles.find((r) => r.id.toString() === data.role)?.name || data.role;

    const submitData = {
      name: data.name?.toString() || "",
      email: data.email?.toString() || "",
      contact: data.contact?.toString() || "",
      address: data.address?.toString() || "",
      role: roleName, // Use the role name for API
      password: data.password?.toString() || "",
    };

    // Rest of the submit logic remains the same
    if (editingTelecaller) {
      const editData: Partial<Telecaller> = {};
      if (submitData.name.trim()) editData.name = submitData.name;
      if (submitData.email.trim()) editData.email = submitData.email;
      if (submitData.contact.trim()) editData.contact = submitData.contact;
      if (submitData.address.trim()) editData.address = submitData.address;
      if (submitData.role.trim()) editData.role = submitData.role;
      if (submitData.password.trim()) editData.password = submitData.password;

      await updateTelecaller(editingTelecaller.id, editData);
    } else {
      await createTelecaller(submitData as Omit<Telecaller, "id">);
    }
  };

  // Modal handlers
  const openAddModal = () => {
    console.log("Opening add modal");
    setEditingTelecaller(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (telecaller: Telecaller) => {
    console.log("Opening edit modal for:", telecaller);
    setEditingTelecaller(telecaller);
    setFormData({
      name: telecaller.name || "",
      email: telecaller.email || "",
      contact: telecaller.contact || "",
      address: telecaller.address || "",
      role: telecaller.role || "",
      password: telecaller.password,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTelecaller(null);
    resetForm();
  };

  // Row selection handlers
  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(
      selected ? telecallers.map((telecaller) => telecaller.id.toString()) : []
    );
  };

  const handleSelectRow = (id: string, selected: boolean) => {
    setSelectedRows((prev) =>
      selected ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  // Action handlers
  const handleEdit = (telecaller: Telecaller) => {
    openEditModal(telecaller);
  };

  const handleDelete = (telecaller: Telecaller) => {
    deleteTelecaller(telecaller.id);
  };

  // Load initial data
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      showToast("No access token found. Please login first.", "error");
      return;
    }
    fetchTelecallers();
    fetchAllTelecallers(); // Fetch all telecallers for search and duplicate checking
  }, []);

  console.log("Current editing telecaller:", editingTelecaller);
  console.log("Form sections:", formSections);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-400 mb-1">
          Telecallers Management {">"} All Telecallers
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Telecallers Management
          </h1>
          <Button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Telecaller
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search telecallers by name, email, contact, address, role, or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {isSearching && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {telecallers.length} results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DynamicTable
            data={telecallers}
            columns={columns}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            selectedRows={selectedRows}
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
              Showing {telecallers.length} of {pagination.total} telecallers
              (Page {pagination.page} of {pagination.totalPages})
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && formSections.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingTelecaller ? "Edit Telecaller" : "Add New Telecaller"}
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
                  key={editingTelecaller?.id || "new"}
                  sections={formSections as ImportedFormSection[]} // Type assertion to match imported type
                  onSubmit={handleFormSubmit}
                  submitLabel={
                    editingTelecaller ? "Update Telecaller" : "Add Telecaller"
                  }
                  showCancel={true}
                  onCancel={closeModal}
                  defaultValues={
                    editingTelecaller
                      ? {
                          name: editingTelecaller.name || "",
                          email: editingTelecaller.email || "",
                          contact: editingTelecaller.contact || "",
                          address: editingTelecaller.address || "",
                          role:
                            roles
                              .find((r) => r.name === editingTelecaller.role)
                              ?.id.toString() || "",
                          password: "",
                        }
                      : {
                          name: "",
                          email: "",
                          contact: "",
                          address: "",
                          role: "",
                          password: "",
                        }
                  }
                  errors={formErrors}
                  validationSchema={
                    editingTelecaller
                      ? telecallerEditSchema
                      : telecallerCreateSchema
                  }
                  submitButtonProps={{ disabled: isSubmitting }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
