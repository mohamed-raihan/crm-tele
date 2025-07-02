
import React from 'react';
import { DynamicForm, FormSection, FormField } from "@/components/ui/dynamic-form";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

export function NewEnquiryForm() {
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
          validation: z.string().min(1, 'Phone number is required')
        },
        {
          name: 'phone2',
          label: 'Phone 2',
          type: 'phone',
          placeholder: 'Enter Phone Number',
          validation: z.string().optional()
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
      columns: 4,
      fields: [
        {
          name: 'enquirySource',
          label: 'Enquiry Source',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          showAddButton: true,
          onAddClick: () => console.log('Add enquiry source'),
          options: [
            { value: 'website', label: 'Website' },
            { value: 'phone', label: 'Phone Call' },
            { value: 'referral', label: 'Referral' },
            { value: 'social', label: 'Social Media' }
          ],
          validation: z.string().min(1, 'Enquiry source is required')
        },
        {
          name: 'branch',
          label: 'Branch',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          options: [
            { value: 'main', label: 'Main Branch' },
            { value: 'north', label: 'North Branch' },
            { value: 'south', label: 'South Branch' },
            { value: 'east', label: 'East Branch' }
          ],
          validation: z.string().min(1, 'Branch is required')
        },
        {
          name: 'preferredCourse',
          label: 'Preferred Course',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          showAddButton: true,
          onAddClick: () => console.log('Add preferred course'),
          options: [
            { value: 'engineering', label: 'Engineering' },
            { value: 'medical', label: 'Medical' },
            { value: 'commerce', label: 'Commerce' },
            { value: 'arts', label: 'Arts' }
          ],
          validation: z.string().min(1, 'Preferred course is required')
        },
        {
          name: 'requiredService',
          label: 'Required Service',
          type: 'select',
          placeholder: 'Search Here',
          required: true,
          showAddButton: true,
          onAddClick: () => console.log('Add required service'),
          options: [
            { value: 'consultation', label: 'Consultation' },
            { value: 'admission', label: 'Admission Guidance' },
            { value: 'counselling', label: 'Career Counselling' },
            { value: 'test-prep', label: 'Test Preparation' }
          ],
          validation: z.string().min(1, 'Required service is required')
        }
      ]
    },
    {
      columns: 2,
      fields: [
        {
          name: 'feedback',
          label: 'FeedBack',
          type: 'textarea',
          placeholder: 'Type Feedback',
          description: 'Provide Feed Back for Already Contacted Enquiries',
          validation: z.string().optional()
        },
        {
          name: 'followUpDate',
          label: 'Follow Up On',
          type: 'date',
          placeholder: 'Sep 30, 2025',
          description: 'Set Follow up Date for Already Contacted Enquiries',
          validation: z.date().optional()
        }
      ]
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  return (
    <div className="space-y-6">
      <DynamicForm
        title="NEW ENQUIRY"
        sections={enquiryFormSections}
        onSubmit={handleSubmit}
        submitLabel="Save Enquiry"
        showCancel={true}
        onCancel={() => console.log('Cancel clicked')}
      />

      {/* Bulk Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">BULK UPLOAD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                * Save the file as MS-DOS CSV, Do not Use any Special Characters in File Name.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                * Please Download Demo File and Upload the data in Same Format
              </p>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Download Demo File
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Branch</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search Here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Branch</SelectItem>
                    <SelectItem value="north">North Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Course</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search Here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Enquiry Source</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search Here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Required Service</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search Here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="admission">Admission Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File</label>
              <div className="flex gap-2">
                <Input placeholder="Upload File" className="flex-1" readOnly />
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                  Select File
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Please Upload Enquiries as MS DOS CSV File
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
