import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import JobList from "@/components/dashboard/JobList";
import { Job, Staff } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

const JobsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobList, setJobList] = useState<Job[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [fetchingStaff, setFetchingStaff] = useState(true);

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
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobs: Job[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any;
        console.log("Fetched jobs:", jobs);
        setJobList(jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setFetchingJobs(false);
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
          staffCollectionRef,
          where("providerId", "==", "zense") // Use the hardcoded providerId
        );
        const querySnapshot = await getDocs(q);
        const fetchedStaff: Staff[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            providerId: data.providerId,
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
          };
        });
        setStaffList(fetchedStaff);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setFetchingStaff(false);
      }
    };

    if (user) {
      fetchStaff();
    }
  }, [user]);

  const handleAddJob = () => {
    router.push("/jobs/add");
  };

  const handleEditJob = (job: Job) => {
    router.push(`/jobs/edit/${job.id}`);
  };

  const handleDeleteJob = async (jobId: string) => {
    // TODO: Implement actual Firestore delete logic
    console.log("Delete job clicked", jobId);
    setJobList(jobList.filter((job) => job.id !== jobId));
  };

  const handleAssignStaff = async (staffId: string, jobId: string) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        staffId: staffId,
        status: "assigned", // Changed from "Assigned" to "assigned"
      });
      console.log(`Job ${jobId} assigned to staff ${staffId}`);
      // Update the job list state to reflect the assignment
      setJobList((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, staffId: staffId, status: "assigned" } // Changed from "Assigned" to "assigned"
            : job
        )
      );
      // Optionally update staff's currentAssignment
      const staffRef = doc(db, "users", staffId);
      await updateDoc(staffRef, {
        currentAssignment: jobId,
      });
      console.log(`Staff ${staffId} current assignment updated to ${jobId}`);
    } catch (error) {
      console.error("Error assigning staff to job:", error);
    }
  };

  if (loading || fetchingJobs || fetchingStaff) {
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
