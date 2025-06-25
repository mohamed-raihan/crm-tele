
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, Calendar, User, FileText } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "call",
    title: "Called John Smith",
    description: "Discussed renewal options for enterprise plan",
    time: "2 hours ago",
    icon: Phone,
    status: "completed"
  },
  {
    id: 2,
    type: "email",
    title: "Sent proposal to Acme Corp",
    description: "Custom integration proposal for Q1 2024",
    time: "4 hours ago",
    icon: Mail,
    status: "sent"
  },
  {
    id: 3,
    type: "meeting",
    title: "Team meeting scheduled",
    description: "Weekly sales review with regional managers",
    time: "1 day ago",
    icon: Calendar,
    status: "scheduled"
  },
  {
    id: 4,
    type: "customer",
    title: "New customer onboarded",
    description: "TechStart Inc. completed setup process",
    time: "2 days ago",
    icon: User,
    status: "completed"
  },
  {
    id: 5,
    type: "document",
    title: "Contract signed",
    description: "Q4 enterprise agreement with Global Systems",
    time: "3 days ago",
    icon: FileText,
    status: "completed"
  }
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
        <CardDescription>Latest updates from your CRM activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${
                activity.status === "completed" ? "bg-green-100" :
                activity.status === "sent" ? "bg-blue-100" :
                activity.status === "scheduled" ? "bg-yellow-100" :
                "bg-gray-100"
              }`}>
                <activity.icon className={`h-4 w-4 ${
                  activity.status === "completed" ? "text-green-600" :
                  activity.status === "sent" ? "text-blue-600" :
                  activity.status === "scheduled" ? "text-yellow-600" :
                  "text-gray-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
