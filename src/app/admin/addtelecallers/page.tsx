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
import { API_URLS } from "../../../components/apiconfig/api_urls.ts";
import axiosInstance from "../../../components/apiconfig/axios.ts";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { DashboardHeader } from "@/components/DashboardHeader.tsx";

// Define Telecaller interface

interface Telecaller {
  id: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  role: number;
  password?: string;
  password_display?: string; // For preview only
  createdAt?: string;
  updatedAt?: string;
  branch: number;
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

interface Branch {
  id: number;
  branch_name: string;
  address: string;
  city: string;
  contact: string;
  email: string;
}

// Update the telecallerCreateSchema
const telecallerCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  contact: z
    .string()
    .min(1, "Contact is required")
    .regex(/^[0-9]{10}$/, "Contact must be exactly 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  role: z.string().min(1, "Role is required"),
  branch: z
    .union([z.string(), z.number()])
    .refine(
      (val) => val !== "" && val !== null && val !== undefined,
      "Branch is required"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Update the telecallerEditSchema
const telecallerEditSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .refine((val) => val === undefined || val.trim() !== "", {
      message: "Name is required",
    })
    .optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .optional(),
  contact: z
    .string()
    .min(1, "Contact is required")
    .regex(/^[0-9]{10}$/, "Contact must be exactly 10 digits")
    .refine((val) => val === undefined || val.trim() !== "", {
      message: "Contact is required",
    })
    .optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .refine((val) => val === undefined || val.trim() !== "", {
      message: "Address is required",
    })
    .optional(),
  role: z.string().optional(),
  branch: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// const columns: TableColumn[] = [
//   { key: "id", label: "ID", sortable: true, width: "w-16" },
//   { key: "name", label: "Name", sortable: true },
//   { key: "email", label: "Email", sortable: true },
//   { key: "contact", label: "Contact", sortable: true },
//   { key: "address", label: "Address", sortable: true },
//   {
//     key: "branch",
//     label: "Branch",
//     sortable: true,
//     render: (value: any, row: Telecaller) => (
//       <span>{getBranchNameFromId(row.branch)}</span>
//     ),
//   },
//   {
//     key: "status",
//     label: "Status",
//     render: () => (
//       <Badge variant="secondary" className="bg-green-100 text-green-800">
//         Active
//       </Badge>
//     ),
//   },
// ];

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
    branch: "",
    password: "",
  });

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  console.log(branches);

  // Check for duplicates during editing
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

  const fetchBranches = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.get(
        API_URLS.BRANCH.GET_BRANCH, // Update this with your actual branches API endpoint
        authConfig
      );

      if (response.data?.code === 200) {
        setBranches(response.data.data || []);
      } else {
        console.error("Failed to fetch branches");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const createFormSections = () => {
    if (branches.length === 0 || roles.length === 0) {
      return [];
    }

    const sections: FormSection[] = [
      {
        fields: [
          {
            name: "name",
            label: "Name",
            type: "text",
            placeholder: "Enter telecaller name",
            defaultValue: "",
            required: true,
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "Enter email address",
            defaultValue: "",
            required: true,
          },
          {
            name: "contact",
            label: "Contact",
            type: "text",
            placeholder: "Enter contact number",
            defaultValue: "",
            required: true,
          },
          {
            name: "address",
            label: "Address",
            type: "textarea",
            placeholder: "Enter address",
            defaultValue: "",
            required: true,
          },
          {
            name: "branch",
            label: "Branch",
            type: "select",
            options: branches.map((branch: Branch) => ({
              value: branch.id.toString(),
              label: branch.branch_name,
            })),
            placeholder: "Select branch",
            defaultValue: editingTelecaller
              ? editingTelecaller.branch.toString()
              : "",
            required: true,
          },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: roles.map((role: Roles) => ({
              value: role.id.toString(),
              label: role.name,
              disabled: role.name === "Admin",
            })),
            placeholder: "Select role",
            defaultValue: editingTelecaller
              ? editingTelecaller.role.toString()
              : "",
            required: true,
          },
          {
            name: "password",
            label: "Password",
            type: "text",
            placeholder: "Enter password",
            defaultValue: "",
            required: editingTelecaller ? false : true,
          },
        ],
        columns: 1,
        className: "grid grid-cols-1 gap-4",
      },
    ];

    return sections;
  };

  const fetchroles = async () => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.get(
        API_URLS.ROLES.GET_ROLES,
        authConfig
      );

      let rolesData: Roles[] = [];

