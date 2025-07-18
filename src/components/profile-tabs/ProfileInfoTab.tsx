import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import axiosInstance from '../apiconfig/axios';
import { API_URLS } from '../apiconfig/api_urls';
import { toast } from '@/hooks/use-toast';

interface ProfileInfoTabProps {
  id: string;
}

interface Profile {
  assigned_by_name: string | null;
  branch_name: string | null;
  candidate_name: string;
  created_at: string;
  created_by_name: string;
  created_by_role: string;
  email: string;
  enquiry_status: string;
  feedback: string;
  follow_up_on: string;
  id: number;
  mettad_name: string | null;
  phone: string;
  phone2: string;
   assigned_by_id: string | null;
  preferred_course: string;
  required_service: string;
  // Add checklist fields to Profile interface
  checklist_ids1?: string | null;
  checklist_ids2?: string | null;
  checklist_ids3?: string | null;
  checklist_ids4?: string | null;
  checklist_ids5?: string | null;
  checklist_ids6?: string | null;
  checklist_ids7?: string | null;
  checklist_ids8?: string | null;
  checklist_ids9?: string | null;
  checklist_ids10?: string | null;
}

interface ValidationErrors {
  candidate_name?: string;
  phone?: string;
  phone2?: string;
  email?: string;
}

interface ChecklistItem {
  id: number;
  name: string;
}

