import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StaffProfile from "@/components/staff/StaffProfile";
import { getGroupedDutiesByRole } from "@/constants/duties";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { generateStaffPDFReport } from "@/lib/downloadPDF";

const StaffDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  // PDF download handler (calls cloud function)
  const handleDownloadPDF = async () => {
    if (!staff) return;
    setDownloading(true);
    try {
      await generateStaffPDFReport(staff, groupedDuties, reviews);
    } catch (err) {
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
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
          className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition text-base flex items-center justify-center min-w-[140px]"
          disabled={downloading}
        >
          {downloading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Downloading...
            </span>
          ) : (
            "Download PDF"
          )}
        </button>
      </div>
    </>
  );
};

export default StaffDetailPage;
