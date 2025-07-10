import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Clock, User, Calendar, AlertCircle } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";

interface Reminder {
  id: number;
  enquiry_name: string;
  reminder_message: string;
  created_at: string;
  enquiry_id: number;
}

interface ApiResponse {
  code: number;
  message: string;
  reminders: Reminder[];
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
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

const NotificationCard = ({
  reminder,
  index,
}: {
  reminder: Reminder;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 border border-gray-200 hover:border-gray-300 p-6 mb-4 transform hover:scale-[1.02] ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Bell className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {reminder.enquiry_name}
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{getRelativeTime(reminder.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-red-500">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-800 font-medium mb-1">Reminder</p>
                <p className="text-gray-600 leading-relaxed">
                  {reminder.reminder_message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(reminder.created_at)}</span>
            </div>

            <div className="flex items-center text-gray-500">
              <span className="font-medium">Enquiry ID:</span>
              <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                #{reminder.enquiry_id}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ${
            isHovered ? "scale-110" : ""
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg"></div>
        </div>
      </div>
    </div>
  );
};

const NotificationPage = () => {
  const [allReminders, setAllReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const remindersPerPage = 10;

  // Fetch reminders from API
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axiosInstance.get(
        API_URLS.NOTIFICATIONS.GET_NOTIFICATIONS,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.code === 200) {
        const reminders = response.data.reminders || [];
        setAllReminders(reminders);
        setFilteredReminders(reminders);

        // Mark notifications as viewed
        localStorage.setItem(
          "last_notification_visit",
          new Date().toISOString()
        );
      } else {
        setAllReminders([]);
        setFilteredReminders([]);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setAllReminders([]);
      setFilteredReminders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reminders based on search term
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (!value.trim()) {
      setFilteredReminders(allReminders);
    } else {
      const filtered = allReminders.filter(
        (reminder) =>
          reminder.enquiry_name.toLowerCase().includes(value.toLowerCase()) ||
          reminder.reminder_message.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredReminders(filtered);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(filteredReminders.length / remindersPerPage);
  const paginatedReminders = filteredReminders.slice(
    (currentPage - 1) * remindersPerPage,
    currentPage * remindersPerPage
  );
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={{ backgroundColor: "white" }}
    >
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Notifications
                </h2>
                <p className="text-gray-600">
                  {allReminders.length > 0
                    ? `You have ${allReminders.length} reminder${
                        allReminders.length > 1 ? "s" : ""
                      } to review`
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-lg transition-all duration-300"
                style={{ borderColor: searchTerm ? "#ef4444" : "#e5e7eb" }}
              />
            </div>
          </div>

          {/* Notifications List */}
          <Card
            style={{ backgroundColor: "white", border: "1px solid #e5e7eb" }}
          >
            <CardHeader
              style={{
                backgroundColor: "white",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <CardTitle
                className="text-lg flex items-center justify-between"
                style={{ color: "#374151" }}
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-500" />
                  Your Reminders
                  {searchTerm && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({filteredReminders.length} found)
                    </span>
                  )}
                </div>
                {allReminders.length > 0 && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {allReminders.length} total
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent
              style={{ backgroundColor: "white", padding: "1.5rem" }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                    <Bell className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-gray-600 mt-4 animate-pulse">
                    Loading your reminders...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedReminders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                          <Bell className="w-12 h-12 text-gray-300" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            0
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xl mb-2 font-medium">
                        {searchTerm
                          ? "No matching reminders found"
                          : "No reminders available"}
                      </p>
                      <p className="text-gray-400">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "You're all caught up! Great job staying on top of things."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4">
                        {paginatedReminders.map((reminder, index) => (
                          <NotificationCard
                            key={reminder.id}
                            reminder={reminder}
                            index={index}
                          />
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                          {[...Array(totalPages)].map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => handlePageChange(idx + 1)}
                              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                currentPage === idx + 1
                                  ? "bg-red-500 text-white shadow-lg transform scale-105"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
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
