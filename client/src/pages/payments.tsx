import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Payments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
    enabled: !!isAuthenticated,
  });

  const { data: revenueStats } = useQuery({
    queryKey: ["/api/payments/revenue-stats"],
    enabled: !!isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Succeeded
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center" data-testid="text-payments-title">
                <CreditCard className="w-8 h-8 mr-3 text-primary" />
                Payments
              </h2>
              <p className="text-gray-600 text-sm">Track your revenue and payment history</p>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fab fa-stripe text-primary text-xl"></i>
              <span className="text-sm text-gray-600">Stripe Connected</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-month-revenue">
                      {formatCurrency(revenueStats?.thisMonth || 0)}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {revenueStats?.thisMonth && revenueStats?.lastMonth 
                        ? `${revenueStats.thisMonth > revenueStats.lastMonth ? '+' : ''}${Math.round(((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth) * 100)}%`
                        : '0%'} from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Month</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-last-month-revenue">
                      {formatCurrency(revenueStats?.lastMonth || 0)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Previous period</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-total-transactions">
                      {revenueStats?.totalTransactions || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-purple-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      data-testid={`payment-${payment.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {payment.description || "Payment"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleString()}
                          </p>
                          {payment.stripePaymentIntentId && (
                            <p className="text-xs text-gray-400 font-mono">
                              {payment.stripePaymentIntentId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-500">
                    Payment transactions will appear here once you start selling products
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <i className="fab fa-stripe text-blue-600 text-2xl"></i>
                    <div>
                      <p className="font-medium">Stripe Integration</p>
                      <p className="text-sm text-gray-500">Payment processing enabled</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Processing Fees</p>
                    <p className="text-sm text-gray-500">Standard Stripe rates apply</p>
                  </div>
                  <span className="text-sm font-medium">2.9% + 30¢</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Payout Schedule</p>
                    <p className="text-sm text-gray-500">Automatic daily payouts</p>
                  </div>
                  <Badge variant="outline">Daily</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
