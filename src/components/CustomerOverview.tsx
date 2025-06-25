
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Phone, Mail, Eye } from "lucide-react"

const customers = [
  {
    id: 1,
    name: "Acme Corporation",
    contact: "Sarah Johnson",
    email: "sarah@acme.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    value: "$12,500",
    lastContact: "2 days ago"
  },
  {
    id: 2,
    name: "TechStart Inc.",
    contact: "Mike Chen",
    email: "mike@techstart.com",
    phone: "+1 (555) 234-5678",
    status: "Prospect",
    value: "$8,200",
    lastContact: "1 week ago"
  },
  {
    id: 3,
    name: "Global Systems",
    contact: "Emma Davis",
    email: "emma@globalsys.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    value: "$25,000",
    lastContact: "Yesterday"
  },
  {
    id: 4,
    name: "Innovation Labs",
    contact: "Robert Kim",
    email: "robert@innovlabs.com",
    phone: "+1 (555) 456-7890",
    status: "Lead",
    value: "$5,800",
    lastContact: "3 days ago"
  }
]

export function CustomerOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">Customer Overview</CardTitle>
          <CardDescription>Recent customers and prospects</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  <Badge variant={
                    customer.status === "Active" ? "default" :
                    customer.status === "Prospect" ? "secondary" :
                    "outline"
                  }>
                    {customer.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{customer.contact}</span>
                  <span>•</span>
                  <span>{customer.value}</span>
                  <span>•</span>
                  <span>Last contact: {customer.lastContact}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
