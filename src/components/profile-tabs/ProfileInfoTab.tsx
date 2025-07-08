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

export function ProfileInfoTab(id:id) {
  const [profile, setProfile] = useState<Profile>()
  const [formData, setFormData] = useState<Partial<Profile>>({})

  const fetchEnquiry = async () => {
    try {
      const response = await axiosInstance.get(API_URLS.ENQUIRY.GET_ENQUIRY_ID(id.id));
      setProfile(response.data.data)
      setFormData(response.data.data) // Initialize formData with profile data
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchEnquiry();
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              <Label htmlFor="candidate_name">Candidate Name</Label>
              <Input id="candidate_name" name="candidate_name" value={formData.candidate_name || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2">Phone 2</Label>
              <Input id="phone2" name="phone2" value={formData.phone2 || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
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
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">Save Changes</button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
