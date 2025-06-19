import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Function to generate a random 4-digit PIN
function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jobsRef = collection(db, 'jobs');
    const querySnapshot = await getDocs(jobsRef);
    const usedPins = new Set<string>();
    let updatedCount = 0;
    let alreadyHadPin = 0;
    const pinSummary: { jobId: string; pin: string; patientName: string; jobType: string; status: string }[] = [];

    // First, collect all existing pins
    querySnapshot.docs.forEach((jobDoc) => {
      const jobData = jobDoc.data();
      if (jobData.pin) {
        usedPins.add(jobData.pin);
      }
    });

    for (const jobDoc of querySnapshot.docs) {
      const jobData = jobDoc.data();
      if (jobData.pin) {
        alreadyHadPin++;
        pinSummary.push({
          jobId: jobDoc.id,
          pin: jobData.pin,
          patientName: jobData.patientInfo?.name || 'Unknown Patient',
          jobType: jobData.jobType || 'Unknown Job',
          status: jobData.status || 'Unknown',
        });
        continue;
      }
      // Generate a unique PIN
      let newPin;
      do {
        newPin = generatePin();
      } while (usedPins.has(newPin));
      usedPins.add(newPin);
      await updateDoc(doc(db, 'jobs', jobDoc.id), {
        pin: newPin,
        updatedAt: new Date().toISOString(),
      });
      updatedCount++;
      pinSummary.push({
        jobId: jobDoc.id,
        pin: newPin,
        patientName: jobData.patientInfo?.name || 'Unknown Patient',
        jobType: jobData.jobType || 'Unknown Job',
        status: jobData.status || 'Unknown',
      });
    }
    return res.status(200).json({
      message: `PINs generated for ${updatedCount} jobs. ${alreadyHadPin} jobs already had PINs.`,
      pinSummary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 