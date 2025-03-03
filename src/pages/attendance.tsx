import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import AttendanceTracker from "@/components/dashboard/AttendanceTracker";
import { Attendance, Staff } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Mock data for staff (reusing from staff.tsx)
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

// Mock data for attendance
const mockAttendanceData: Attendance[] = [
  {
    id: "att1",
    staffId: "1",
    jobId: "",
    date: new Date(),
    clockIn: new Date(new Date().setHours(9, 0, 0)),
    clockOut: null,
    status: "Present",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att2",
    staffId: "2",
    jobId: "job1",
    date: new Date(),
    clockIn: new Date(new Date().setHours(8, 45, 0)),
    clockOut: null,
    status: "Present",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att3",
    staffId: "3",
    jobId: "job2",
    date: new Date(),
    clockIn: new Date(new Date().setHours(10, 15, 0)),
    clockOut: null,
    status: "Late",
    notes: "Traffic delay",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const AttendancePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attendanceList, setAttendanceList] =
    useState<Attendance[]>(mockAttendanceData);
  const [staffList] = useState<Staff[]>(mockStaffData);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleMarkAttendance = (
    staffId: string,
    status: "Present" | "Absent" | "Late"
  ) => {
    // Check if attendance record already exists
    const existingIndex = attendanceList.findIndex(
      (a) =>
        a.staffId === staffId &&
        a.date.toDateString() === new Date().toDateString()
    );

    if (existingIndex >= 0) {
      // Update existing record
      const updatedList = [...attendanceList];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        status,
        updatedAt: new Date(),
      };
      setAttendanceList(updatedList);
    } else {
      // Create new record
      const newAttendance: Attendance = {
        id: `att${attendanceList.length + 1}`,
        staffId,
        jobId: staffList.find((s) => s.id === staffId)?.currentAssignment || "",
        date: new Date(),
        clockIn: status === "Present" ? new Date() : null,
        clockOut: null,
        status,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAttendanceList([...attendanceList, newAttendance]);
    }
  };

  const handleRecordTime = (
    attendanceId: string,
    type: "clockIn" | "clockOut"
  ) => {
    const updatedList = attendanceList.map((attendance) => {
      if (attendance.id === attendanceId) {
        return {
          ...attendance,
          [type]: new Date(),
          updatedAt: new Date(),
        };
      }
      return attendance;
    });
    setAttendanceList(updatedList);
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
          <h1 className="text-3xl font-bold">Track Attendance</h1>
          <p className="text-gray-500 mt-1">
            Monitor staff attendance and work hours
          </p>
        </div>

        <AttendanceTracker
          attendanceList={attendanceList}
          staffList={staffList}
          onMarkAttendance={handleMarkAttendance}
          onRecordTime={handleRecordTime}
        />
      </div>
    </Layout>
  );
};

export default AttendancePage;
