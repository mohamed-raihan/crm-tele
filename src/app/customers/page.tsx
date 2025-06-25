
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomersPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Manage your customer relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Customer management interface coming soon...</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
