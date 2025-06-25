
import { TrendingUp, TrendingDown, Users, Target, DollarSign, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    title: "Total Customers",
    value: "2,543",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "from last month"
  },
  {
    title: "Active Leads",
    value: "186",
    change: "+8%",
    trend: "up",
    icon: Target,
    description: "conversion rate: 24%"
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "-3%",
    trend: "down",
    icon: DollarSign,
    description: "this month"
  },
  {
    title: "Calls Made",
    value: "1,204",
    change: "+15%",
    trend: "up",
    icon: Phone,
    description: "this week"
  }
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="flex items-center gap-1">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
