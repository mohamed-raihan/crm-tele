
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeadsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>Track and manage your sales leads</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Lead management interface coming soon...</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
