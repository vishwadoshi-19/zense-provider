import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/components/auth/AuthContext";
import Layout from "@/components/common/Layout";
import StaffList from "@/components/dashboard/StaffList";
import { Staff } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

const StaffPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch staff data from Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      console.log("Fetching staff...");
      if (user) {
        try {
          const staffCollectionRef = collection(db, "users");
          const q = query(
            staffCollectionRef,
            where("providerId", "==", "zense") // Use the hardcoded providerId
          );
          console.log("Firestore query:", q);
          const querySnapshot = await getDocs(q);
          console.log("Query snapshot size:", querySnapshot.size);
          const fetchedStaff: Staff[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Fetched staff data:", data);
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
              createdAt: (data.createdAt as Timestamp).toDate(),
              updatedAt: (data.updatedAt as Timestamp).toDate(),
            };
          });
          setStaffList(fetchedStaff);
          console.log("Staff list updated:", fetchedStaff);
        } catch (error) {
          console.error("Error fetching staff:", error);
          // Optionally set an error state
        } finally {
          setDataLoading(false);
          console.log("Data loading set to false.");
        }
      } else {
        console.log("User is not logged in.");
        setDataLoading(false); // Set loading to false if no user is logged in
        console.log("Data loading set to false (no user).");
      }
    };

    // Fetch staff only when user is available
    if (user) {
      fetchStaff();
    } else {
      // If user is not available and authLoading is false, it means the user is not logged in
      if (!authLoading) {
        setDataLoading(false);
        console.log(
          "Data loading set to false (user not available and not auth loading)."
        );
      }
    }
  }, [user, authLoading, router]); // Keep authLoading in dependencies to handle initial loading state

  // Fetch staff data from Firestore when user is available
  useEffect(() => {
    const fetchStaff = async () => {
      console.log("Fetching staff...");
      if (user) {
        console.log("User is logged in:", user.uid);
        try {
          console.log("Creating collection reference...");
          const staffCollectionRef = collection(db, "users");
          console.log("Collection reference created.");
          console.log("Creating query...");
          const q = query(
            staffCollectionRef,
            where("providerId", "==", "zense") // Use the hardcoded providerId
          );
          console.log("Firestore query:", q);
          console.log("Executing query...");
          const querySnapshot = await getDocs(q);
          console.log("Query executed.");
          console.log("Query snapshot size:", querySnapshot.size);
          const fetchedStaff: Staff[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Fetched staff data:", data);
            return {
              id: doc.id,
              providerId: data.providerId,
              name: data.name,
              type: data.jobRole || "attendant",
              contactNumber: data.phone,
              email: data.email,
              address: data.address,
              experience: data.experienceYears,
              availability: data.hasOngoingJob ? false : true,
              currentAssignment: data.currentAssignment || null,
              createdAt: (data.createdAt as Timestamp).toDate(),
              updatedAt: (data.updatedAt as Timestamp).toDate(),
            };
          });
          setStaffList(fetchedStaff);
          console.log("Staff list updated:", fetchedStaff);
        } catch (error) {
          console.error("Error fetching staff:", error);
          // Optionally set an error state
        } finally {
          setDataLoading(false);
          console.log("Data loading set to false.");
        }
      } else {
        console.log("User is not logged in.");
        setDataLoading(false); // Set loading to false if no user is logged in
        console.log("Data loading set to false (no user).");
      }
    };

    if (user) {
      console.log("User available, attempting simple Firestore query test...");
      const testQuery = async () => {
        try {
          const testDocRef = doc(db, "users", "test-doc-id"); // Use a placeholder ID
          console.log("Test document reference created.");
          const testDocSnap = await getDoc(testDocRef);
          if (testDocSnap.exists()) {
            console.log(
              "Simple query successful: Document exists",
              testDocSnap.data()
            );
          } else {
            console.log("Simple query successful: Document does not exist");
          }
        } catch (error) {
          console.error("Simple query failed:", error);
        }
      };
      testQuery();
      console.log("Simple Firestore query test initiated.");

      console.log("User available, calling fetchStaff()...");
      fetchStaff();
    } else {
      // If user is not available and authLoading is false, it means the user is not logged in
      if (!authLoading) {
        setDataLoading(false);
        console.log(
          "Data loading set to false (user not available and not auth loading)."
        );
      }
    }
  }, [user, authLoading]); // Keep authLoading in dependencies to handle initial loading state

  const handleAddStaff = () => {
    router.push("/staff/add");
  };

  const handleEditStaff = (staff: Staff) => {
    // Implement edit staff functionality
    console.log("Edit staff clicked", staff);
    console.log("Staff ID:", staff.id);
    router.push(`/staff/edit/${staff.id}`);
  };

  const handleDeleteStaff = async (staffId: string) => {
    console.log("Delete staff clicked", staffId);
    try {
      // Delete staff from Firestore
      const staffDocRef = doc(db, "users", staffId);
      await deleteDoc(staffDocRef);
      console.log("Staff deleted from Firestore:", staffId);

      // Update local state
      setStaffList(staffList.filter((staff) => staff.id !== staffId));
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  const handleViewStaff = (staffId: string) => {
    router.push(`/staff/${staffId}`);
  };

  if (authLoading || dataLoading) {
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
          onViewStaff={handleViewStaff}
        />
      </div>
    </Layout>
  );
};

export default StaffPage;
