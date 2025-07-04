import React from "react";

// Types for props
interface StaffProfileProps {
  staff: any;
  reviews?: any[];
  loading?: boolean;
  error?: string | null;
  groupedDuties: Record<string, { mandatory: any[]; optional: any[] }>;
}

// Color helpers
const mandatoryColor = "bg-teal-100 text-teal-800 border-teal-200";
const optionalColor = "bg-blue-100 text-blue-800 border-blue-200";

function capitalize(word: string | undefined | null) {
  if (!word) return "";
  if (typeof word !== "string") return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export const StaffProfile: React.FC<StaffProfileProps> = ({
  staff,
  reviews = [],
  loading = false,
  error = null,
  groupedDuties,
}) => {
  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }
  if (!staff) {
    return <div className="text-gray-600 text-center py-8">No staff data available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-0 mt-8 mb-12 border border-gray-100">
      {/* Main Two-Panel Layout */}
      <div className="flex flex-col md:flex-row gap-0">
        {/* Left Panel */}
        <div className="md:w-2/5 w-full border-r border-gray-100 p-0 flex flex-col gap-0 min-h-full bg-gradient-to-b from-teal-50 via-white to-white shadow-md rounded-l-xl">
          {/* Profile Header Card */}
          <div className="flex flex-col items-center gap-3 py-8 px-6 bg-gradient-to-br from-teal-100/60 to-white rounded-t-xl">
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-teal-200 bg-gray-100 shadow-md">
              <img
                src={staff.profilePhotoURL || staff.profilePhoto || "/icon-512.png"}
                alt={staff.name || staff.fullName || "Staff"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center mt-2">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {staff.name || staff.fullName || "Staff"}
              </h1>
              {staff.jobRole && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-teal-200 text-teal-800 text-xs font-semibold tracking-wide shadow-sm">
                  {capitalize(staff.jobRole)}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent my-0" />

          {/* Details Card */}
          <div className="px-7 py-5 bg-white/80">
            <h3 className="font-semibold text-teal-800 mb-3 text-base tracking-wide">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Experience:</span>
                <span className="text-gray-800 font-semibold">{staff.experienceYears || "<1"} yrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Education:</span>
                <span className="text-gray-800 font-semibold">{capitalize(staff.educationQualification) || "N/A"}</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-500">Native State:</span>
                <span className="text-gray-800 font-semibold">{capitalize(staff.district) || "N/A"}</span>
              </div> */}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent my-0" />

          {/* Preferences Card */}
          <div className="px-7 py-5 bg-white/80">
            <h3 className="font-semibold text-teal-800 mb-3 text-base tracking-wide">Preferences</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Eats:</span> <span>{capitalize(staff.foodPreference) || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Smoking:</span> <span>{capitalize(staff.smokes) || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shift Type:</span> <span>{staff.shiftType ? staff.shiftType.toUpperCase() : "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shift Time:</span> <span>{staff.shiftTime ? staff.shiftTime.toUpperCase() : "N/A"}</span></div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent my-0" />

          {/* Verification Card */}
          <div className="px-7 py-5 bg-white/80 rounded-b-xl">
            <h3 className="font-semibold text-teal-800 mb-3 text-base tracking-wide">Verification</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Aadhar:</span> <span>{staff.identityDocuments?.aadharNumber || "N/A"}</span></div>
              {/* Add more verification fields as needed */}
            </div>
          </div>
        </div>

        {/* Right Panel: Services */}
        <div className="md:w-3/5 w-full p-8">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Services I Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(groupedDuties).map(([category, group]) => {
              // Only show category if there are selected services
              const selectedMandatory = group.mandatory.filter((duty: any) => staff.services?.[category]?.includes(duty.label));
              const selectedOptional = group.optional.filter((duty: any) => staff.services?.[category]?.includes(duty.label));
              if (selectedMandatory.length === 0 && selectedOptional.length === 0) return null;
              return (
                <div key={category} className="mb-2">
                  <div className="font-medium text-gray-700 mb-2">{capitalize(category)}</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMandatory.map((duty: any) => (
                      <span
                        key={duty.key}
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${mandatoryColor}`}
                      >
                        {duty.label}
                      </span>
                    ))}
                    {selectedOptional.map((duty: any) => (
                      <span
                        key={duty.key}
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${optionalColor}`}
                      >
                        {duty.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews at the bottom */}
      {/* <div className="border-t border-gray-100 px-8 py-6 bg-white">
        <h3 className="font-semibold text-teal-800 mb-2">Here's what other customers say about me</h3>
        <div className="space-y-3">
          {reviews && reviews.length > 0 ? (
            reviews.map((review, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                <div className="mb-1 text-sm italic text-gray-700">"{review.text}"</div>
                <div className="text-xs text-gray-500">- {review.customerName || review.name}</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400">No reviews available yet.</div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default StaffProfile; 