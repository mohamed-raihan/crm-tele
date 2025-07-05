import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { SystemOverview } from "@/components/SystemOverview";
import { RecentActivity } from "@/components/RecentActivity";
import { CustomerOverview } from "@/components/CustomerOverview";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <SystemOverview />
          <RecentActivity />
          <CustomerOverview />
        </div>
      </main>
    </div>
  );
}
