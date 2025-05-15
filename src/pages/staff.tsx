import React, { useState, useEffect, use } from "react";
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
  // useEffect(() => {
  //   const fetchStaff = async () => {
  //     console.log("Fetching staff...");
  //     if (user) {
  //       try {
  //         const staffCollectionRef = collection(db, "users");
  //         // Query all documents in the users collection
  //         const q = query(staffCollectionRef);
  //         console.log("Firestore query:", q);
  //         const querySnapshot = await getDocs(q);
  //         console.log("Query snapshot size:", querySnapshot.size);
  //         const fetchedStaff: Staff[] = querySnapshot.docs.map((doc) => {
  //           const data = doc.data();
  //           console.log("Fetched staff data:", data);
  //           return {
  //             id: doc.id,
  //             providerId: data.providerId || "",
  //             name: data.name || "",
  //             type: data.jobRole || "attendant",
  //             contactNumber: data.phone || "",
  //             email: data.email || "",
  //             address: data.address || "",
  //             experience: data.experienceYears || 0,
  //             availability: Array.isArray(data.availability)
  //               ? data.availability
  //               : [],
  //             currentAssignment: data.currentAssignment || null,
  //             createdAt: data.createdAt
  //               ? (data.createdAt as Timestamp).toDate()
  //               : new Date(),
  //             updatedAt: data.updatedAt
  //               ? (data.updatedAt as Timestamp).toDate()
  //               : new Date(),
  //             isActive: data.isActive || false,
  //             aadharVerified: data.aadharVerified || false,
  //             policeVerified: data.policeVerified || false,
  //           };
  //         });
  //         setStaffList(fetchedStaff);
  //         console.log("Staff list updated:", fetchedStaff);
  //       } catch (error) {
  //         console.error("Error fetching staff:", error);
  //         // Optionally set an error state
  //       } finally {
  //         setDataLoading(false);
  //         console.log("Data loading set to false.");
  //       }
  //     } else {
  //       console.log("User is not logged in.");
  //       setDataLoading(false); // Set loading to false if no user is logged in
  //       console.log("Data loading set to false (no user).");
  //     }
  //   };

  //   // Fetch staff only when user is available
  //   if (user) {
  //     fetchStaff();
  //   } else {
  //     // If user is not available and authLoading is false, it means the user is not logged in
  //     if (!authLoading) {
  //       setDataLoading(false);
  //       console.log(
  //         "Data loading set to false (user not available and not auth loading)."
  //       );
  //     }
  //   }
  // }, [user, authLoading, router]); // Keep authLoading in dependencies to handle initial loading state

  // Fetch staff data from API when user is available
  useEffect(() => {
    const fetchStaff = async () => {
      console.log("Fetching staff from API...");
      if (user) {
        try {
          setDataLoading(true);
          // Use the API endpoint instead of direct Firestore queries
          const response = await fetch("/api/getStaff", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Include auth token if needed
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          });

          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`
            );
          }

          const data = await response.json();
          console.log("Staff data fetched from API:", data);

          // Transform the API response to match the Staff type
          const fetchedStaff: any = data.map((staff: any) => ({
            id: staff.id,
            name: staff.name,
            gender: staff.gender,
            phone: staff.phone,

            providerId: staff.providerId,
            status: staff.status || "unregistered",
            jobRole: staff.jobRole || "",
            maritalStatus: staff.maritalStatus || "",
            dateOfBirth: staff.dateOfBirth || "",
            religion: staff.religion || "",
            currentAdress: staff.currentAddress || {},
            permanentAddress: staff.permanentAddress || {},
            isCurrentAddressSameAsPermanent:
              staff.isCurrentAddressSameAsPermanent,
            isActive: staff.isActive || false,
            aadharVerified: staff.aadharVerified || false,
            policeVerified: staff.policeVerified || false,
            bankDetails: staff.bankDetails || {},
            availability: staff.availability || [],
            tempAvailability: staff.tempAvailability,
            expectedWages: staff.expectedWages || {
              "5hrs": 0,
              "12hrs": 0,
              "24hrs": 0,
            },
            educationQualification: staff.educationQualification || "",
            educationCertificate: staff.educationCertificate || "",
            experienceYears: staff.experienceYears || 0,
            languagesKnown: staff.languagesKnown || [],
            preferredShifts: staff.preferredShifts || [],
            extraServicesOffered: staff.extraServicesOffered || [],
            foodPreference: staff.foodPreference || "",
            smokes: staff.smokes || "",
            carryOwnFood12hrs: staff.carryOwnFood12hrs || "",
            additionalInfo: staff.additionalInfo || "",
            selfTestimonial: staff.selfTestimonial || null,
            profilePhoto: staff.profilePhoto || "",
            identityDocuments: staff.identityDocuments || {
              aadharFront: "",
              aadharBack: "",
              panDocument: "",
              aadharNumber: "",
              panNumber: "",
            },
            district: staff.district || [],
            subDistricts: staff.subDistricts || [],
            services: staff.services || {},
          }));

          setStaffList(fetchedStaff);
          console.log("Staff list updated:", fetchedStaff);
        } catch (error) {
          console.error("Error fetching staff from API:", error);
        } finally {
          setDataLoading(false);
        }
      } else {
        console.log("User is not logged in.");
        setDataLoading(false);
      }
    };

    // Fetch staff only when user is available
    if (user && !authLoading) {
      fetchStaff();
    } else if (!authLoading) {
      setDataLoading(false);
      console.log(
        "Data loading set to false (user not available and not auth loading)."
      );
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
