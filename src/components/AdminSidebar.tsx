import {
  Users,
  BarChart3,
  Settings,
  Home,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Target,
  Shield,
  Building,
  PieChart,
  Activity,
  Database,
  PhoneMissed,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
    type: "single"
  },
  {
    title: "All Enquiries",
    url: "/admin/enquiries",
    icon: Target,
    type: "single"
  },
  // {
  //   title: "Job List",
  //   icon: Building,
  //   type: "collapsible",
  //   key: "jobList",
  //   basePath: "/admin/jobs",
  //   subItems: [
  //     {
  //       title: "Remaining Jobs",
  //       url: "/admin/jobs",
  //       icon: Activity
  //     },
  //     {
  //       title: "Completed Jobs",
  //       url: "/admin/jobs/completed",
  //       icon: PieChart
  //     }
  //   ]
  // },
  // {
  //   title: "Executive",
  //   url: "/admin/telecallers",
  //   icon: Users,
  //   type: "single"
  // },
  {
    title: "Walk-in List",
    url: "/admin/walk-ins",
    icon: Mail,
    type: "single"
  },
  {
    title: "Follow-up",
    url: "/admin/follow-ups",
    icon: Calendar,
    type: "single"
  },
  // {
  //   title: "Call Register",
  //   url: "/admin/call-analytics",
  //   icon: Phone,
  //   type: "single"
  // },
  {
    title: "Not Answer",
    url: "/admin/not-answer",
    icon: PhoneMissed,
    type: "single"
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: BarChart3,
    type: "single"
  },
  // {
  //   title: "Settings",
  //   url: "/admin/settings",
  //   icon: Settings,
  //   type: "single"
  // },
]

const quickActions = [
  // {
  //   title: "System Health",
  //   url: "/admin/system",
  //   icon: Activity,
  // },
]

const dataManagement = [
  {
    title: "Data Management",
    icon: Building,
    type: "collapsible",
    key: "datamanagement",
    basePath: "/admin/jobs",
    subItems: [
      {
        title: "Branch",
        url: "/admin/branches",
        icon: FileText
      },
      {
        title: "Telecaller",
        url: "/admin/addtelecallers",
        icon: Activity
      },
      {
        title: "Ads",
        url: "/admin/ads",
        icon: Activity
      },
    ]
  },
]

export function AdminSidebar() {
  const location = useLocation();
  
  // State for collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({});
  
  // Toggle collapsible section
  const toggleSection = (key) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Check if a collapsible section is active
  const isCollapsibleSectionActive = (basePath) => {
    return location.pathname.startsWith(basePath);
  };
  
  // Render single navigation item
  const renderSingleItem = (item) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <Link 
          to={item.url}
          className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            location.pathname === item.url
              ? "bg-blue-100 text-blue-900"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  
  // Render collapsible navigation item
  const renderCollapsibleItem = (item) => {
    const isOpen = collapsedSections[item.key];
    const isActive = isCollapsibleSectionActive(item.basePath);
    
    return (
      <SidebarMenuItem key={item.title}>
        <Collapsible open={isOpen} onOpenChange={() => toggleSection(item.key)}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <div className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}>
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                <div className="flex-shrink-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {item.subItems.map((subItem) => (
              <SidebarMenuButton key={subItem.title} asChild>
                <Link
                  to={subItem.url}
                  className={`flex items-center gap-3 pl-8 pr-3 py-2 text-sm rounded-md transition-colors ${
                    location.pathname === subItem.url
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <subItem.icon className="h-3 w-3" />
                  <span>{subItem.title}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">TeleCRM</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                if (item.type === "single") {
                  return renderSingleItem(item);
                } else if (item.type === "collapsible") {
                  return renderCollapsibleItem(item);
                }
                return null;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Data Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {dataManagement.map((item) => {
                if (item.type === "single") {
                  return renderSingleItem(item);
                } else if (item.type === "collapsible") {
                  return renderCollapsibleItem(item);
                }
                return null;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        location.pathname === item.url
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        

      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">System Administrator</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
