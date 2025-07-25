import React, { useEffect, useState } from 'react';
import { DynamicForm, FormSection, FormField } from "@/components/ui/dynamic-form";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import axiosInstance from './apiconfig/axios';
import { API_URLS } from './apiconfig/api_urls';
import { toast } from '@/hooks/use-toast';
import { BulkUploadSection } from './Bulkupload';

export function NewEnquiryForm() {
  const userData = typeof window !== 'undefined' ? localStorage.getItem("user_data") : null;
  const user = userData ? JSON.parse(userData) : null;
  const isTelecaller = user && user.role === "Telecaller";
  const telecallerId = isTelecaller ? user.telecaller.id : undefined;
  
  // Set button color class based on role
  const buttonColorClass = user && user.role === "Telecaller"
    ? "bg-green-600 hover:bg-green-700"
    : user && user.role === "Admin"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-green-600 hover:bg-green-700";
      
  const [telecaller, setTellecaller] = useState();
  const [counselorOptions, setCounselorOptions] = useState<{ value: string, label: string }[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [source, setSource] = useState<{ value: string, label: string }[]>([])
  const [service, setService] = useState<{ value: string, label: string }[]>([])
  const [course, setCourse] = useState<{ value: string, label: string }[]>([])
  const [loading, setLoading] = useState(false);

  const fetchTelecaller = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS);
      console.log('Telecaller response:', response);
      setTellecaller(response.data.data)
      // Map response to options for select
      if (Array.isArray(response.data.data)) {
        setCounselorOptions(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.username || item.email || `Counselor ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching telecaller:', err);
    }
  };

  const fetchSource = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ADS.GET_ADS);
      console.log('Source response:', response);
      if (Array.isArray(response.data.data)) {
        setSource(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.title || `Source ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching source:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.COURSES.GET_COURSES);
      console.log('Courses response:', response);
      if (Array.isArray(response.data.data)) {
        setCourse(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.title || `Course ${item.id}`
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
      console.log('Services response:', response);
      if (Array.isArray(response.data.data)) {
        setService(
          response.data.data.map((item: any) => ({
            value: String(item.id),
            label: item.name || item.title || `Service ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  useEffect(() => {
    fetchTelecaller();
    fetchSource();
    fetchCourses();
    fetchServices();
  }, [])

  // Define form fields configuration
  const enquiryFormSections: FormSection[] = [
    {
      columns: 4,
      fields: [
        {
          name: 'candidate_name',
          label: 'Candidate Name',
          type: 'text',
          placeholder: 'Enter Name',
          required: true,
          validation: z.string().min(1, 'Candidate name is required').trim()
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'phone',
          placeholder: 'Enter Phone Number',
          required: true,
          validation: z.string()
            .min(10, 'Phone number must be 10 digits')
            .max(10, 'Phone number must be 10 digits')
            .regex(/^\d{10}$/, 'Phone number must be 10 digits and only numbers')
        },
        {
          name: 'phone2',
          label: 'Phone 2',
          type: 'phone',
          placeholder: 'Enter Phone Number',
          validation: z.string()
            .optional()
            .refine(val => !val || /^\d{10}$/.test(val), {
              message: 'Phone number must be 10 digits and only numbers',
            })
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'Enter Email',
          required: true,
          validation: z.string().email('Invalid email address').trim()
        }
      ]
    },
    {
      columns: 3,
      fields: [
        {
          name: 'assigned_by_id',
          label: 'Counsellor',
          type: 'select',
          placeholder: 'Select counsellor',
          required: true,
          options: !isTelecaller
            ? counselorOptions
            : telecallerId && user.telecaller.name
              ? [{ value: String(telecallerId), label: user.telecaller.name }]
              : [],
          validation: z.string().min(1, 'Counsellor is required'),
        },
        {
          name: 'preferred_course_id',
          label: 'Preferred Course',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          options: course,
          validation: z.string().min(1, 'Preferred course is required')
        },
        {
          name: 'required_service_id',
          label: 'Required Service',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          options: service,
          validation: z.string().min(1, 'Required service is required')
        }
      ]
    },
    {
      columns: 3,
      fields: [
        // Removed follow_up_on field as per request
        {
          name: 'enquiry_status',
          label: 'Enquiry Status',
          type: 'select',
          placeholder: 'Select status',
          required: true,
          options: [
            { value: 'Active', label: 'Active' },
            { value: 'Not interested', label: 'Not interested' },
          ],
          validation: z.string().min(1, 'Enquiry status is required')
        },
        {
          name: 'mettad_id',
          label: 'Source',
          type: 'select',
          placeholder: 'Select Source',
          required: true,
          options: source,
          validation: z.string().min(1, 'Source is required')
        },
      ]
    },
    {
      columns: 1,
      fields: [
        {
          name: 'feedback',
          label: 'FeedBack',
          type: 'textarea',
          required: true,
          placeholder: 'Type Feedback',
          validation: z.string().min(1, 'Feedback is required').trim()
        },
      ]
    }
  ];

  const handleSubmit = async (data: any) => {
    console.log('Form data before processing:', data);
    
    setLoading(true);
    
    try {
      // Clean and validate data
      const cleanedData = {
        ...data,
        // Ensure all required fields are present and not empty
        candidate_name: data.candidate_name?.trim() || '',
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        assigned_by_id: data.assigned_by_id ? String(data.assigned_by_id) : '',
        preferred_course_id: data.preferred_course_id ? String(data.preferred_course_id) : '',
        required_service_id: data.required_service_id ? String(data.required_service_id) : '',
        enquiry_status: data.enquiry_status || '',
        mettad_id: data.mettad_id ? String(data.mettad_id) : '',
        feedback: data.feedback?.trim() || '',
        // Handle optional fields
        phone2: data.phone2?.trim() || null,
      };

      // Removed follow_up_on formatting logic

      // Remove empty optional fields
      if (!cleanedData.phone2) {
        delete cleanedData.phone2;
      }

      console.log('Cleaned data being sent:', cleanedData);

      // Validate required fields before sending
      const requiredFields = [
        'candidate_name', 'phone', 'email', 'assigned_by_id', 
        'preferred_course_id', 'required_service_id', 'enquiry_status', 
        'mettad_id', 'feedback' // Removed 'follow_up_on'
      ];

      const missingFields = requiredFields.filter(field => !cleanedData[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        toast({ 
          title: `Missing required fields: ${missingFields.join(', ')}`, 
          variant: "destructive" 
        });
        return;
      }

      const response = await axiosInstance.post(API_URLS.ENQUIRY.POST_ENQUIRY, cleanedData,{
        headers:{
          "Content-Type": "multipart/form-data"
        }
      });
      console.log('API Response:', response);
      
      toast({ title: "Enquiry created successfully", variant: "success" });
      setFormKey(prev => prev + 1);
      
    } catch (err: any) {
      console.error('Error creating enquiry:', err);
      
      // Better error handling
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        toast({ 
          title: `Validation errors: ${errorMessages.join(', ')}`, 
          variant: "destructive" 
        });
      } else if (err.response?.data?.message) {
        toast({ 
          title: err.response.data.message, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error creating enquiry. Please try again.", 
          variant: "destructive" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
  // Reset the form by incrementing the key, which will remount the component
  setFormKey(prev => prev + 1);
};



  return (
    <div className="space-y-6">
      <DynamicForm
        key={formKey}
        title="NEW ENQUIRY"
        sections={enquiryFormSections}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Saving..." : "Save Enquiry"}
        submitButtonClassName={`${buttonColorClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        showCancel={true}
       onCancel={handleCancel}
        defaultValues={{
          assigned_by_id: isTelecaller ? String(telecallerId) : undefined,
          enquiry_status: 'Active', // Set default status
        }}
      />

      {/* Bulk Upload Section */}
      <BulkUploadSection/>
    </div>
  );
}