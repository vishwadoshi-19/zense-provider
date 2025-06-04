import type { NextApiRequest, NextApiResponse } from "next";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // adjust this import path if needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const docRef = doc(db, "users", "PgvMtZLztERRkFmDSfIjMJQm3s53");

    const data = {
      aadharVerified: true,
      additionalInfo: "",
      availability: {
        "1748822400": false,
        "1747699200": false,
      },
      bankDetails: {
        bankName: "",
        bankBranch: "",
        ifscCode: "",
        accountName: "",
        accountNumber: "",
      },
      carryOwnFood12hrs: "",
      createdAt: "21 May 2025 at 16:57:12 UTC+5:30",
      currentAddress: {
        state: "Delhi",
        street:
          "Plot No R-II/45, S/F backside RHS, Block R-2, Mohan garden, Uttam nagar",
        zip: "110059",
        city: "Delhi",
      },
      currentAssignment: "hFNmqPFKBujRJmUDu9lo",
      dateOfBirth: "1987-07-30",
      district: ["delhi"],
      educationCertificate:
        "https://firebasestorage.googleapis.com/v0/b/airy-adapter-451212-b8.appspot.com/o/users%2FPgvMtZLztERRkFmDSfIjMJQm3s53%2Fcertificates%2FEducation_Neetu%20Yadav.jpeg?alt=media&token=0d738435-e934-4c6e-b933-a870fe5ca247",
      educationQualification: "gnm",
      expectedWages: {
        "5hrs": 0,
        "12hrs": 1200,
        "24hrs": 1500,
      },
      experienceYears: "2-5",
      extraServicesOffered: {
        Other: [
          "give medicine",
          "assist during diagnostic tests",
          "change medical dressing",
          "accompany for doctor's visit",
          "physiotherapy",
          "change drip",
          "book a cab",
          "giving injection",
          "bathing & sponge the customer",
          "measuring vitals - bp, sugar etc.",
        ],
        Nutrition: ["assist in feeding", "help in fluid intake"],
        Personal_care: [
          "oral hygiene",
          "skin care",
          "assist in getting dressed",
        ],
        Mobility: [
          "walking assistance",
          "turn position in bed",
          "motion exercises",
          "light massages",
        ],
        Hygiene: ["changing catheter"],
        Support: ["polite conversations", "companionship"],
      },
      foodPreference: "both",
      gender: "female",
      identityDocuments: {
        panNumber: "BCQPY1736A",
        panDocument:
          "https://firebasestorage.googleapis.com/v0/b/airy-adapter-451212-b8.appspot.com/o/users%2FPgvMtZLztERRkFmDSfIjMJQm3s53%2Fdocuments%2Fpan_PAN_Neetu%20Yadav.jpeg?alt=media&token=437c1c3a-7114-4112-9089-40c55261c59a",
        aadharBack:
          "https://firebasestorage.googleapis.com/v0/b/airy-adapter-451212-b8.appspot.com/o/users%2FPgvMtZLztERRkFmDSfIjMJQm3s53%2Fdocuments%2Faadhar_back_Aadhar_Neetu%20Yadav.jpeg?alt=media&token=278fd456-7986-4b54-b5ee-447b44f650e8",
        aadharNumber: "940126602315",
        aadharFront:
          "https://firebasestorage.googleapis.com/v0/b/airy-adapter-451212-b8.appspot.com/o/users%2FPgvMtZLztERRkFmDSfIjMJQm3s53%2Fdocuments%2Faadhar_front_Aadhar_Neetu%20Yadav_2.jpeg?alt=media&token=beb1d298-eb2b-4ce9-9583-2133a29e8c0b",
      },
      isActive: true,
      isCurrentAddressSameAsPermanent: true,
      jobRole: "nurse",
      languagesKnown: ["hindi", "english"],
      maritalStatus: "married",
      name: "Neetu yadav",
      permanentAddress: {
        city: "Delhi",
        state: "Delhi",
        zip: "110059",
        street:
          "Plot No R-II/45, S/F backside RHS, Block R-2, Mohan garden, Uttam nagar",
      },
      policeVerified: false,
      preferredShifts: ["Morning (6AM-2PM)", "Flexible Hours"],
      profilePhoto:
        "https://firebasestorage.googleapis.com/v0/b/airy-adapter-451212-b8.appspot.com/o/users%2FPgvMtZLztERRkFmDSfIjMJQm3s53%2FprofilePhotos%2FNeetu%20Yadav.jpeg?alt=media&token=23dfde1a-e24c-4570-8c68-98d77d460ed7",
      providerId: "zense",
      religion: "hindu",
      selfTestimonial: null,
      services: {
        Other: [
          "give medicine",
          "assist during diagnostic tests",
          "change medical dressing",
          "accompany for doctor's visit",
          "physiotherapy",
          "change drip",
          "book a cab",
          "giving injection",
          "bathing & sponge the customer",
          "measuring vitals - bp, sugar etc.",
        ],
        Nutrition: ["assist in feeding", "help in fluid intake"],
        Personal_care: [
          "oral hygiene",
          "skin care",
          "assist in getting dressed",
        ],
        Mobility: [
          "walking assistance",
          "turn position in bed",
          "motion exercises",
          "light massages",
        ],
        Hygiene: ["changing catheter"],
        Support: ["polite conversations", "companionship"],
      },
      smokes: "no",
      status: "suspended",
      subDistricts: [
        "central delhi",
        "east delhi",
        "new delhi",
        "north delhi",
        "north east delhi",
        "north west delhi",
        "shahdara",
        "south delhi",
        "south east delhi",
        "south west delhi",
        "west delhi",
      ],
      updatedAt: "21 May 2025 at 16:57:12 UTC+5:30",
    };

    const data2 = {
      status: "suspended",
      updatedAt: "21 May 2025 at 16:57:12 UTC+5:30",
      createdAt: "21 May 2025 at 16:57:12 UTC+5:30",
      phone: "+918595739629",
    };

    await updateDoc(docRef, data);
    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("🔥 Error updating Firestore:", error);
    return res
      .status(500)
      .json({ success: false, error: (error as any).message });
  }
}
