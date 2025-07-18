import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, ChevronDown } from "lucide-react";
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

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

interface ChecklistItem {
  id: number;
  name: string;
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
    notes: '',
    follow_up_date: '',
    next_action: ''
  })
  const [formErrors, setFormErrors] = useState({
    call_type: '',
    call_status: '',
    call_outcome: '',
    follow_up_date: '',
    next_action: '',
    notes: ''
  });
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleChecklistToggle = (checklistId: number) => {
    setSelectedChecklistIds((prev) =>
      prev.includes(checklistId)
        ? prev.filter((id) => id !== checklistId)
        : [...prev, checklistId]
    );
  };

  // Get selected checklist names for display
  const getSelectedChecklistNames = () => {
    if (selectedChecklistIds.length === 0) return "Select checklist(s)";

    const selectedNames = checklists
      .filter(checklist => selectedChecklistIds.includes(checklist.id))
      .map(checklist => checklist.name)
      .join(", ");

    return selectedNames.length > 50 ? selectedNames.substring(0, 50) + "..." : selectedNames;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation
    const errors: any = {};
    if (!formData.call_type) errors.call_type = 'Call type is required';
    if (!formData.call_status) errors.call_status = 'Call status is required';
    if (!formData.call_outcome) errors.call_outcome = 'Call outcome is required';
    // Only validate follow_up_date if not disabled
    const isFollowUpDisabled =
      formData.call_outcome === 'Won' ||
      formData.call_outcome === 'closed' ||
      formData.call_outcome === 'Not Interested' ||
      formData.call_outcome === 'Do Not Call';
    if (!isFollowUpDisabled) {
      if (!formData.follow_up_date) errors.follow_up_date = 'Follow up date is required';
      // Validate follow-up date is in the future
      if (formData.follow_up_date) {
        const selectedDate = new Date(formData.follow_up_date);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
          errors.follow_up_date = 'Follow up date must be in the future';
        }
      }
    }
    if (!formData.next_action) errors.next_action = 'Next action is required';
    if (!formData.notes) errors.notes = 'Note is required';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      // Format the data for API submission
      const submitData = {
        ...formData,
        // Send selected checklist IDs as name field (as per your requirement)
        name: selectedChecklistIds, // This will be an array of IDs
        checklist_ids: selectedChecklistIds, // Keep this as well if needed
      };

      // Only include follow_up_date if it's not disabled and has a value
      if (!isFollowUpDisabled && formData.follow_up_date) {
        submitData.follow_up_date = formData.follow_up_date.split('T')[0];
      } else {
        // Remove follow_up_date from submitData if disabled
        delete submitData.follow_up_date;
      }

      console.log('Form data:', submitData)
      const response = await axiosInstance.post(API_URLS.CALLS.POST_CALLS, submitData)
      console.log(response);
      toast({ title: "Updated successfully", variant: "success" });

      // Reset form
      setFormData({
        enquiry_id: id.id,
        call_type: '',
        call_status: '',
        call_outcome: '',
        notes: '',
        follow_up_date: '',
        next_action: ''
      })
      setSelectedChecklistIds([]);
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({ title: "Failed to update", variant: "destructive" });
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

  console.log('Current enquiry:', enquiry);
  console.log('Available checklists:', checklists);
  console.log('Selected checklist IDs:', selectedChecklistIds);

  useEffect(() => {
    fetchEnquiry();
    fetchChecklists();
  }, [])

  if (!enquiry) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Loading...</div>
    </div>;
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
                  {enquiry.candidate_name.charAt(0).toUpperCase()}
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
              <h3 className="font-medium text-gray-900 mb-2">Preferred Course</h3>
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
              <h3 className="font-medium text-gray-900 mb-2">Enquiry Status</h3>
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
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Answered">Answered</SelectItem>
                      <SelectItem value="Callback Requested">Callback Requested</SelectItem>
                      <SelectItem value="Information Provided">Information Provided</SelectItem>
                      <SelectItem value="Follow Up">Follow Up</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Do Not Call">Do Not Call</SelectItem>
                      <SelectItem value="walk_in_list">Walk In</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
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
                    disabled={
                      formData.call_outcome === 'Won' ||
                      formData.call_outcome === 'closed' ||
                      formData.call_outcome === 'Not Interested' ||
                      formData.call_outcome === 'Do Not Call'
                    }
                  />
                  {formErrors.follow_up_date && <span className="text-red-500 text-xs">{formErrors.follow_up_date}</span>}
                </div>
              </div>

              {/* Next Action and Checklist in a row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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


              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter call notes..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
                {formErrors.notes && <span className="text-red-500 text-xs">{formErrors.notes}</span>}
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