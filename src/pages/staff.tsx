import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import StaffList from "@/components/dashboard/StaffList";
import { Staff } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Mock data for staff
const mockStaffData: Staff[] = [
  {
    id: "1",
    providerId: "provider1",
    name: "Kallu Mama",
    type: "Attendant",
    contactNumber: "9876543210",
    email: "john@example.com",
    address: "123 Main St, City",
    experience: 3,
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
    experience: 5,
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
    experience: 2,
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
    experience: 1,
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
    experience: 7,
    availability: false,
    currentAssignment: "job3",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const StaffPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>(mockStaffData);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleAddStaff = () => {
    // Implement add staff functionality
    console.log("Add staff clicked");
  };

  const handleEditStaff = (staff: Staff) => {
    // Implement edit staff functionality
    console.log("Edit staff clicked", staff);
  };

  const handleDeleteStaff = (staffId: string) => {
    // Implement delete staff functionality
    console.log("Delete staff clicked", staffId);
    setStaffList(staffList.filter((staff) => staff.id !== staffId));
  };

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
          <h1 className="text-3xl font-bold">Manage Staff</h1>
          <p className="text-gray-500 mt-1">
            Add, edit, and manage your staff members
          </p>
        </div>

        <StaffList
          staffList={staffList}
          onAddStaff={handleAddStaff}
          onEditStaff={handleEditStaff}
          onDeleteStaff={handleDeleteStaff}
        />
      </div>
    </Layout>
  );
};

export default StaffPage;
