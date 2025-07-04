
import React from 'react';
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

export function EnquiryProfile() { 
  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">PROFILE</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left section - Avatar and basic info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 bg-gray-700">
                <AvatarFallback className="text-white text-xl font-semibold">
                  R
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{profileData.name}</h2>
                  <Edit className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-gray-600">{profileData.phone}</p>
              </div>
            </div>

            {/* Middle section - Email */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">{profileData.email}</p>
            </div>

            {/* Right section - Branch */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Branch</h3>
              <p className="text-gray-600">{profileData.branch}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
            {/* Enquiry Status */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Enquiry Status</h3>
              <p className="text-gray-600">{profileData.enquiryStatus}</p>
            </div>

            {/* Interested */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Interested</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{profileData.interested}</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {profileData.interestLevel}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile-info">Profile Info</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="responds">Responds</TabsTrigger>
          <TabsTrigger value="contact-history">Contact History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile-info" className="mt-6">
          <ProfileInfoTab />
        </TabsContent>
        
        <TabsContent value="activities" className="mt-6">
          <ActivitiesTab />
        </TabsContent>
        
        <TabsContent value="responds" className="mt-6">
          <RespondsTab />
        </TabsContent>
        
        <TabsContent value="contact-history" className="mt-6">
          <ContactHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
