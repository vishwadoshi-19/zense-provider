import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";

const ProfilePage = () => {
  const { user, loading, providerData } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock provider data if not available
  const provider = providerData || {
    id: "provider1",
    businessName: "Healthcare Solutions",
    ownerName: "John Smith",
    yearsInBusiness: 5,
    address: "123 Main Street, City, State, 12345",
    contactNumber: "9876543210",
    emergencyContact: "9876543211",
    email: "contact@healthcaresolutions.com",
    panNumber: "ABCDE1234F",
    gstNumber: "22AAAAA0000A1Z5",
    businessHours: "Mon-Fri: 9 AM - 6 PM",
    serviceCities: ["Mumbai", "Delhi", "Bangalore"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Provider Profile</h1>
          <p className="text-gray-500 mt-1">
            View and update your business information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="businessName"
                        className="text-sm font-medium flex items-center"
                      >
                        <Building className="h-4 w-4 mr-1" />
                        Business Name
                      </label>
                      <Input
                        id="businessName"
                        defaultValue={provider.businessName || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="ownerName"
                        className="text-sm font-medium flex items-center"
                      >
                        <User className="h-4 w-4 mr-1" />
                        Owner Name
                      </label>
                      <Input
                        id="ownerName"
                        defaultValue={provider.ownerName || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Business Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={provider.email || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="contactNumber"
                        className="text-sm font-medium flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Contact Number
                      </label>
                      <Input
                        id="contactNumber"
                        defaultValue={provider.contactNumber || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="emergencyContact"
                        className="text-sm font-medium flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Emergency Contact
                      </label>
                      <Input
                        id="emergencyContact"
                        defaultValue={provider.emergencyContact || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="yearsInBusiness"
                        className="text-sm font-medium flex items-center"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Years in Business
                      </label>
                      <Input
                        id="yearsInBusiness"
                        type="number"
                        defaultValue={
                          provider.yearsInBusiness
                            ? provider.yearsInBusiness.toString()
                            : "0"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="address"
                      className="text-sm font-medium flex items-center"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Business Address
                    </label>
                    <Input id="address" defaultValue={provider.address || ""} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="panNumber"
                        className="text-sm font-medium flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        PAN Number
                      </label>
                      <Input
                        id="panNumber"
                        defaultValue={provider.panNumber || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="gstNumber"
                        className="text-sm font-medium flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        GST Number
                      </label>
                      <Input
                        id="gstNumber"
                        defaultValue={provider.gstNumber || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="businessHours"
                        className="text-sm font-medium flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Business Hours
                      </label>
                      <Input
                        id="businessHours"
                        defaultValue={provider.businessHours || ""}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit">Update Profile</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(provider.serviceCities)
                      ? provider.serviceCities.map((city, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {city}
                            <button className="ml-2 text-gray-500 hover:text-red-500">
                              &times;
                            </button>
                          </div>
                        ))
                      : null}
                  </div>

                  <div className="flex gap-2">
                    <Input placeholder="Add a city..." className="max-w-xs" />
                    <Button variant="outline">Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="currentPassword"
                      className="text-sm font-medium"
                    >
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="text-sm font-medium"
                    >
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <Button className="w-full">Update Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-700">
                        Account Active
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Your provider account is active and in good standing.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium text-blue-700">
                        Member Since
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      {new Date(
                        provider.createdAt || new Date()
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