export function ProfileInfoTab({ id }: ProfileInfoTabProps) {
  const [profile, setProfile] = useState<Profile>()
  const [formData, setFormData] = useState<Partial<Profile>>({})
  const [source, setSource] = useState<{ value: string, label: string }[]>([])
  const [service, setService] = useState<{ value: string, label: string }[]>([])
  const [course, setCourse] = useState<{ value: string, label: string }[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserRole(userData.role || null);
      }
    } catch (e) {
      setUserRole(null);
    }
  }, []);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;

    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    if (domain.length === 0 || domain.length > 253) {
      return false;
    }

    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return false;
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) {
      return false;
    }

    if (email.includes('..')) {
      return false;
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    if (domain.startsWith('.') || domain.endsWith('.')) {
      return false;
    }

    return true;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.candidate_name?.trim()) {
      newErrors.candidate_name = 'Candidate name is required';
    } else if (formData.candidate_name.trim().length < 2) {
      newErrors.candidate_name = 'Candidate name must be at least 2 characters';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.phone2?.trim() && !validatePhone(formData.phone2)) {
      newErrors.phone2 = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChecklistToggle = (checklistId: number) => {
    setSelectedChecklistIds((prev) =>
      prev.includes(checklistId)
        ? prev.filter((id) => id !== checklistId)
        : [...prev, checklistId]
    );
  };

  const getSelectedChecklistNames = () => {
    if (selectedChecklistIds.length === 0) return "Select checklist(s)";

    const selectedNames = checklists
      .filter(checklist => selectedChecklistIds.includes(checklist.id))
      .map(checklist => checklist.name)
      .join(", ");

    return selectedNames.length > 50 ? selectedNames.substring(0, 50) + "..." : selectedNames;
  };

  // Helper function to parse existing checklist data
  const parseExistingChecklists = (data: any): number[] => {
    // If API returns a checklist array, use it directly
    if (Array.isArray(data.checklist) && data.checklist.length > 0) {
      return data.checklist.map((item: any) => Number(item.id));
    }

    // Fallback to old logic for checklist_ids1, checklist_ids2, ...
    const existingChecklistIds: number[] = [];
    for (let i = 1; i <= 10; i++) {
      const fieldName = `checklist_ids${i}`;
      const value = data[fieldName];
      if (value !== null && value !== undefined && value !== '') {
        const matchingById = checklists.find(checklist => String(checklist.id) === String(value).trim());
        if (matchingById) {
          existingChecklistIds.push(matchingById.id);
        }
      }
    }
    return existingChecklistIds;
  };

  const fetchEnquiry = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ENQUIRY.GET_ENQUIRY_ID(id));
      const data = response.data.data;
      
      console.log('Raw API response:', data);
      
      setProfile(data);
      setFormData(data);

      // Parse existing checklist data only if checklists are loaded
      if (checklists.length > 0) {
        const existingChecklistIds = parseExistingChecklists(data);
        console.log('Parsed existing checklist IDs:', existingChecklistIds);
        setSelectedChecklistIds(existingChecklistIds);
      }
    } catch (err) {
      console.error('Error fetching enquiry:', err);
      toast({ title: "Failed to load enquiry data", variant: "destructive" });
    }
  };

  const fetchSource = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ADS.GET_ADS);
      if (Array.isArray(response.data.data)) {
        setSource(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Source ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.COURSES.GET_COURSES);
      if (Array.isArray(response.data.data)) {
        setCourse(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Course ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.SERVICES.GET_SERVICES);
      if (Array.isArray(response.data.data)) {
        setService(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Service ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchChecklists = async () => {
    try {
      const res = await axiosInstance.get(API_URLS.CHECKLISTS.GET_CHECKLIST);
      console.log('Checklists response:', res.data);
      setChecklists(res.data.data || []);
    } catch (err) {
      console.error('Error fetching checklists:', err);
      toast({ title: "Failed to load checklists", variant: "destructive" });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchChecklists();
      await Promise.all([fetchCourses(), fetchServices(), fetchSource()]);
    };

    fetchData();
  }, []);

  // Fetch enquiry data after checklists are loaded
  useEffect(() => {
    if (checklists.length > 0) {
      fetchEnquiry();
    }
  }, [checklists]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({ title: "Please fix the validation errors", variant: "destructive" });
      return;
    }

    
    // Create submit data with only the required fields
    const submitData: any = {
      candidate_name: formData.candidate_name?.trim(),
      phone: formData.phone?.trim(),
      phone2: formData.phone2?.trim() || null,
      email: formData.email?.trim(),
      preferred_course: formData.preferred_course || null,
      required_service: formData.required_service || null,
      enquiry_status: formData.enquiry_status || null,
      feedback: formData.feedback || null,
      follow_up_on: formData.follow_up_on || null,
       assigned_by_id: profile?.assigned_by_id || null,
    };


        console.log(submitData);

    if (userRole !== "Admin") {
      // Clear all checklist fields first
      for (let i = 1; i <= 10; i++) {
        submitData[`checklist_ids${i}`] = null;
      }

      // Add selected checklists - send the checklist NAME, not ID
      if (selectedChecklistIds.length > 0) {
        selectedChecklistIds.forEach((checklistId, index) => {
          const checklist = checklists.find(item => item.id === checklistId);
          if (checklist && index < 10) {
            const fieldName = `checklist_ids${index + 1}`;
            submitData[fieldName] = checklist.name;
          }
        });
      }
    }

    console.log(submitData);
    

    // Convert submitData to FormData
    const formDataBody = new FormData();
    Object.entries(submitData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataBody.append(key, String(value));
      }
    });

    if (userRole !== "Admin") {
      // Add selected checklist IDs to FormData (overwrite checklist_ids1-10 with IDs)
      for (let i = 0; i < 10; i++) {
        const fieldName = `checklist_ids${i + 1}`;
        if (selectedChecklistIds[i] !== undefined) {
          formDataBody.set(fieldName, String(selectedChecklistIds[i]));
        } else {
          formDataBody.set(fieldName, '');
        }
      }
    }

    try {
      const response = await axiosInstance.patch(
        API_URLS.ENQUIRY.PATCH_ENQUIRY(id),
        formDataBody,
        {
          headers:{
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success || response.status === 200) {
        toast({ title: "Updated successfully", variant: "success" });
        setTimeout(() => {
          fetchEnquiry();
        }, 500);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      let errorMessage = "Failed to update";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: errorMessage, variant: "destructive" });
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  console.log(formData);
  

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="candidate_name">Candidate Name *</Label>
              <Input
                id="candidate_name"
                name="candidate_name"
                value={formData.candidate_name || ''}
                onChange={handleInputChange}
                className={errors.candidate_name ? 'border-red-500' : ''}
              />
              {errors.candidate_name && (
                <p className="text-red-500 text-sm">{errors.candidate_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                maxLength={10}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone2">Phone 2</Label>
              <Input
                id="phone2"
                name="phone2"
                type="tel"
                value={formData.phone2 || ''}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number (optional)"
                maxLength={10}
                className={errors.phone2 ? 'border-red-500' : ''}
              />
              {errors.phone2 && (
                <p className="text-red-500 text-sm">{errors.phone2}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            
            {/* Checklist Dropdown - only for non-Admin */}
            {userRole !== "Admin" && (
              <div className="space-y-2">
                <Label>Checklist</Label>
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-10 px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="truncate">{getSelectedChecklistNames()}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[300px]">
                    {checklists.length > 0 ? (
                      checklists.map((item) => (
                        <DropdownMenuCheckboxItem
                          key={item.id}
                          checked={selectedChecklistIds.includes(item.id)}
                          onCheckedChange={() => handleChecklistToggle(item.id)}
                        >                        
                          {item.name}
                        </DropdownMenuCheckboxItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No checklists available
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {selectedChecklistIds.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {selectedChecklistIds.length} item(s) selected
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}