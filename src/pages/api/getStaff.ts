import { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase"; // Assuming firebase utility is here
import { date } from "zod";
import { Phone } from "lucide-react";
import { is } from "date-fns/locale";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const staffList: any[] = [];
  console.log("Fetching staff...");

  try {
    console.log("Creating collection reference...");
    const staffCollectionRef = collection(db, "users");
    console.log("Collection reference created.");
    console.log("Creating query...");
    const q = query(
      staffCollectionRef
      // where("providerId", "==", "zense") // Use the hardcoded providerId
    );
    console.log("Firestore query:", q);
    console.log("Executing query...");
    const querySnapshot = await getDocs(q);
    console.log("Query executed.");
    console.log("Query snapshot size:", querySnapshot.size);
    const fetchedStaff: any = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // console.log("Fetched staff data:", data);
      return {
        id: doc.id,
        name: data.name,
        gender: data.gender,
        phone: data.phone,

        providerId: data.providerId,
        status: data.status || "unregistered",
        jobRole: data.jobRole || "",
        maritalStatus: data.maritalStatus || "",
        dateOfBirth: data.dateOfBirth || "",
        religion: data.religion || "",
        currentAdress: data.currentAddress || {},
        permanentAddress: data.permanentAddress || {},
        isCurrentAddressSameAsPermanent: data.isCurrentAddressSameAsPermanent,
        isActive: data.isActive || false,
        aadharVerified: data.aadharVerified || false,
        policeVerified: data.policeVerified || false,
        bankDetails: data.bankDetails || {},
        availability: data.availability || [],
        expectedWages: data.expectedWages || {
          "5hrs": 0,
          "12hrs": 0,
          "24hrs": 0,
        },
        educationQualification: data.educationQualification || "",
        educationCertificate: data.educationCertificate || "",
        experienceYears: data.experienceYears || 0,
        languagesKnown: data.languagesKnown || [],
        preferredShifts: data.preferredShifts || [],
        services: data.services || {},
        extraServicesOffered: data.extraServicesOffered || [],
        foodPreference: data.foodPreference || "",
        smokes: data.smokes || "",
        carryOwnFood12hrs: data.carryOwnFood12hrs || "",
        additionalInfo: data.additionalInfo || "",
        selfTestimonial: data.selfTestimonial
          ? {
              customerName: data.customerName || "",
              customerPhone: data.customerPhone || "",
              recording: data.recordingURL || "",
            }
          : null,
        profilePhoto: data.profilePhoto || "",
        identityDocuments: data.identityDocuments || {
          aadharFront: "",
          aadharBack: "",
          panDocument: "",
          aadharNumber: "",
          panNumber: "",
        },
        district: data.district || [],
        subDistricts: data.subDistricts || [],
        createdAt:
          data.createdAt && data.createdAt instanceof Timestamp
            ? (data.createdAt as Timestamp).toDate()
            : new Date(),
        updatedAt:
          data.updatedAt && data.updatedAt instanceof Timestamp
            ? (data.updatedAt as Timestamp).toDate()
            : new Date(),
      };
    });
    staffList.push(fetchedStaff);
    console.log("Staff list updated:", fetchedStaff);
    res.status(200).json(fetchedStaff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Error fetching staff", error });
  }
}
