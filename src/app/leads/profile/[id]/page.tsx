
import { DashboardHeader } from "@/components/DashboardHeader";
import { EnquiryProfile } from "@/components/EnquiryProfile";
import { useParams } from "react-router-dom";

export default function EnquiryProfilePage() {
  const { id } = useParams()
  console.log(id);
  
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span>Enquiry</span>
            <span>›</span>
            <span>Active Enquiry</span>
            <span>›</span>
            <span className="text-gray-900">Enquiry Profile</span>
          </nav>
          <h1 className="text-2xl font-semibold text-gray-900">Enquiry Profile</h1>
        </div>

        <EnquiryProfile id={id}/>
      </main>
    </div>
  );
}
