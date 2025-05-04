import { db } from "./config"; // Adjust path based on your folder structure
import { collection, addDoc } from "firebase/firestore";

const jobStatuses = [
  "ongoing",
  "completed",
  "assigned",
  "completed",
  "completed",
];
const subDistricts = [
  "North West Delhi",
  "South Delhi",
  "East Delhi",
  "West Delhi",
  "Central Delhi",
];
const customerNames = [
  "Rahul Sharma",
  "Ananya Verma",
  "Karan Mehta",
  "Simran Kaur",
  "Vikram Singh",
];

export const addJobs = async () => {
  console.log("Adding jobs...");
  try {
    for (let i = 0; i < 5; i++) {
      const newJob = {
        customerAge: (60 + Math.floor(Math.random() * 30)).toString(), // Random age between 60-89
        customerName: customerNames[i],
        description:
          "Medical assistance as well as daily monitoring and helping with chores",
        district: "Delhi",
        pincode: "1100" + (40 + i).toString(), // Varying pincode
        requirements: ["Requirement 1", "Requirement 2", "Requirement 3"],
        staffId: "unknown",
        status: jobStatuses[i], // Assigning different status
        subDistrict: subDistricts[i], // Assigning different subdistrict
        JobType: "24 hour Care",
        startDate: new Date(2025, 4, 15).toISOString(), // Custom date
        endDate: new Date(2025, 4, 19).toISOString(), // Custom date
        createdAt: new Date().toISOString(), // Current date
        jobDuration: 0, // Initialize jobDuration
      };

      newJob.jobDuration = Math.ceil(
        (new Date(newJob.endDate).getTime() -
          new Date(newJob.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ); // Duration in days

      await addDoc(collection(db, "jobs"), newJob);
      console.log(`Added job ${i + 1}:`, newJob);
    }

    console.log("All jobs added successfully!");
  } catch (error) {
    console.error("Error adding jobs:", error);
  }
};

addJobs();
