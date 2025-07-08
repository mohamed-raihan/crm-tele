
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewEnquiryForm } from "@/components/NewEnquiryForm";
import { ActiveEnquirySection } from "@/components/ActiveEnquirySection";
import { ClosedEnquiryTable } from "@/components/ClosedEnquiryTable";

export default function LeadsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Leads Management</h1>
          <p className="text-gray-600">Track and manage your sales leads and enquiries</p>
        </div>

        <Tabs defaultValue="new-enquiry" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new-enquiry">New Enquiry</TabsTrigger>
            <TabsTrigger value="active-enquiry">Active Enquiry</TabsTrigger>
            <TabsTrigger value="closed-enquiry">Closed Enquiry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-enquiry" className="space-y-4">
            <NewEnquiryForm />
          </TabsContent>
          
          <TabsContent value="active-enquiry" className="space-y-4">
            <ActiveEnquirySection />
          </TabsContent>
          
          <TabsContent value="closed-enquiry" className="space-y-4">
           <ClosedEnquiryTable/>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
