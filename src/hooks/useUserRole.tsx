import { useAuth } from "./AuthContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { TelecallerLayout } from "@/components/layouts/TelecallerLayout";

export const useUserRole = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isTelecaller = user?.role === 'telecaller';
  
  const getLayout = (children: React.ReactNode) => {
    if (isAdmin) {
      return <AdminLayout>{children}</AdminLayout>;
    } else if (isTelecaller) {
      return <TelecallerLayout>{children}</TelecallerLayout>;
    }
    return children; // Fallback for unauthenticated users
  };
  
  return {
    isAdmin,
    isTelecaller,
    getLayout,
    user
  };
}; 