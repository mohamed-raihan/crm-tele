
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  phone2: z.string().optional(),
  email: z.string().email('Invalid email address'),
  enquirySource: z.string().min(1, 'Enquiry source is required'),
  branch: z.string().min(1, 'Branch is required'),
  preferredCourse: z.string().min(1, 'Preferred course is required'),
  requiredService: z.string().min(1, 'Required service is required'),
  feedback: z.string().optional(),
  followUpDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function NewEnquiryForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: '',
      phone: '',
      phone2: '',
      email: '',
      enquirySource: '',
      branch: '',
      preferredCourse: '',
      requiredService: '',
      feedback: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NEW ENQUIRY</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="candidateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="enquirySource"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Enquiry Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Search Here" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="phone">Phone Call</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="icon" className="mt-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Search Here" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="main">Main Branch</SelectItem>
                            <SelectItem value="north">North Branch</SelectItem>
                            <SelectItem value="south">South Branch</SelectItem>
                            <SelectItem value="east">East Branch</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="preferredCourse"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Preferred Course</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Search Here" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="icon" className="mt-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="requiredService"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Required Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Search Here" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="admission">Admission Guidance</SelectItem>
                            <SelectItem value="counselling">Career Counselling</SelectItem>
                            <SelectItem value="test-prep">Test Preparation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" size="icon" className="mt-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FeedBack</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Type Feedback" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Provide Feed Back for Already Contacted Enquiries
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow Up On</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMM dd, yyyy")
                              ) : (
                                <span>Sep 30, 2025</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-sm text-muted-foreground">
                        Set Follow up Date for Already Contacted Enquiries
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Save Enquiry
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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
