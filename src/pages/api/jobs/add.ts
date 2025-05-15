import type { NextApiRequest, NextApiResponse } from "next";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore"; // Assuming db is initialized here
import { Job2, OrderEntry } from "@/types/jobs"; // Import necessary types

// Helper function to get string value with default
const getStringValue = (value: string | undefined) => value ?? "";
// Helper function to get number value with default
const getNumberValue = (value: number | string | undefined) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
// Helper function to get Date value with default
const getDateValue = (value: string | undefined) =>
  value ? new Date(value) : new Date(); // Default to current date if empty

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const formData = req.body;

    // Basic validation for required fields (based on frontend logic)
    if (
      !formData.jobType ||
      !formData.serviceType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.patientInfo?.name ||
      !formData.patientInfo?.age ||
      !formData.patientInfo?.gender ||
      !formData.patientInfo?.address ||
      !formData.patientInfo?.state ||
      !formData.patientInfo?.city ||
      !formData.patientInfo?.pincode ||
      !formData.patientInfo?.mobile
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newJob: Job2 = {
      // Firestore will generate the ID
      id: "", // Placeholder, Firestore will generate this
      jobType: getStringValue(formData.jobType),
      serviceType: getStringValue(formData.serviceType),
      serviceShift: getStringValue(formData.serviceShift),
      jobDuration: getNumberValue(formData.jobDuration),
      startDate: getDateValue(formData.startDate),
      endDate: getDateValue(formData.endDate),
      signUpDate: getDateValue(formData.signUpDate),
      description: getStringValue(formData.description),
      requirements: formData.requirements || [], // Use as-is or default to an empty array
      notes: getStringValue(formData.notes),
      status: getStringValue(formData.status) || "pending", // Default status
      pricePerHour: getNumberValue(formData.pricePerHour),
      createdAt: new Date(),
      updatedAt: new Date(),

      // Handle nested objects with default values for mandatory fields
      patientInfo: {
        name: getStringValue(formData.patientInfo?.name),
        age: getNumberValue(formData.patientInfo?.age),
        gender: getStringValue(formData.patientInfo?.gender),
        address: getStringValue(formData.patientInfo?.address),
        city: getStringValue(formData.patientInfo?.city),
        state: getStringValue(formData.patientInfo?.state),
        pincode: getStringValue(formData.patientInfo?.pincode),
        mobile: getStringValue(formData.patientInfo?.mobile),
        patientId: getStringValue(formData.patientInfo?.patientId),
      },
      guardianInfo: {
        name: getStringValue(formData.guardianInfo?.name),
        relationship: getStringValue(formData.guardianInfo?.relationship),
        mobile: getStringValue(formData.guardianInfo?.mobile),
        email: getStringValue(formData.guardianInfo?.email),
      },
      acquisitionInfo: {
        mode: (getStringValue(formData.acquisitionInfo?.mode) || "Offline") as
          | "Online"
          | "Offline", // Provide a default mode
        channel: (getStringValue(formData.acquisitionInfo?.channel) ||
          "Other") as
          | "Customer Referral"
          | "Doctor Referral"
          | "Online Marketing"
          | "Other", // Provide a default channel
        referrerRemarks: getStringValue(
          formData.acquisitionInfo?.referrerRemarks
        ),
      },
      paymentInfo: {
        modeOfPayment: getStringValue(formData.paymentInfo?.modeOfPayment),
        paymentDate: getDateValue(
          formData?.paymentInfo?.paymentDate instanceof Date
            ? formData.paymentInfo.paymentDate.toISOString()
            : formData?.paymentInfo?.paymentDate
        ),
        paymentAmount: getNumberValue(formData.paymentInfo?.paymentAmount),
        refundDate: getDateValue(
          formData?.paymentInfo?.refundDate instanceof Date
            ? formData.paymentInfo.refundDate.toISOString()
            : formData?.paymentInfo?.refundDate
        ),
        refundAmount: getNumberValue(formData.paymentInfo?.refundAmount),
      },
      staffInfo: {
        staffId: getStringValue(formData.staffInfo?.staffId),
        staffName: getStringValue(formData.staffInfo?.staffName),
        staffMobile: getStringValue(formData.staffInfo?.staffMobile),
      },

      // Handle order arrays
      medicineOrders: (formData.medicineOrders as OrderEntry[]) ?? [],
      diagnosticOrders: (formData.diagnosticOrders as OrderEntry[]) ?? [],
      otherOrders: (formData.otherOrders as OrderEntry[]) ?? [],
    };

    console.log("New job data:", newJob);

    // Add the document to Firestore
    const docRef = await addDoc(collection(db, "jobs"), newJob);

    res
      .status(201)
      .json({ message: "Job added successfully", jobId: docRef.id });
  } catch (error) {
    console.error("Error adding job:", error);
    res
      .status(500)
      .json({ message: "Error adding job", error: (error as Error).message });
  }
}
