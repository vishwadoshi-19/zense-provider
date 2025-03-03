import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import JobList from "@/components/dashboard/JobList";
import { Job } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Mock data for jobs
const mockJobData: Job[] = [
  {
    id: "job1",
    providerId: "provider1",
    customerId: "customer1",
    staffId: "2",
    patientName: "Abhay Tyagi",
    patientAge: 65,
    patientGender: "Male",
    serviceType: "Nurse",
    shiftType: "24 Hour",
    address: "123 Main St, City",
    startDate: new Date("2025-03-01"),
    endDate: null,
    status: "In Progress",
    notes: "Patient requires regular medication and assistance with mobility",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "job2",
    providerId: "provider1",
    customerId: "customer2",
    staffId: "3",
    patientName: "Animesh Solanki",
    patientAge: 72,
    patientGender: "Male",
    serviceType: "Semi-Nurse",
    shiftType: "12 Hour",
    address: "456 Oak St, City",
    startDate: new Date("2025-03-05"),
    endDate: null,
    status: "In Progress",
    notes: "Post-surgery care needed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "job3",
    providerId: "provider1",
    customerId: "customer3",
    staffId: "5",
    patientName: "Shankar Roy",
    patientAge: 58,
    patientGender: "Male",
    serviceType: "Nurse",
    shiftType: "6 Hour",
    address: "789 Pine St, City",
    startDate: new Date("2025-03-10"),
    endDate: null,
    status: "In Progress",
    notes: "Diabetic patient requiring insulin administration",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "job4",
    providerId: "provider1",
    customerId: "customer4",
    staffId: null,
    patientName: "Manisha Jain",
    patientAge: 80,
    patientGender: "Female",
    serviceType: "Attendant",
    shiftType: "24 Hour",
    address: "101 Elm St, City",
    startDate: new Date("2025-03-15"),
    endDate: null,
    status: "Pending",
    notes: "Elderly patient requiring general assistance",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "job5",
    providerId: "provider1",
    customerId: "customer5",
    staffId: null,
    patientName: "Maithili Shukla",
    patientAge: 45,
    patientGender: "Female",
    serviceType: "Attendant",
    shiftType: "12 Hour",
    address: "202 Cedar St, City",
    startDate: new Date("2025-03-20"),
    endDate: null,
    status: "Pending",
    notes: "Patient recovering from hip replacement",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const JobsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobList, setJobList] = useState<Job[]>(mockJobData);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleAddJob = () => {
    // Implement add job functionality
    console.log("Add job clicked");
  };

  const handleEditJob = (job: Job) => {
    // Implement edit job functionality
    console.log("Edit job clicked", job);
  };

  const handleDeleteJob = (jobId: string) => {
    // Implement delete job functionality
    console.log("Delete job clicked", jobId);
    setJobList(jobList.filter((job) => job.id !== jobId));
  };

  const handleAssignStaff = (job: Job) => {
    // Implement assign staff functionality
    console.log("Assign staff clicked", job);
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
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <p className="text-gray-500 mt-1">
            View, assign, and manage customer job requests
          </p>
        </div>

        <JobList
          jobList={jobList}
          onAddJob={handleAddJob}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJob}
          onAssignStaff={handleAssignStaff}
        />
      </div>
    </Layout>
  );
};

export default JobsPage;
