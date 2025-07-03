import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StaffProfile from "@/components/staff/StaffProfile";
import { getGroupedDutiesByRole } from "@/constants/duties";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

const StaffDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      if (id) {
        try {
          const staffDocRef = doc(db, "users", id as string);
          const staffDocSnap = await getDoc(staffDocRef);
          if (staffDocSnap.exists()) {
            setStaff(staffDocSnap.data());
          } else {
            setError("Staff member not found.");
          }
        } catch (err) {
          setError("Failed to fetch staff details.");
        } finally {
          setLoading(false);
        }
      }
    };
    async function getTopTwoReviews(staffId: string) {
      try {
        const response = await fetch(`/api/reviews/getTopTwoByStaffId?staff_id=${staffId}`);
        if (!response.ok) throw new Error();
        const reviewsFetched = await response.json();
          setReviews(reviewsFetched);
      } catch {
        // ignore
      }
    }
    if (router.isReady) {
      fetchStaff();
      getTopTwoReviews(id as string);
    }
  }, [id, router.isReady]);

  // Get grouped duties for the staff's jobRole
  const groupedDuties = staff?.jobRole ? getGroupedDutiesByRole(staff.jobRole) : {};

  // PDF download handler (calls server-side API)
  const handleDownloadPDF = async () => {
    if (!staff) return;
    try {
      const response = await fetch("/api/generateStaffPDF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff, reviews, groupedDuties }),
      });
      if (!response.ok) throw new Error("Failed to generate PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${staff.name || staff.fullName || "Staff"}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF");
    }
  };

  return (
    <>
      <StaffProfile
        staff={staff}
        reviews={reviews}
        loading={loading}
        error={error}
        groupedDuties={groupedDuties}
      />
      {/* Floating Download Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition text-base"
        >
          Download PDF
        </button>
      </div>
    </>
  );
};

export default StaffDetailPage;
