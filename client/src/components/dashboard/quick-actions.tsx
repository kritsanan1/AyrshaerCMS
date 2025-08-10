import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, Upload, ShoppingBag, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      name: "New Article",
      description: "Create a new article",
      href: "/articles",
      icon: Plus,
      testId: "action-new-article"
    },
    {
      name: "Upload Media",
      description: "Add files to library",
      href: "/media",
      icon: Upload,
      testId: "action-upload-media"
    },
    {
      name: "Add Product",
      description: "Create new product",
      href: "/products",
      icon: ShoppingBag,
      testId: "action-add-product"
    },
    {
      name: "Analytics",
      description: "View performance",
      href: "/analytics",
      icon: BarChart3,
      testId: "action-view-analytics"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Link key={action.name} href={action.href}>
                <a 
                  className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group block"
                  data-testid={action.testId}
                >
                  <div className="text-center">
                    <Icon className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 group-hover:text-primary">
                      {action.name}
                    </p>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