      if (response.data?.code === 200) {
        rolesData = response.data.data || [];
      } else {
        rolesData = [
          { id: 1, name: "Admin" },
          { id: 2, name: "Telecaller" },
        ];
      }

      setroles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      const fallbackRoles = [
        { id: 1, name: "Admin" },
        { id: 2, name: "Telecaller" },
      ];
      setroles(fallbackRoles);

      toast({
        title: "Failed to load roles, using defaults",
        variant: "destructive",
      });
    }
  };


  // Helper function to get role ID from name
  const getRoleIdFromName = (roleName: string): number => {
    const roleMap: { [key: string]: number } = {
      Admin: 1,
      Telecaller: 2,
    };
    return roleMap[roleName] || 2;
  };

  const getRoleNameFromId = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
      1: "Admin",
      2: "Telecaller",
    };
    return roleMap[roleId] || "Telecaller";
  };

  useEffect(() => {
    if (branches.length > 0 && roles.length > 0) {
      const sections = createFormSections();
      setFormSections(sections);
    }
  }, [branches, roles, editingTelecaller]);

  // 4. Update the existing useEffect for branches
  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      fetchroles();
    }
  }, [branches]);
  // Fetch telecallers with pagination
  const fetchTelecallers = async (page: number = 1, limit: number = 10, search?: string) => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      let url = `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}?page=${page}&limit=${limit}`;

      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await axiosInstance.get(url, authConfig);

      console.log(response);
      

      if (response.data?.code === 200) {
        setTelecallers(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        toast({ title: "Failed to fetch telecallers", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Error fetching telecallers:", err);
      if (err.response?.status === 401) {
        toast({
          title: "Authentication failed. Please login again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: err.response?.data?.message || "Failed to fetch telecallers",
          variant: "destructive",
        });
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
      // 1. Validate with Zod schema for creation (keeping role as string for validation)
      const validationData = {
        ...data,
        role: data.role.toString(), // Ensure role is string for validation
        branch: data.branch.toString(), // Ensure branch is string for validation
      };

      const result = telecallerCreateSchema.safeParse(validationData);
      let errors: Record<string, string> = {};
      if (!result.success) {
        errors = result.error.issues.reduce(
          (acc: Record<string, string>, issue) => {
            const field = issue.path[0] as string;
            // Only set the first error for each field
            if (!acc[field]) acc[field] = issue.message;
            return acc;
          },
          {}
        );
      }

      // 2. Convert role and branch back to numbers for API call
      const apiData = {
        ...data,
        role: parseInt(data.role.toString()),
        branch: parseInt(data.branch.toString()),
      };

      // 3. Check for duplicates (run even if other errors exist)
      const duplicateErrors = checkDuplicatesForCreate(apiData);
      errors = { ...errors, ...duplicateErrors };

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      // 4. Make API call
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const response = await axiosInstance.post(
        API_URLS.TELLE_CALLERS.POST_TELLE_CALLERS,
        apiData,
        authConfig
      );

      if (response.data?.code === 200 || response.status === 201) {
        await fetchTelecallers(pagination.page, pagination.limit);
        // await fetchAllTelecallers();
        setIsModalOpen(false);
        resetForm();
        toast({
          title: "Telecaller created successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: response.data?.message || "Failed to create telecaller",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating telecaller:", error);
      // Handle API errors with enhanced error parsing
      const apiErrors = handleApiErrors(error);
      if (Object.keys(apiErrors).length > 0) {
        setFormErrors(apiErrors);
        if (apiErrors.general) {
          toast({ title: apiErrors.general, variant: "destructive" });
        }
      } else {
        toast({
          title: "Failed to create telecaller. Please try again.",
          variant: "destructive",
        });
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
      // Filter out empty strings and undefined values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== "" && value !== undefined && value !== null
        )
      );

      // Convert role and branch to string for validation
      const validationData = { ...filteredData };
      if (validationData.role !== undefined) {
        validationData.role = validationData.role.toString();
      }
      if (validationData.branch !== undefined) {
        validationData.branch = validationData.branch.toString();
      }

      // 1. Validate with Zod schema for editing
      const result = telecallerEditSchema.safeParse(validationData);
      let errors: Record<string, string> = {};
      if (!result.success) {
        errors = result.error.issues.reduce(
          (acc: Record<string, string>, issue) => {
            const field = issue.path[0] as string;
            if (!acc[field]) acc[field] = issue.message;
            return acc;
          },
          {}
        );
      }

      // 2. Check for duplicates on fields that have values (run even if other errors exist)
      const fieldsToCheck: Partial<Telecaller> = {};
      if (data.name && data.name.trim()) fieldsToCheck.name = data.name;
      if (data.email && data.email.trim()) fieldsToCheck.email = data.email;
      if (data.contact && data.contact.trim())
        fieldsToCheck.contact = data.contact;

      const duplicateErrors = checkDuplicatesForEdit(fieldsToCheck, id);
      errors = { ...errors, ...duplicateErrors };

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      // 3. Convert role and branch back to numbers for API call
      const apiData = { ...filteredData };
      if (apiData.role !== undefined) {
        apiData.role = parseInt(apiData.role.toString());
      }
      if (apiData.branch !== undefined) {
        apiData.branch = parseInt(apiData.branch.toString());
      }

      // 4. Make API call
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      const updateUrl = API_URLS.TELLE_CALLERS.PATCH_TELLE_CALLERS(id);
      const response = await axiosInstance.patch(
        updateUrl,
        apiData,
        authConfig
      );

      if (response.data?.code === 200 || response.status === 200) {
        await fetchTelecallers(pagination.page, pagination.limit);
        // await fetchAllTelecallers();
        setIsModalOpen(false);
        setEditingTelecaller(null);
        resetForm();
        toast({
          title: "Telecaller updated successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: response.data?.message || "Failed to update telecaller",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating telecaller:", error);
      const apiErrors = handleApiErrors(error);
      if (Object.keys(apiErrors).length > 0) {
        setFormErrors(apiErrors);
        if (apiErrors.general) {
          toast({ title: apiErrors.general, variant: "destructive" });
        }
      } else {
        toast({
          title: "Failed to update telecaller. Please try again.",
          variant: "destructive",
        });
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
        // await fetchAllTelecallers();
        setSelectedRows((prev) =>
          prev.filter((rowId) => rowId !== id.toString())
        );
        toast({
          title: "Telecaller deleted successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: response.data?.message || "Failed to delete telecaller",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting telecaller:", err);
      if (err.response?.status === 401) {
        toast({
          title: "Authentication failed. Please login again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: err.response?.data?.message || "Failed to delete telecaller",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search - searches across all data
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setIsSearching(!!term.trim());

    // Reset to first page when searching
    const searchPage = 1;

    setLoading(true);
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) return;

      // Build URL with search parameter
      let url = `${API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS}?page=${searchPage}&limit=${pagination.limit}`;

      if (term.trim()) {
        url += `&search=${encodeURIComponent(term.trim())}`;
      }

      const response = await axiosInstance.get(url, authConfig);

      if (response.data?.code === 200) {
        setTelecallers(response.data.data || []);
        setPagination(response.data.pagination || {
          ...pagination,
          page: searchPage
        });
      } else {
        toast({ title: "Failed to search telecallers", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Error during search:", err);
      toast({
        title: err.response?.data?.message || "Search failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBranchNameFromId = (branchId: number): string => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.branch_name : "Unknown";
  };

  const columns: TableColumn[] = [
    {
      key: "serial",
      label: "ID",
      sortable: false,
      render: (_: any, __: Telecaller, index: number) => index + 1,
      width: "w-16",
    },
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "contact", label: "Contact", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "branch",
      label: "Branch",
      sortable: true,
      render: (value: any, row: Telecaller) => (
        <span>{getBranchNameFromId(row.branch)}</span>
      ),
    },
  ];
  // Reset form function
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contact: "",
      address: "",
      role: "",
      branch: "",
      password: "",
    });
    setFormErrors({});
  };

  // Form submission handler
  const handleFormSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);

    let passwordToSave = data.password;
    // Don't save password if it's the display value or empty
    if (
      editingTelecaller &&
      (passwordToSave === "••••••" || !passwordToSave?.trim())
    ) {
      passwordToSave = undefined; // Don't include password in update
    }

    const submitData = {
      name: data.name?.toString() || "",
      email: data.email?.toString() || "",
      contact: data.contact?.toString() || "",
      address: data.address?.toString() || "",
      role: data.role?.toString() || "", // Keep as string initially
      branch: data.branch?.toString() || "", // Keep as string initially
      password: passwordToSave,
    };

    if (editingTelecaller) {
      const editData: Partial<Telecaller> = {};
      if (submitData.name.trim()) editData.name = submitData.name;
      if (submitData.email.trim()) editData.email = submitData.email;
      if (submitData.contact.trim()) editData.contact = submitData.contact;
      if (submitData.address.trim()) editData.address = submitData.address;
      if (submitData.role) editData.role = submitData.role; // Keep as string, will be converted in updateTelecaller
      if (submitData.branch) editData.branch = submitData.branch; // Keep as string, will be converted in updateTelecaller
      // Only include password if it's changed and not the display value
      if (passwordToSave && passwordToSave !== "••••••") {
        editData.password = passwordToSave;
      }

      await updateTelecaller(editingTelecaller.id, editData);
    } else {
      await createTelecaller({
        ...submitData,
        role: submitData.role, // Keep as string, will be converted in createTelecaller
        branch: submitData.branch, // Keep as string, will be converted in createTelecaller
      } as Omit<Telecaller, "id">);
    }
  };

  const handleApiErrors = (error: any): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Handle different error response formats
    if (error.response?.data) {
      const errorData = error.response.data;

      // Check for validation errors in different formats
      if (errorData.errors) {
        // Format 1: { errors: { field: "message" } }
        Object.assign(errors, errorData.errors);
      } else if (errorData.message) {
        // Format 2: Check message for specific error types
        const message = errorData.message.toLowerCase();

        if (message.includes("email") && message.includes("already")) {
          errors.email = "This email address is already registered";
        } else if (message.includes("phone") && message.includes("already")) {
          errors.contact = "This phone number is already registered";
        } else if (message.includes("contact") && message.includes("already")) {
          errors.contact = "This contact number is already registered";
        } else if (message.includes("name") && message.includes("already")) {
          errors.name = "This name is already taken";
        } else if (message.includes("role") && message.includes("invalid")) {
          errors.role = "Please select a valid role";
        } else {
          // Generic error
          errors.general = errorData.message;
        }
      }

      // Check for field-specific errors in data
      if (errorData.data?.role) {
        errors.role = Array.isArray(errorData.data.role)
          ? errorData.data.role[0]
          : errorData.data.role;
      }
    }

    return errors;
  };

  // Modal handlers
  const openAddModal = () => {
    console.log("Opening add modal");
    setEditingTelecaller(null);
    resetForm();

    // Ensure form sections are created if they don't exist
    if (formSections.length === 0 && branches.length > 0 && roles.length > 0) {
      const sections = createFormSections();
      setFormSections(sections);
    }

    setIsModalOpen(true);
  };
  const openEditModal = async (telecaller: Telecaller) => {
    console.log("Editing telecaller object:", telecaller);
    setEditingTelecaller(telecaller);
    setFormData({
      name: telecaller.name || "",
      email: telecaller.email || "",
      contact: telecaller.contact || "",
      address: telecaller.address || "",
      role: telecaller.role ? telecaller.role.toString() : "",
      branch: telecaller.branch ? telecaller.branch.toString() : "",
      password: telecaller.password_display || "••••••", // Use password_display from API
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
      toast({
        title: "No access token found. Please login first.",
        variant: "destructive",
      });
      return;
    }
    fetchTelecallers();
    // fetchAllTelecallers();
  }, []);

  console.log("Current editing telecaller:", editingTelecaller);
  console.log("Form sections:", formSections);

  // Sort telecallers by createdAt ascending (oldest first, latest last)
  const sortedTelecallers = [...telecallers].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div>
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto w-full">
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
                placeholder="Search telecallers by name..."
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto w-full">
            <DynamicTable
              data={sortedTelecallers.map((row, idx) => ({
                ...row,
                serial: idx + 1,
              }))}
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
                Showing {telecallers.length} of {pagination.total} telecallers
                (Page {pagination.page} of {pagination.totalPages})
              </div>
            )}
          </div>

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
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
                  {formSections.length > 0 ? (
                    <DynamicForm
                      key={editingTelecaller?.id || "new"}
                      sections={formSections as ImportedFormSection[]}
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
                            role: editingTelecaller.role.toString(),
                            branch: editingTelecaller.branch.toString(),
                            password: editingTelecaller.password_display || "••••••",
                          }
                          : {
                            name: "",
                            email: "",
                            contact: "",
                            address: "",
                            role: "2",
                            branch: "",
                            password: "",
                          }
                      }
                      errors={formErrors}
                      validationSchema={
                        editingTelecaller ? telecallerEditSchema : telecallerCreateSchema
                      }
                      submitButtonProps={{ disabled: isSubmitting }}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading form...</p>
                      </div>
                    </div>
                  )}

                  {/* Show general error message if exists */}
                  {formErrors.general && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{formErrors.general}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    // </div>
  );
}
