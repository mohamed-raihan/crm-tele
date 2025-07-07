import {
  Home,
  Phone,
  Calendar,
  FileText,
  Target,
  UserPlus,
  Settings,
  Headphones,
  Clock,
  CheckCircle,
  PhoneOff,
  Briefcase,
  ChevronDown
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Enquiry",
    url: "/leads",
    icon: Target,
  },
  {
    title: "Calls",
    url: "/calls",
    icon: Phone,
  },
  {
    title: "Walk-in List",
    url: "/walk-in-list",
    icon: Calendar,
  },
  {
    title: "Follow Ups",
    url: "/calls/follow-ups",
    icon: Calendar,
  },
  // {
  //   title: "Follow-ups Management",
  //   url: "/calls/follow-ups",
  //   icon: Calendar,
  // },
  {
    title: "Not Answered",
    url: "/calls/not-answered",
    icon: PhoneOff,
  },
  // {
  //   title: "Call History",
  //   url: "/call-history",
  //   icon: Headphones,
  // },
  // {
  //   title: "My Schedule",
  //   url: "/schedule",
  //   icon: Clock,
  // },
  // {
  //   title: "Completed Calls",
  //   url: "/completed-calls",
  //   icon: CheckCircle,
  // },
  // {
  //   title: "Documents",
  //   url: "/documents",
  //   icon: FileText,
  // },
]

const myJobSubItems = [
  {
    title: "Remaining",
    url: "/my-job/remaining",
    icon: Briefcase,
  },
  {
    title: "Completed",
    url: "/my-job/completed",
    icon: CheckCircle,
  },
];

const quickActions = [
  // {
  //   title: "New Lead",
  //   url: "/leads/new",
  //   icon: UserPlus,
  // },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  // },
]

export function AppSidebar() {
  const location = useLocation();

  // Fetch telecaller name from localStorage
  let telecallerName = "Telecaller";
  if (typeof window !== "undefined") {
    try {
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.telecaller && parsed.telecaller.name) {
          telecallerName = parsed.telecaller.name;
        }
      }
    } catch (e) {
      // fallback to default
    }
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <h1 className="text-lg font-semibold text-gray-900">TeleCRM</h1>
            </div>
            {/* <p className="text-xs text-gray-500">Telecaller Portal</p> */}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            My Work
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.url
                          ? "bg-green-100 text-green-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* My Job Collapsible */}
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors">
                      <Briefcase className="h-4 w-4" />
                      <span>My Job</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {myJobSubItems.map((sub) => (
                      <SidebarMenuButton asChild className="w-full pl-8" key={sub.title}>
                        <Link
                          to={sub.url}
                          className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === sub.url
                              ? "bg-green-100 text-green-900"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                        >
                          <sub.icon className="h-4 w-4" />
                          <span>{sub.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {/* Quick Actions */}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.url
                          ? "bg-green-100 text-green-900"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      {/* <item.icon className="h-4 w-4" />
                      <span>{item.title}</span> */}
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
          <div className="h-8 w-8 rounded-full bg-green-300 flex items-center justify-center">
            <span className="text-sm font-medium text-green-700">TC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{telecallerName}</p>
            <p className="text-xs text-gray-500 truncate">Active</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
