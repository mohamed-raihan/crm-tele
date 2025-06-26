
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ProfileInfoTab() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="candidate-name">Candidate Name</Label>
            <Input id="candidate-name" placeholder="Rishita" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="Enter Phone Number" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone2">Phone 2</Label>
            <Input id="phone2" placeholder="Enter Phone Number" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Enter Email" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="enquiry-source">Enquiry Source</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Search Here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Search Here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calicut">Calicut</SelectItem>
                <SelectItem value="kochi">Kochi</SelectItem>
                <SelectItem value="trivandrum">Trivandrum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferred-course">Preferred Course</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Search Here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course1">Course 1</SelectItem>
                <SelectItem value="course2">Course 2</SelectItem>
                <SelectItem value="course3">Course 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="required-service">Required Service</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Search Here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service1">Service 1</SelectItem>
                <SelectItem value="service2">Service 2</SelectItem>
                <SelectItem value="service3">Service 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
