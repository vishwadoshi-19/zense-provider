import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import JobList from "@/components/dashboard/JobList";
import { Job, Staff } from "@/types";
import { Job2 } from "@/types/jobs";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { set } from "date-fns";

const JobsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobList, setJobList] = useState<Job2[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [fetchingStaff, setFetchingStaff] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch jobs from Firestore
  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        setFetchingJobs(true);
        console.log("Fetching jobs...");
        setDataLoading(true);
        const querySnapshot = await getDocs(collection(db, "jobs"));

        // querySnapshot.forEach((doc) => {
        //   console.log("jobs document data:", doc.id);
        // });

        const jobs: Job2[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Job2[];
        // Convert Firestore Timestamps to JavaScript Date objects

        setJobList(jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setDataLoading(false);
        setFetchingJobs(false);
        console.log("Job list state:", jobList);
      }
    };

    if (user) {
      fetchJobs();
    }
  }, [user]);

  // Fetch staff from Firestore
  React.useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffCollectionRef = collection(db, "users");
        const q = query(
          staffCollectionRef
          // Use the hardcoded providerId
        );
        const querySnapshot = await getDocs(q);

        const fetchedStaff: any[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            phone: data.phone,
            providerId: data.providerId,
            status: data.status,
            name: data.name,
            type: data.type,
            contactNumber: data.contactNumber,
            email: data.email,
            address: data.address,
            experience: data.experience,
            availability: data.availability,
            currentAssignment: data.currentAssignment || null,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(), // Handle potential non-Timestamp data
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : new Date(), // Handle potential non-Timestamp data
            isActive: data.isActive ?? false, // Default value for isActive
            aadharVerified: data.aadharVerified ?? false, // Default value for aadharVerified
            policeVerified: data.policeVerified ?? false, // Default value for policeVerified
          };
        });
        setStaffList(fetchedStaff);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setFetchingStaff(false);
        console.log("Staff list state:", staffList);
      }
    };

    if (user) {
      fetchStaff();
    }
  }, [user]);

  const handleAddJob = () => {
    router.push("/jobs/add");
  };

  const handleEditJob = (job: Job2) => {
    console.log("Edit job clicked", job);
    console.log("Job ID:", job.id);
    router.push(`/jobs/edit/${job.id}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      // Delete job from Firestore
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this job?"
      );
      if (!confirmDelete) {
        return; // Exit if user cancels
      }

      await deleteDoc(doc(db, "jobs", jobId));
      console.log("Job successfully deleted:", jobId);

      // Update local state to remove the deleted job
      setJobList(jobList.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const handleAssignStaff = async (staffId: string, jobId: string) => {
    try {
      const response = await fetch("/api/jobs/assignStaff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ staffId, jobId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign staff: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.message);

      // Update the job list state to reflect the assignment
      setJobList((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, staffId: staffId, status: "assigned" }
            : job
        )
      );
    } catch (error) {
      console.error("Error assigning staff to job:", error);
    }
  };

  if (loading || fetchingJobs || fetchingStaff || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Or a message indicating redirection
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
          staffList={staffList} // Pass staffList here
          onAddJob={handleAddJob}
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJob}
          onStaffAssigned={handleAssignStaff} // Renamed prop to onStaffAssigned
        />
      </div>
    </Layout>
  );
};

export default JobsPage;
