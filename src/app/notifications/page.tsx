import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import axiosInstance from "@/components/apiconfig/axios";
import { API_URLS } from "@/components/apiconfig/api_urls";

interface Reminder {
  id: number;
  title: string;
  description: string;
  reminder_date: string;
  created_at: string;
  updated_at: string;
  user_id: number;
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
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return "Yesterday";
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  return formatDate(dateStr);
}

const NotificationCard = ({ reminder }: { reminder: Reminder }) => {
  const isOverdue = new Date(reminder.reminder_date) < new Date();
  
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${
      isOverdue ? 'border-red-400' : 'border-green-500'
    } p-6 mb-4 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Bell className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed">{reminder.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="text-green-600">
              <span>{getRelativeTime(reminder.reminder_date)}</span>
            </div>
            
            <div className="text-gray-500">
              <span>{formatDate(reminder.reminder_date)}</span>
            </div>
          </div>
        </div>
        
        <div className={`w-3 h-3 rounded-full ${
          isOverdue ? 'bg-red-400' : 'bg-green-500'
        } animate-pulse`}></div>
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
      
      const response = await axiosInstance.get(API_URLS.NOTIFICATIONS.GET_NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.data?.code === 200) {
        // Map string reminders to objects if needed
        const reminders = (response.data.reminders || []).map((item: any, idx: number) =>
          typeof item === "string"
            ? { id: idx, title: item, description: "", reminder_date: new Date().toISOString() }
            : item
        );
        setAllReminders(reminders);
        setFilteredReminders(reminders);
      } else {
        setAllReminders([]);
        setFilteredReminders([]);
      }
    } catch (error) {
      setAllReminders([]);
      setFilteredReminders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reminders based on search term
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    if (!value.trim()) {
      setFilteredReminders(allReminders);
    } else {
      const filtered = allReminders.filter(reminder =>
        reminder.title.toLowerCase().includes(value.toLowerCase()) ||
        reminder.description.toLowerCase().includes(value.toLowerCase())
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

  console.log(allReminders);
  

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: 'white' }}>
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
            <p className="text-gray-600">View your reminders</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-green-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                style={{ borderColor: '#10B981', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#10B981'}
              />
            </div>
          </div>

          {/* Notifications List */}
          <Card style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
            <CardHeader style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
              <CardTitle className="text-lg flex items-center" style={{ color: '#10B981' }}>
                <Bell className="w-5 h-5 mr-2" />
                Your Reminders
                {searchTerm && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({filteredReminders.length} found)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ backgroundColor: 'white', padding: '1.5rem' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                  <span className="text-gray-600">Loading your reminders...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedReminders.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">
                        {searchTerm ? "No reminders found" : "No reminders available"}
                      </p>
                      <p className="text-gray-400">
                        {searchTerm ? "Try adjusting your search terms" : "You're all caught up!"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4">
                        {paginatedReminders.map((reminder) => (
                          <NotificationCard key={reminder.id} reminder={reminder} />
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          {[...Array(totalPages)].map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => handlePageChange(idx + 1)}
                              className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
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