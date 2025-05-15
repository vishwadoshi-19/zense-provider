import { NextApiRequest, NextApiResponse } from "next";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export default async function assignStaffHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { staffId, jobId } = req.body;
  //   const { staffId, staffName, staffMobile } = staffInfo || {};

  if (!staffId || !jobId) {
    return res.status(400).json({ error: "Missing staffId or jobId" });
  }

  try {
    // Fetch job details to get start and end times
    const jobRef = doc(db, "jobs", jobId);
    const jobSnapshot = await getDoc(jobRef);

    if (!jobSnapshot.exists()) {
      return res.status(404).json({ error: "Job not found" });
    }

    const jobData = jobSnapshot.data();
    const { startDate, endDate } = jobData;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Job start or end time missing" });
    }

    // Update the job document
    await updateDoc(jobRef, {
      staffInfo: {
        ...jobData.staffInfo,
        staffId,
      },
      status: "assigned",
    });

    // Update the staff document
    const staffRef = doc(db, "users", staffId);
    await updateDoc(staffRef, {
      currentAssignment: jobId,
      availability: {
        ...jobData.availability,
        [startDate]: false, // Mark unavailable from start to end
        [endDate]: false,
      },
    });

    return res.status(200).json({
      message: `Job ${jobId} assigned to staff ${staffId}`,
    });
  } catch (error) {
    console.error("Error assigning staff to job:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
