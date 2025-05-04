import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/common/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Staff } from "@/types";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { downloadResumeAsPDF } from "@/lib/downloadPDF";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const StaffDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      if (id) {
        try {
          const staffDocRef = doc(db, "users", id as string);
          const staffDocSnap = await getDoc(staffDocRef);

          if (staffDocSnap.exists()) {
            const data = staffDocSnap.data();

            setStaff({
              id: staffDocSnap.id,
              providerId: data.providerId,
              name: data.name,
              type: data.jobRole,
              contactNumber: data.phone,
              email: data.email,
              address: data.address,
              experience: data.experience,
              availability: data.availability,
              currentAssignment: data.currentAssignment || null,
              createdAt: (data.createdAt as Timestamp).toDate(),
              updatedAt: (data.updatedAt as Timestamp).toDate(),
            });
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

    if (router.isReady) {
      fetchStaff();
    }
  }, [id, router.isReady]);

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
          className="w-[210mm] h-[297mm] mx-auto bg-white shadow-sm print:shadow-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-28 h-28 border-2 border-green-500">
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt="Deepak"
                  className="object-cover"
                />
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {staff?.name?.toUpperCase()}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {staff.type.charAt(0).toUpperCase() + staff.type.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <img
                src="/placeholder.svg?height=80&width=160"
                alt="NURCH ELDER CARE BUSINESS"
                className="h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* About Me & Contact */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle>About me</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Native State:</span>
                    <span>Bihar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span>41</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Marital Status:
                    </span>
                    <span>Married</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Religion:</span>
                    <span>Atheist</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education:</span>
                    <span>GNA Certified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience:</span>
                    <span>10+ years</span>
                  </div>
                </CardContent>
              </Card>

              {/* <Card>
              <CardHeader className="pb-2 pt-3">
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

              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle>My Food preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eats:</span>
                    <span>Veg & Non Veg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smoking:</span>
                    <span>No</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Drinking:</span>
                    <span>No</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle>My Verification Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aadhar no:</span>
                    <span>32060706 6175</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Last police verification:
                    </span>
                    <span>N/A</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle>Services I offer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        Mobility
                      </h3>
                      <ul className="space-y-0.5">
                        <li className="text-sm">Walking assistance</li>
                        <li className="text-sm">Turn position in bed</li>
                        <li className="text-sm">Motion exercises</li>
                        <li className="text-sm">Massages (weekly)</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        Nutrition
                      </h3>
                      <ul className="space-y-0.5">
                        <li className="text-sm">Assist in feeding</li>
                        <li className="text-sm">Help in fluid intake</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        Personal care
                      </h3>
                      <ul className="space-y-0.5">
                        <li className="text-sm">Oral hygiene</li>
                        <li className="text-sm">Bathing/Sponging</li>
                        <li className="text-sm">Skin care</li>
                        <li className="text-sm">Assist in getting dressed</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        Maintenance
                      </h3>
                      <ul className="space-y-0.5">
                        <li className="text-sm">Take out room trash</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        Hygiene
                      </h3>
                      <ul className="space-y-0.5">
                        <li className="text-sm">Help in toileting</li>
                        <li className="text-sm">Urinal/Bedpan assistance</li>
                        <li className="text-sm">Changing diapers</li>
                        <li className="text-sm">Empty catheter bag</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-green-600 mb-1">
                        Support
                      </h3>
                      <ul className="space-y-0.5">
                        <li className="text-sm">Companionship</li>
                        <li className="text-sm">Polite conversations</li>
                        <li className="text-sm">
                          Accompany for Doctor's visit
                        </li>
                        <li className="text-sm">
                          Assist during diagnostic tests
                        </li>
                        <li className="text-sm">Measuring vitals</li>
                        <li className="text-sm">Book a cab</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle>I can also help you with</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 py-2">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Clean patient's room</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Make tea / coffee</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Cut fruits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Give medicine</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="mb-2 mt-3">
            <CardHeader className="pb-2 pt-3">
              <CardTitle>Here's what other customers say about me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 py-2">
              <div className="border rounded-lg p-3">
                <p className="text-xs italic mb-1">
                  "Deepak is truly a blessing for our family. Jab se unhone mere
                  papa ki care lena shuru kiya, tab se ek alag hi sukoon mil
                  gaya hai. He is very patient and understanding, aur unka
                  nature itna caring hai ki papa bhi unse bohot attached ho gaye
                  hain. Bas ek hi cheez-kabhi-kabhi late ho jaate hain, but phir
                  bhi unki service 10/10 hai!"
                </p>
                <p className="text-sm font-medium">- Ramesh Mistri</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs italic mb-1">
                  "Deepak ka kaam bohot hi accha hai. Unka experience clearly
                  dikhai deta hai. Meri mummy ke saath bohot patiently deal
                  karte hain, unhe stories sunate hain, aur unka khayal apne
                  family member ki tarah rakhte hain. Overall, hum unse bohot
                  khush hain, aur unki services definitely recommend karenge."
                </p>
                <p className="text-sm font-medium">– Sanjay Kumar</p>
              </div>
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
