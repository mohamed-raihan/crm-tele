
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentActivity } from "@/components/RecentActivity";
import { CustomerOverview } from "@/components/CustomerOverview";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <CustomerOverview />
        </div>
      </main>
    </div>
  );
}
