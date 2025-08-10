import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Trash2, Crown, LogOut } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    weeklyReports: true,
  });

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

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSaveProfile = () => {
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Success",
      description: "Notification preferences updated",
    });
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account Deletion",
        description: "Account deletion is not implemented in this demo",
        variant: "destructive",
      });
    }
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
              <h2 className="text-2xl font-bold text-gray-900 flex items-center" data-testid="text-settings-title">
                <SettingsIcon className="w-8 h-8 mr-3 text-primary" />
                Settings
              </h2>
              <p className="text-gray-600 text-sm">Manage your account preferences and settings</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-300">
                      <img 
                        src={user?.profileImageUrl || "https://via.placeholder.com/80"} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        data-testid="img-profile-avatar"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Profile Picture</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} data-testid="button-save-profile">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, pushNotifications: checked })
                      }
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-500">Receive promotional and marketing emails</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, marketingEmails: checked })
                      }
                      data-testid="switch-marketing-emails"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-gray-500">Receive weekly analytics summaries</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weeklyReports: checked })
                      }
                      data-testid="switch-weekly-reports"
                    />
                  </div>

                  <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Authentication Method</p>
                        <p className="text-sm text-gray-500">Currently using biometric authentication</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Secure
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Session Management</p>
                        <p className="text-sm text-gray-500">Manage active sessions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Sessions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Billing & Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Crown className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">
                            {user?.plan === 'premium' ? 'Premium Plan' : 'Free Plan'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {user?.plan === 'premium' 
                              ? 'Unlimited features and priority support'
                              : 'Limited features, upgrade for more'
                            }
                          </p>
                        </div>
                      </div>
                      {user?.plan !== 'premium' && (
                        <Button data-testid="button-upgrade-plan">
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-gray-500">**** **** **** 4242</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Billing History</p>
                        <p className="text-sm text-gray-500">View past invoices and receipts</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Logout Section */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-gray-500">Sign out of your account on this device</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
