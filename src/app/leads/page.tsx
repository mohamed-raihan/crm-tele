
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewEnquiryForm } from "@/components/NewEnquiryForm";

export default function LeadsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Leads Management</h1>
          <p className="text-gray-600">Track and manage your sales leads and enquiries</p>
        </div>

        <Tabs defaultValue="new-enquiries" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="new-enquiries">New Enquiries</TabsTrigger>
            <TabsTrigger value="all-leads">All Leads</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow Ups</TabsTrigger>
            <TabsTrigger value="converted">Converted</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-enquiries" className="space-y-4">
            <NewEnquiryForm />
          </TabsContent>
          
          <TabsContent value="all-leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>View and manage all your leads</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">All leads overview coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="follow-ups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Follow Ups</CardTitle>
                <CardDescription>Leads that require follow up</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Follow up management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="converted" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Converted Leads</CardTitle>
                <CardDescription>Successfully converted leads</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Converted leads tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
