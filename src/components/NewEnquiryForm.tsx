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
  const [telecaller, setTellecaller] = useState();
  const [counselorOptions, setCounselorOptions] = useState<{ value: string, label: string }[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [source, setSource] = useState<{ value: string, label: string }[]>([])
  const [service, setService] = useState<{ value: string, label: string }[]>([])
  const [course, setCourse] = useState<{ value: string, label: string }[]>([])

  const fetchTelecaller = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.TELLE_CALLERS.GET_TELLE_CALLERS);
      console.log(response);
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
      console.log(err);
    }

  };

  const fetchSource = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ADS.GET_ADS);
      console.log(response);
      // setSource(response.data.data)
      // Map response to options for select
      if (Array.isArray(response.data.data)) {
        setSource(
          response.data.data.map((item: any) => ({
            value: Number(item.id),
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
            value: Number(item.id),
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
            value: Number(item.id),
            label: item.name || item.username || item.email || `Counselor ${item.id}`
          }))
        );
      }
    } catch (err) {
      console.log(err);
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
          validation: z.string().min(1, 'Candidate name is required')
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
          validation: z.string().email('Invalid email address')
        }
      ]
    },
    {
      columns: 3,
      fields: [
        {
          name: 'assigned_by_id',
          label: 'Counselor',
          type: 'select',
          placeholder: 'Select Counsielor',
          required: true,
          options: !isTelecaller
            ? counselorOptions
            : telecallerId && user.telecaller.name
              ? [{ value: String(telecallerId), label: user.telecaller.name }]
              : [],
          validation: z.string().min(1, 'Branch is required'),
          // disabled: isTelecaller
        },
        {
          name: 'preferred_course_id',
          label: 'Preferred Course',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          // showAddButton: true,
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
        {
          name: 'follow_up_on',
          label: 'Follow Up On',
          type: 'date',
          placeholder: 'Sep 30, 2025',
          description: 'Set Follow up Date for Already Contacted Enquiries',
          validation: z.date().optional()
        },
        {
          name: 'enquiry_status',
          label: 'Enquiry Status',
          type: 'select',
          placeholder: 'Select status',
          required: true,
          options: [
            { value: 'Active', label: 'Active' },
            { value: 'Closed', label: 'Closed' },
          ],
          validation: z.string().min(1, 'Required service is required')
        },
        {
          name: 'mettad_id',
          label: 'Source',
          type: 'select',
          placeholder: 'Select Source',
          required: true,
          options: source,
          validation: z.string().min(1, 'Branch is required')
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
          placeholder: 'Type Feedback',
          description: 'Provide Feed Back for Already Contacted Enquiries',
          validation: z.string().optional()
        },
      ]
    }
  ];

  const handleSubmit = async (data: any) => {
    console.log('Form submitted:', data);
    // Format follow_up_on to YYYY-MM-DD if present
    if (data.follow_up_on) {
      const dateObj = new Date(data.follow_up_on);
      if (!isNaN(dateObj.getTime())) {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        data.follow_up_on = `${yyyy}-${mm}-${dd}`;
      }
    }
    try {
      console.log(data);

      const response = await axiosInstance.post(API_URLS.ENQUIRY.POST_ENQUIRY, data)
      console.log(response);
      // Reset the form by changing the key
      toast({ title: "Enquiry created successsfully", variant: "success" });
      setFormKey(prev => prev + 1);
    } catch (err) {
      console.log(err);
      toast({ title: "Error creating enquiry", variant: "destructive" });
    }
    // Handle form submission here
  };

  return (
    <div className="space-y-6">
      <DynamicForm
        key={formKey}
        title="NEW ENQUIRY"
        sections={enquiryFormSections}
        onSubmit={handleSubmit}
        submitLabel="Save Enquiry"
        showCancel={true}
        onCancel={() => console.log('Cancel clicked')}
      />

      {/* Bulk Upload Section */}
      <BulkUploadSection/>
    </div>
  );
}
