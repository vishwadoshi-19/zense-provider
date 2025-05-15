import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Staff } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

// Mock data for staff (reusing from staff.tsx)
const mockStaffData: any[] = [
  {
    id: "1",
    providerId: "provider1",
    name: "Kallu Mama",
    type: "Attendant",
    contactNumber: "9876543210",
    email: "john@example.com",
    address: "123 Main St, City",
    experience: "3",
    availability: true,
    currentAssignment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    providerId: "provider1",
    name: "Meenakshi",
    type: "Nurse",
    contactNumber: "9876543211",
    email: "jane@example.com",
    address: "456 Oak St, City",
    experience: "5",
    availability: true,
    currentAssignment: "job1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    providerId: "provider1",
    name: "Ramesh",
    type: "Semi-Nurse",
    contactNumber: "9876543212",
    email: "robert@example.com",
    address: "789 Pine St, City",
    experience: "2",
    availability: false,
    currentAssignment: "job2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    providerId: "provider1",
    name: "Suresh",
    type: "Attendant",
    contactNumber: "9876543213",
    email: "sarah@example.com",
    address: "101 Elm St, City",
    experience: "1",
    availability: true,
    currentAssignment: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    providerId: "provider1",
    name: "Manju",
    type: "Nurse",
    contactNumber: "9876543214",
    email: "michael@example.com",
    address: "202 Cedar St, City",
    experience: "7",
    availability: false,
    currentAssignment: "job3",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const AvailabilityPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staffList, setStaffList] = useState<any[]>(mockStaffData);
  const [selectedDate] = useState<Date>(new Date());

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const toggleAvailability = (staffId: string) => {
    const updatedStaffList = staffList.map((staff) => {
      if (staff.id === staffId) {
        return {
          ...staff,
          availability: !staff.availability,
          updatedAt: new Date(),
        };
      }
      return staff;
    });
    setStaffList(updatedStaffList);
  };

  // Group staff by type
  const attendants = staffList.filter((staff) => staff.type === "Attendant");
  const nurses = staffList.filter((staff) => staff.type === "Nurse");

  // Calculate availability percentages
  const calculateAvailability = (staffArray: Staff[]) => {
    if (staffArray.length === 0) return 0;
    const availableCount = staffArray.filter(
      (staff) => staff.availability
    ).length;
    return Math.round((availableCount / staffArray.length) * 100);
  };

  const attendantAvailability = calculateAvailability(attendants);
  const nurseAvailability = calculateAvailability(nurses);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Track Availability</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage staff availability
          </p>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-md shadow">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <Button variant="outline" size="sm">
            Change Date
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Attendants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {attendants.filter((a) => a.availability).length} of{" "}
                  {attendants.length} available
                </div>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${attendantAvailability}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {attendantAvailability}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {attendants.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-xs text-gray-500">
                        {staff.contactNumber}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAvailability(staff.id)}
                      className={
                        staff.availability ? "text-green-600" : "text-red-600"
                      }
                    >
                      {staff.availability ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Nurses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {nurses.filter((n) => n.availability).length} of{" "}
                  {nurses.length} available
                </div>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${nurseAvailability}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {nurseAvailability}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {nurses.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-xs text-gray-500">
                        {staff.contactNumber}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAvailability(staff.id)}
                      className={
                        staff.availability ? "text-green-600" : "text-red-600"
                      }
                    >
                      {staff.availability ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Semi-Nurses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {semiNurses.filter((s) => s.availability).length} of{" "}
                  {semiNurses.length} available
                </div>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div
                      className="bg-green-500 h-full"
                      style={{ width: `${semiNurseAvailability}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {semiNurseAvailability}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {semiNurses.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-xs text-gray-500">
                        {staff.contactNumber}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAvailability(staff.id)}
                      className={
                        staff.availability ? "text-green-600" : "text-red-600"
                      }
                    >
                      {staff.availability ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Availability Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium">Meenakshi (Nurse)</div>
                    <div className="text-sm text-gray-600">
                      Will be unavailable from March 15 to March 20
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-100">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-medium">Ramesh (Semi-Nurse)</div>
                    <div className="text-sm text-gray-600">
                      Will be available from March 12
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border border-yellow-100">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <div className="font-medium">Manju (Nurse)</div>
                    <div className="text-sm text-gray-600">
                      Current assignment ends on March 18
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AvailabilityPage;
