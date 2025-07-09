import { Search, Bell, Settings, User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useState as useStateReact } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

export function DashboardHeader() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userName, setUserName] = useStateReact("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let name = "User";
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.role === "Admin") {
            name = "Admin";
          } else if (parsed.role === "Telecaller" && parsed.telecaller && parsed.telecaller.name) {
            name = parsed.telecaller.name;
          }
        }
      } catch (e) {
        // fallback to default
      }
    }
    setUserName(name);
  }, []);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    // Remove items from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Set boolean values to false instead of removing
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8" />
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          {/* <p className="text-sm text-gray-500 ml-0 sm:ml-2">Welcome back! Here's what's happening today.</p> */}
        </div>

        <div className="flex flex-row items-center justify-end gap-4 w-full">
          {/* Notification Icon */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-gray-700" />
          </button>
          {/* User Dropdown */}
          <DropdownMenu onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none">
                <User className="h-5 w-5 text-gray-700" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[120px]">{userName}</span>
                <ChevronDown className={`h-4 w-4 text-gray-700 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowConfirm(true)} className="text-red-600 focus:bg-red-100">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Confirm Alert inside Dropdown */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-full">
            <p className="text-gray-900 text-base mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
