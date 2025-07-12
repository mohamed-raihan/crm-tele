import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axiosInstance from '../apiconfig/axios';
import { API_URLS } from '../apiconfig/api_urls';
import { toast } from '@/hooks/use-toast';

interface id {
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
  preferred_course: string;
  required_service: string;
}

interface ValidationErrors {
  candidate_name?: string;
  phone?: string;
  phone2?: string;
  email?: string;
}

export function ProfileInfoTab(id:id) {
  const [profile, setProfile] = useState<Profile>()
  const [formData, setFormData] = useState<Partial<Profile>>({})
  const [source, setSource] = useState<{ value: string, label: string }[]>([])
  const [service, setService] = useState<{ value: string, label: string }[]>([])
  const [course, setCourse] = useState<{ value: string, label: string }[]>([])
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Validation functions
  const validateEmail = (email: string): boolean => {
    // More comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Additional checks for common email issues
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Check for valid domain structure
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }
    
    const [localPart, domain] = parts;
    
    // Local part validation
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }
    
    // Domain validation
    if (domain.length === 0 || domain.length > 253) {
      return false;
    }
    
    // Check for valid TLD (top-level domain)
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return false;
    }
    
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || tld.length > 6) {
      return false;
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }
    
    // Check for dots at start or end of local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }
    
    // Check for dots at start or end of domain
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

    // Validate candidate name
    if (!formData.candidate_name?.trim()) {
      newErrors.candidate_name = 'Candidate name is required';
    } else if (formData.candidate_name.trim().length < 2) {
      newErrors.candidate_name = 'Candidate name must be at least 2 characters';
    }

    // Validate phone
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate phone2 (optional but if provided, must be valid)
    if (formData.phone2?.trim() && !validatePhone(formData.phone2)) {
      newErrors.phone2 = 'Please enter a valid 10-digit phone number';
    }

    // Validate email
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchEnquiry = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ENQUIRY.GET_ENQUIRY_ID(id.id));
      setProfile(response.data.data)
      setFormData(response.data.data) // Initialize formData with profile data
    } catch (err) {
      console.log(err);
    }
  }

  const fetchSource = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ADS.GET_ADS);
      console.log(response);
      // setSource(response.data.data)
      // Map response to options for select
      if (Array.isArray(response.data.data)) {
        setSource(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Counselor ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }

  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.COURSES.GET_COURSES);
      console.log(response);
      // setSource(response.data.data)
      // Map response to options for select
      if (Array.isArray(response.data.data)) {
        setCourse(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Counselor ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }

  };

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.SERVICES.GET_SERVICES);
      console.log(response);
      // setSource(response.data.data)
      // Map response to options for select
      if (Array.isArray(response.data.data)) {
        setService(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Counselor ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }

  };

  useEffect(() => {
    fetchEnquiry();
    fetchCourses();
    fetchServices();
    fetchSource();
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ title: "Please fix the validation errors", variant: "destructive" });
      return;
    }

    try {
      const response = await axiosInstance.patch(API_URLS.ENQUIRY.PATCH_ENQUIRY(id.id), formData);
      // Optionally, show a toast or update UI
      toast({ title: "Updated successfully", variant: "success" });
      fetchEnquiry(); // Refresh data
    } catch (error) {
      console.log(error);
      toast({ title: "failed to update", variant: "destructive" });
    }
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

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
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="mettad_name">Enquiry Source</Label>
              <Select value={formData.mettad_name || ''} onValueChange={val => handleSelectChange('mettad_name', val)}>
                <SelectTrigger>
                  <SelectValue placeholder={profile.mettad_name} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch_name">Branch</Label>
              <Select value={formData.branch_name || ''} onValueChange={val => handleSelectChange('branch_name', val)}>
                <SelectTrigger>
                  <SelectValue placeholder={profile.branch_name} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calicut">Calicut</SelectItem>
                  <SelectItem value="kochi">Kochi</SelectItem>
                  <SelectItem value="trivandrum">Trivandrum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_course">Preferred Course</Label>
              <Select value={formData.preferred_course || ''} onValueChange={val => handleSelectChange('preferred_course', val)}>
                <SelectTrigger>
                  <SelectValue placeholder={profile.preferred_course} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course1">Course 1</SelectItem>
                  <SelectItem value="course2">Course 2</SelectItem>
                  <SelectItem value="course3">Course 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required_service">Required Service</Label>
              <Select value={formData.required_service || ''} onValueChange={val => handleSelectChange('required_service', val)}>
                <SelectTrigger>
                  <SelectValue placeholder={profile.required_service} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service1">Service 1</SelectItem>
                  <SelectItem value="service2">Service 2</SelectItem>
                  <SelectItem value="service3">Service 3</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">Save Changes</button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
