import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/common/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Staff } from "@/types";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import Image from "next/image";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Check,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { downloadResumeAsPDF } from "@/lib/downloadPDF";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { profile } from "console";

function capitalize(word: string | undefined | null) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const StaffDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<any>({});
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
            const staff = staffDocSnap.data();

            setStaff({
              id: staff.id,
              name: staff.name,
              gender: staff.gender,
              phone: staff.phone,
              profilePhotoURL: staff.profilePhotoURL,

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
              expectedWages: staff.expectedWages || {
                "5hrs": 0,
                "12hrs": 0,
                "24hrs": 0,
              },
              educationQualification: staff.educationQualification || "",
              educationCertificate: staff.educationCertificate || "",
              experienceYears: staff.experienceYears || "<1",
              languagesKnown: staff.languagesKnown || [],
              preferredShifts: staff.preferredShifts || [],
              services: staff.services || {},
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
            });
            if (staff?.experienceYears === "less-than-1") {
              setStaff((prevState: any) => ({
                ...prevState,
                experienceYears: "<1",
              }));
            }
          } else {
            setError("Staff member not found.");
          }
        } catch (err) {
          console.error("Error fetching staff details:", err);
          setError("Failed to fetch staff details.");
        } finally {
          setLoading(false);
        }
      }
    };

    async function getTopTwoReviews(staffId: string) {
      try {
        const response = await fetch(
          `/api/reviews/getTopTwoByStaffId?staff_id=${staffId}`
        );

        if (!response.ok) {
          throw new Error(`Error fetching reviews: ${response.statusText}`);
        }

        const reviewsFetched = await response.json();
        console.log("Reviews fetched:", reviewsFetched);
        if (reviewsFetched.length === 0) {
          setError("No reviews available for this staff member.");
        } else {
          setReviews(reviewsFetched);
        }
        return reviews;
      } catch (error) {
        console.error("Failed to fetch top reviews:", error);
        return []; // Return an empty array or handle the error as appropriate
      } finally {
        setLoading(false);
        console.log("Reviews set:", reviews);
      }
    }

    if (router.isReady) {
      fetchStaff();
      getTopTwoReviews(id as string);
    }
  }, [id, router.isReady]);

  console.log("Staff data:", staff);
  console.log("Staff ID:", id);
  console.log("Reviews:", reviews);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-red-600">
          {error}
        </div>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          No staff data available.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div
          id="resume"
          className="w-[210mm] h-[297mm] px-6 py-4 mx-auto bg-white shadow-sm print:shadow-none overflow-hidden text-[10pt] leading-snug"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-28 h-28 border-2 border-green-500 overflow-hidden">
                <div className="w-full h-full relative">
                  <img
                    src={`/api/proxy-image?url=${encodeURIComponent(
                      staff?.profilePhoto
                    )}`}
                    alt="PROFILE PHOTO"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </Avatar>
              <div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold pr-4">
                      {staff?.name?.toUpperCase()}
                    </h1>
                    <div className="flex gap-1">
                      {staff?.isActive && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                          <Activity />
                        </span>
                      )}
                      {staff?.aadharVerified && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          <FileCheck2 />
                        </span>
                      )}
                      {staff?.policeVerified && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xl text-muted-foreground">
                  {capitalize(staff?.jobRole) || "Staff"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <img
                src="/icon-512.png"
                alt="NURCH ELDER CARE BUSINESS"
                className="h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* About Me & Contact */}
            <div className="space-y-4">
              <Card className="p-3 border border-gray-300 rounded-md shadow-none print:shadow-none">
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-[11pt] font-semibold">
                    About me
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Native State:</span>
                    <span>
                      {capitalize(staff?.permanentAddress?.state) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>
                      {staff?.dateOfBirth
                        ? new Date().getFullYear() -
                          new Date(staff?.dateOfBirth).getFullYear()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Marital Status:
                    </span>
                    <span>{capitalize(staff?.maritalStatus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Religion:</span>
                    <span>{capitalize(staff?.religion) || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education:</span>
                    <span>
                      {capitalize(staff?.educationQualification) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span>{staff?.experienceYears} Years</span>
                  </div>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader className="pb-1 pt-2">
                  <CardTitle>My Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Current Address:</p>
                      <p className="text-sm text-muted-foreground">
                        C/o Shyam Sundar, RZ 210, Karan Vihar - Part 1, Gully no
                        3, Kirari Suleiman Nagar, Delhi: 110086
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Permanent Address:</p>
                      <p className="text-sm text-muted-foreground">
                        Same as above
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <p>+91-9220249040</p>
                  </div>
                </CardContent>
              </Card> */}

              <Card className="p-3 border border-gray-300 rounded-md shadow-none print:shadow-none">
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-[11pt] font-semibold">
                    My Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eats:</span>
                    <span>{capitalize(staff?.foodPreference) || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smoking:</span>
                    <span>{capitalize(staff?.smokes) || "N/A"}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-muted-foreground">Drinking:</span>
                    <span>No</span>
                  </div> */}
                </CardContent>
              </Card>

              <Card className="p-3 border border-gray-300 rounded-md shadow-none print:shadow-none">
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-[11pt] font-semibold">
                    My Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Aadhar :
                    </span>
                    <span className="text-sm">
                      {staff?.identityDocuments?.aadharNumber || "444433338888"}
                    </span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Last police verification:
                    </span>
                    <span>N/A</span>
                  </div> */}
                </CardContent>
              </Card>
            </div>

            {/* Services */}
            <div className="md:col-span-2 space-y-4">
              <Card className="p-3 border border-gray-300 rounded-md shadow-none print:shadow-none">
                <CardHeader className="pb-1 pt-2">
                  <CardTitle className="text-[11pt] font-semibold">
                    Services I offer
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(staff.services || {})
                      .filter(([category]) =>
                        [
                          "Personal_care",
                          "Nutrition",
                          "Hygiene",
                          "Support",
                          "Mobility",
                          "Other",
                        ].includes(category)
                      )
                      .map(([category, services]) => (
                        <div key={category}>
                          <h3 className="text-base font-semibold text-green-700 mb-2">
                            {category}
                          </h3>
                          <ul className="space-y-1">
                            {Array.isArray(services) ? (
                              (services as string[]).map((service, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                                  <span className="text-sm text-gray-800">
                                    {capitalize(service.trim())}
                                  </span>
                                </li>
                              ))
                            ) : (
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 shrink-0" />
                                <span className="text-sm text-gray-800">
                                  {capitalize((services as string).trim())}
                                </span>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {Object.entries(staff.services || {}).some(
                ([category]) => !isNaN(Number(category))
              ) && (
                <Card className="p-3 border border-gray-300 rounded-md shadow-none print:shadow-none">
                  <CardHeader className="pb-1 pt-2">
                    <CardTitle className="text-[11pt] font-semibold">
                      I can also help you with
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 py-2">
                    {Object.entries(staff.services || {})
                      .filter(([category]) => !isNaN(Number(category)))
                      .map(([category, service]) => (
                        <div key={category} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span className="text-sm text-gray-800">
                            {capitalize((service as string).trim())}
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <Card className="p-3 border mt-4 border-gray-300 rounded-md shadow-none print:shadow-none">
            <CardHeader className="pb-1 pt-2">
              <CardTitle className="text-[11pt] font-semibold">
                Here's what other customers say about me
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 py-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: any, index: any) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="mb-1">
                          <p className="text-xs italic mb-1">
                            "{review?.text}"
                          </p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review?.stars
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm font-medium">
                          - {review?.customerName}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No reviews available yet.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          {/* <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Reach out to us at
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-green-600" />
              <span className="text-sm">+91-9220249040</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-green-600" />
              <span className="text-sm">contact-us@nurch.in</span>
            </div>
          </div>
          <p className="text-sm mt-2">Website: www.nurch.in</p>
        </div> */}

          {/* Print Styles - Added to document head */}
          <style>{`
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .w-\\[210mm\\] {
                width: 210mm;
                height: 297mm;
              }
            }
          `}</style>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 print:hidden">
        <Button
          onClick={() => downloadResumeAsPDF("resume", staff?.name)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Printer className="h-4 w-4" />
          Download as PDF
        </Button>
      </div>
    </Layout>
  );
};

export default StaffDetailPage;
