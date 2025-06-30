import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const queryClient = new QueryClient();

interface RootLayoutProps {
  children: React.ReactNode;
}

// Create a separate component to use useLocation hook
function LayoutContent({ children }: RootLayoutProps) {
  const location = useLocation();

  // Define paths where sidebar should be hidden
  const pathsWithoutSidebar = ["/login", "/forgotpassword"];
  const shouldHideSidebar = pathsWithoutSidebar.includes(location.pathname);

  if (shouldHideSidebar) {
    return (
      <div className="min-h-screen flex w-full bg-gray-50">
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </SidebarProvider>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LayoutContent>{children}</LayoutContent>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
