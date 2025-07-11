import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Clock, User, Calendar, AlertCircle, ExternalLink, FileText, Users, UserCheck } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";

interface Reminder {
  id: number;
  enquiry_name: string;
  reminder_message: string;
  created_at: string;
  enquiry_id: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  code: number;
  message: string;
  data: Reminder[];
  pagination: PaginationInfo;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateStr);
}

// Function to get user role from localStorage
function getUserRole(): string {
  try {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.role || "";
    }
    return "";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  }
}

// Function to categorize notifications
function categorizeNotification(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("walk-in") || lowerMessage.includes("walkin")) {
    return "walkin";
  }
  if (lowerMessage.includes("follow-up") || lowerMessage.includes("followup") || lowerMessage.includes("follow up")) {
    return "followup";
  }
  return "all";
}

// Function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

const NotificationItem = ({
  reminder,
  index,
}: {
  reminder: Reminder;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const maxLength = 100;
  const shouldTruncate = reminder.reminder_message.length > maxLength;

  const handleViewEnquiry = () => {
    const userRole = getUserRole();
    let profilePath = "";

    if (userRole === "Admin") {
      profilePath = `/leads/profile/${reminder.enquiry_id}`;
    } else if (userRole === "Telecaller") {
      profilePath = `/telecaller-leads/profile/${reminder.enquiry_id}`;
    }

    if (profilePath) {
      navigate(profilePath);
    }
  };

  const getNotificationIcon = () => {
    const category = categorizeNotification(reminder.reminder_message);
    switch (category) {
      case "walkin":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "followup":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 truncate pr-2">
              {reminder.enquiry_name}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {getRelativeTime(reminder.created_at)}
            </span>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {shouldTruncate && !isExpanded
                ? truncateText(reminder.reminder_message, maxLength)
                : reminder.reminder_message
              }
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-800 text-sm ml-1 font-medium"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{formatDate(reminder.created_at)}</span>
                <span className="sm:hidden">{formatDate(reminder.created_at).split(',')[0]}</span>
              </span>
              <span className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                ID: #{reminder.enquiry_id}
              </span>
            </div>

            <Button
              onClick={handleViewEnquiry}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs w-full sm:w-auto"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    walkin: 0,
    followup: 0
  });

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter reminders by category
  const filterRemindersByTab = (reminders: Reminder[], tab: string) => {
    if (tab === "walkin") {
      return reminders.filter(r => /walk[- ]?in/i.test(r.reminder_message));
    }
    if (tab === "followup") {
      return reminders.filter(r => /follow[- ]?up/i.test(r.reminder_message));
    }
    return reminders;
  };

  // Fetch reminders from API with filters
  const fetchReminders = async (page: number = 1, search: string = "", filter: string = "all") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search })
      });

      const response = await axiosInstance.get(
        `${API_URLS.NOTIFICATIONS.GET_NOTIFICATIONS}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.code === 200) {
        let data = response.data.data || [];
        // Sort reminders by created_at descending (latest first)
        data = data.slice().sort((a: Reminder, b: Reminder) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // Filter by tab if not 'all'
        const filteredData = filterRemindersByTab(data, filter);
        const paginationData = {
          total: filteredData.length,
          page: 1,
          limit: 10,
          totalPages: 1
        };
        setReminders(filteredData);
        setPagination(paginationData);
        // Mark notifications as viewed
        localStorage.setItem(
          "last_notification_visit",
          new Date().toISOString()
        );
      } else {
        setReminders([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setReminders([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tab counts
  const fetchTabCounts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      // Fetch all data for accurate counts
      const response = await axiosInstance.get(`${API_URLS.NOTIFICATIONS.GET_NOTIFICATIONS}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = response.data?.data || [];
      const all = data.length;
      const walkin = data.filter((r: Reminder) => /walk[- ]?in/i.test(r.reminder_message)).length;
      const followup = data.filter((r: Reminder) => /follow[- ]?up/i.test(r.reminder_message)).length;
      setTabCounts({
        all,
        walkin,
        followup
      });
    } catch (error) {
      console.error("Error fetching tab counts:", error);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    fetchReminders(1, debouncedSearchTerm, tab);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReminders(page, debouncedSearchTerm, activeTab);
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const totalPages = pagination.totalPages;
    const current = currentPage;

    if (totalPages <= 5) {
      // Show all pages if total pages <= 5
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show first page
      buttons.push(1);

      if (current > 3) {
        buttons.push("...");
      }

      // Show current page and neighbors
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(i);
        }
      }

      if (current < totalPages - 2) {
        buttons.push("...");
      }

      // Show last page
      if (totalPages > 1) {
        buttons.push(totalPages);
      }
    }

    return buttons;
  };

  // Effects
  useEffect(() => {
    fetchReminders(currentPage, debouncedSearchTerm, activeTab);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchReminders();
    fetchTabCounts();
  }, []);

  const tabs = [
    { id: "all", label: "All", count: tabCounts.all, icon: Bell },
    { id: "walkin", label: "Walk-in", count: tabCounts.walkin, icon: Users },
    { id: "followup", label: "Follow-ups", count: tabCounts.followup, icon: UserCheck },
  ];

  const paginationButtons = generatePaginationButtons();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <DashboardHeader />
      <main className="flex-1 p-3 md:p-4 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-3 md:mr-4">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  {pagination.total > 0
                    ? `${pagination.total} notification${pagination.total > 1 ? "s" : ""}`
                    : "No notifications"}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 md:mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg text-sm md:text-base"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 md:mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-1">
              <nav className="flex space-x-1 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`${activeTab === tab.id
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        } flex items-center justify-center px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-0 flex-1 md:flex-none`}
                    >
                      <Icon className="w-4 h-4 mr-1 md:mr-2 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                      <span className={`ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 text-xs rounded-full flex-shrink-0 ${activeTab === tab.id
                        ? "bg-red-400 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Notifications Card */}
          <Card className="w-full">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-16">
                  <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-red-500 mb-4"></div>
                  <span className="text-gray-600 text-sm md:text-base">Loading notifications...</span>
                </div>
              ) : (
                <div>
                  {reminders.length === 0 ? (
                    <div className="text-center py-12 md:py-16">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-base md:text-lg mb-2">
                        {searchTerm
                          ? "No matching notifications found"
                          : `No ${activeTab === "all" ? "" : activeTab} notifications`}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "You're all caught up!"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 md:space-y-4">
                        {reminders.map((reminder, index) => (
                          <NotificationItem
                            key={reminder.id}
                            reminder={reminder}
                            index={index}
                          />
                        ))}
                      </div>

                      {pagination.totalPages > 1 && (
                        <div className="flex flex-col gap-4 mt-6">
                          <div className="text-sm text-gray-600 text-center md:text-left">
                            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} notifications
                          </div>
                          <div className="flex justify-center">
                            <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed border-r border-gray-200"
                              >
                                Prev
                              </button>
                              <div className="flex">
                                {paginationButtons.map((button, index) => (
                                  <React.Fragment key={index}>
                                    {button === "..." ? (
                                      <span className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                                        ...
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handlePageChange(button as number)}
                                        className={`px-4 py-2 text-sm border-r border-gray-200 transition-colors ${
                                          currentPage === button
                                            ? "bg-blue-500 text-white"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                      >
                                        {button}
                                      </button>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                              <button
                                onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;