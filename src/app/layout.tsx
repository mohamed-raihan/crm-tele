import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const queryClient = new QueryClient();

interface RootLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: RootLayoutProps) {
  const { getLayout } = useUserRole();
  
  return getLayout(children);
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LayoutContent>
            {children}
          </LayoutContent>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
