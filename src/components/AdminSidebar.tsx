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
    Database
  } from "lucide-react"
  import { Link, useLocation } from "react-router-dom"
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
  } from "@/components/ui/sidebar"
  
  const navigationItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
    },
    {
      title: "All Enquiries",
      url: "/admin/enquiries",
      icon: Target,
    },
    {
      title: "Telecallers",
      url: "/admin/telecallers",
      icon: Users,
    },
    {
      title: "Job Management",
      url: "/admin/jobs",
      icon: Building,
    },
    {
      title: "Walk-in Management",
      url: "/admin/walk-ins",
      icon: Mail,
    },
    {
      title: "Follow-up Reports",
      url: "/admin/follow-ups",
      icon: Calendar,
    },
    {
      title: "Call Analytics",
      url: "/admin/call-analytics",
      icon: Phone,
    },
    {
      title: "Performance Reports",
      url: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ]
  
  const quickActions = [
    {
      title: "Add Telecaller",
      url: "/admin/telecallers/new",
      icon: UserPlus,
    },
    {
      title: "System Health",
      url: "/admin/system",
      icon: Activity,
    },
    {
      title: "Database",
      url: "/admin/database",
      icon: Database,
    },
  ]
  
  export function AdminSidebar() {
    const location = useLocation();
  
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
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full">
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
          </SidebarGroup>
  
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full">
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
          </SidebarGroup>
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
  