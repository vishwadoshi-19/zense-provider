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
import { toast } from "@/hooks/use-toast";

const StaffPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

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

  const handleBatchCopy = async () => {
    if (selectedStaffIds.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile to copy.",
        variant: "destructive",
      });
      return;
    }
    const selectedStaff = staffList.filter((s) => selectedStaffIds.includes(s.id));
    const formatProfile = (staff: any, idx: number) => {
      const name = (staff?.name || staff?.fullName || "").trim();
      const age = staff?.dateOfBirth ? (() => {
        const dob = new Date(staff.dateOfBirth);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
      })() : null;
      const gender = staff?.gender ? staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1).toLowerCase() : null;
      const experience = staff?.experienceYears ? `${staff.experienceYears} years` : null;
      let summary = [];
      if (age) summary.push(`• *Age:* ${age}`);
      if (gender) summary.push(`• *Gender:* ${gender}`);
      if (experience) summary.push(`• *Experience:* ${experience}`);
      const summaryText = summary.length > 0 ? summary.join("\n") : "";
      const link = `zense.in/attendant/${staff.id}`;
      return `*${idx + 1}. ${name}*
${summaryText ? summaryText + "\n" : ""}*View Profile:* ${link}`;
    };
    const message = `Hi ,\nPlease find the below profiles :\n\n${selectedStaff.map(formatProfile).join("\n\n")}`;
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Copied!",
        description: "Selected profiles copied in WhatsApp format.",
      });
      setBatchMode(false);
      setSelectedStaffIds([]);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSelectStaff = (id: string) => {
    setSelectedStaffIds((prev) => prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]);
  };
  const handleCancelBatch = () => {
    setBatchMode(false);
    setSelectedStaffIds([]);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Staff</h1>
            <p className="text-gray-500 mt-1">
              Add, edit, and manage your staff members
            </p>
          </div>
          <div>
            {!batchMode ? (
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => setBatchMode(true)}
              >
                Batch Copy
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                  onClick={handleBatchCopy}
                >
                  Copy Selected
                </button>
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={handleCancelBatch}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        <StaffList
          staffList={staffList}
          onAddStaff={handleAddStaff}
          onEditStaff={handleEditStaff}
          onDeleteStaff={handleDeleteStaff}
          onViewStaff={handleViewStaff}
          batchMode={batchMode}
          selectedStaffIds={selectedStaffIds}
          onSelectStaff={handleSelectStaff}
        />
      </div>
    </Layout>
  );
};

export default StaffPage;
