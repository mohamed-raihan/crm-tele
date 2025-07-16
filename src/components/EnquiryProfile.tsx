import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2 } from "lucide-react";
import { ProfileInfoTab } from "@/components/profile-tabs/ProfileInfoTab";
import { ActivitiesTab } from "@/components/profile-tabs/ActivitiesTab";
import { RespondsTab } from "@/components/profile-tabs/RespondsTab";
import { ContactHistoryTab } from "@/components/profile-tabs/ContactHistoryTab";
import axiosInstance from './apiconfig/axios';
import { API_URLS } from './apiconfig/api_urls';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

// Mock data for the profile
const profileData = {
  id: "12122",
  name: "Rishita",
  phone: "+91 999 444 323",
  email: "rishta123@gmail.com",
  branch: "Calicut",
  enquiryStatus: "Rishita",
  interested: "Interested",
  interestLevel: "Partial 50%"
};

interface Enquiry {
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
  preferred_course_name: string;
  required_service_name: string;
}

interface id {
  id: string;
}

export function EnquiryProfile(id: id) {

  const [enquiry, setEnquiry] = useState<Enquiry>()
  const [formData, setFormData] = useState({
    enquiry_id: id.id,
    call_type: '',
    call_status: '',
    call_outcome: '',
    // call_start_time: '',
    // call_end_time: '',
    note: '',
    follow_up_date: '',
    next_action: ''
  })
  const [formErrors, setFormErrors] = useState({
    call_type: '',
    call_status: '',
    call_outcome: '',
    follow_up_date: '',
    next_action: '',
    note: ''
  });

  // Check if user is a Telecaller
  const userData = localStorage.getItem("user_data");
  const user = userData ? JSON.parse(userData) : null;
  const isTelecaller = user && user.role === "Telecaller";

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation
    const errors: any = {};
    if (!formData.call_type) errors.call_type = 'Call type is required';
    if (!formData.call_status) errors.call_status = 'Call status is required';
    if (!formData.call_outcome) errors.call_outcome = 'Call outcome is required';
    if (!formData.follow_up_date) errors.follow_up_date = 'Follow up date is required';
    if (!formData.next_action) errors.next_action = 'Next action is required';
    if (!formData.note) errors.note = 'Note is required';
    
    // Validate follow-up date is in the future
    if (formData.follow_up_date) {
      const selectedDate = new Date(formData.follow_up_date);
      const currentDate = new Date();
      if (selectedDate <= currentDate) {
        errors.follow_up_date = 'Follow up date must be in the future';
      }
    }
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      // Format the data for API submission
      const submitData = {
        ...formData,
        // Convert datetime-local to YYYY-MM-DD format
        follow_up_date: formData.follow_up_date ? formData.follow_up_date.split('T')[0] : ''
      };
      
      console.log('Form data:', submitData)
      const reponse = await axiosInstance.post(API_URLS.CALLS.POST_CALLS, submitData)
      console.log(reponse);
      toast({ title: "Updated successfully", variant: "success" });
      setFormData({
        enquiry_id: id.id,
        call_type: '',
        call_status: '',
        call_outcome: '',
        // call_start_time: '',
        // call_end_time: '',
        note: '',
        follow_up_date: '',
        next_action: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({ title: "failed to update", variant: "destructive" });
    }
  }

  const fetchEnquiry = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ENQUIRY.GET_ENQUIRY_ID(id.id))
      console.log(response);
      setEnquiry(response.data.data)
    } catch (err) {
      console.error(err);
    }
  }

  console.log(enquiry);


  useEffect(() => {
    fetchEnquiry();
  }, [])

  if (!enquiry) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">PROFILE</span>
            </div>
            {/* <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left section - Avatar and basic info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 bg-gray-700">
                <AvatarFallback className="text-white text-xl font-semibold">
                  R
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{enquiry.candidate_name}</h2>
                </div>
                <p className="text-gray-600">{enquiry.created_at.split('T')[0]}</p>
              </div>
            </div>

            {/* Middle section - Email */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">{enquiry.email}</p>
            </div>

            {/* Right section - Branch */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Branch</h3>
              <p className="text-gray-600">{enquiry.branch_name}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">{enquiry.phone}</p>
            </div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6 pt-6 border-t">
            {/* Enquiry Status */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Follow Ups</h3>
              <p className="text-gray-600">{enquiry.follow_up_on}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Prefered Course</h3>
              <p className="text-gray-600">{enquiry.preferred_course_name}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Service</h3>
              <p className="text-gray-600">{enquiry.required_service_name}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Source</h3>
              <p className="text-gray-600">{enquiry.mettad_name}</p>
            </div>

            {/* Interested */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">enquiry_status</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {enquiry.enquiry_status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isTelecaller && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">UPDATE CALL STATUS</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Call Type */}
                <div className="space-y-2">
                  <Label htmlFor="call_type">Call Type</Label>
                  <Select value={formData.call_type} onValueChange={(value) => handleInputChange('call_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select call type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Incoming">Incoming</SelectItem>
                      <SelectItem value="Outgoing">Outgoing</SelectItem>
                      {/* <SelectItem value="missed">Missed</SelectItem> */}
                    </SelectContent>
                  </Select>
                  {formErrors.call_type && <span className="text-red-500 text-xs">{formErrors.call_type}</span>}
                </div>

                {/* Call Status */}
                <div className="space-y-2">
                  <Label htmlFor="call_status">Call Status</Label>
                  <Select value={formData.call_status} onValueChange={(value) => handleInputChange('call_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select call status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="Not Answered">Not Answered</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                      <SelectItem value="Switched Off">Switched Off</SelectItem>
                      {/* <SelectItem value="Answered">Answered</SelectItem> */}
                      <SelectItem value="No Response">No Response</SelectItem>
                      <SelectItem value="Invalid Number">Invalid Number</SelectItem>
                      <SelectItem value="not_contacted">Not Contacted</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.call_status && <span className="text-red-500 text-xs">{formErrors.call_status}</span>}
                </div>

                {/* Call Outcome */}
                <div className="space-y-2">
                  <Label htmlFor="call_outcome">Call Outcome</Label>
                  <Select value={formData.call_outcome} onValueChange={(value) => handleInputChange('call_outcome', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select call outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                      <SelectItem value="Callback Requested">Callback Requested</SelectItem>
                      <SelectItem value="Information Provided">Information Provided</SelectItem>
                      <SelectItem value="Follow Up">Follow Up</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Do Not Call">Do Not Call</SelectItem>
                      <SelectItem value="walk_in_list">Walk In</SelectItem>
                      <SelectItem value="closed">closed</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.call_outcome && <span className="text-red-500 text-xs">{formErrors.call_outcome}</span>}
                </div>

                {/* Follow Up Date */}
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow Up Date & Time</Label>
                  <Input
                    type="datetime-local"
                    id="follow_up_date"
                    value={formData.follow_up_date}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  />
                  {formErrors.follow_up_date && <span className="text-red-500 text-xs">{formErrors.follow_up_date}</span>}
                </div>

                {/* Call Start Time */}
                {/* <div className="space-y-2">
                  <Label htmlFor="call_start_time">Call Start Time</Label>
                  <Input
                    type="datetime-local"
                    id="call_start_time"
                    value={formData.call_start_time}
                    onChange={(e) => handleInputChange('call_start_time', e.target.value)}
                  />
                </div> */}

                {/* Call End Time */}
                {/* <div className="space-y-2">
                  <Label htmlFor="call_end_time">Call End Time</Label>
                  <Input
                    type="datetime-local"
                    id="call_end_time"
                    value={formData.call_end_time}
                    onChange={(e) => handleInputChange('call_end_time', e.target.value)}
                  />
                </div> */}
              </div>

              {/* Next Action */}
              <div className="space-y-2">
                <Label htmlFor="next_action">Next Action</Label>
                <Select value={formData.next_action} onValueChange={(value) => handleInputChange('next_action', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select next action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call_back">Call Back</SelectItem>
                    <SelectItem value="send_email">Send Email</SelectItem>
                    <SelectItem value="send_sms">Send SMS</SelectItem>
                    <SelectItem value="meeting">Schedule Meeting</SelectItem>
                    <SelectItem value="no_action">No Action Required</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.next_action && <span className="text-red-500 text-xs">{formErrors.next_action}</span>}
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Enter call notes..."
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  rows={4}
                />
                {formErrors.note && <span className="text-red-500 text-xs">{formErrors.note}</span>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Call Status
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Profile Tabs */}
      <Tabs defaultValue="profile-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile-info">Profile Info</TabsTrigger>
          {/* <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="responds">Responds</TabsTrigger> */}
          <TabsTrigger value="contact-history">Contact History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile-info" className="mt-6">
          <ProfileInfoTab id={id.id} />
        </TabsContent>

        {/* <TabsContent value="activities" className="mt-6">
          <ActivitiesTab />
        </TabsContent>
        
        <TabsContent value="responds" className="mt-6">
          <RespondsTab />
        </TabsContent> */}

        <TabsContent value="contact-history" className="mt-6">
          <ContactHistoryTab id={id.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}