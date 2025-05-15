import { db } from "@/lib/firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const reviewData = req.body;

    if (!reviewData) {
      return res
        .status(400)
        .json({ message: "Missing review data in request body" });
    }

    // Basic validation (can be expanded)
    if (
      !reviewData.staff_id ||
      !reviewData.customerName ||
      !reviewData.stars ||
      !reviewData.text ||
      !reviewData.type
    ) {
      return res
        .status(400)
        .json({ message: "Missing required review fields" });
    }

    try {
      const reviewsCollection = collection(db, "reviews");
      const docRef = await addDoc(reviewsCollection, {
        ...reviewData,
        createdAt: serverTimestamp(),
      });

      res
        .status(201)
        .json({ message: "Review added successfully", id: docRef.id });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ message: "Error adding review" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

//JSON Payload Example
// {
//     "customerName": "Test User",
//     "staff_id": "3qX9Ijq4smUfm2ZJtbhuM4c45nY2",
//     "stars": 5,
//     "text": "This is a test review.",
//     "type": "testimonial",
//     "featuredReview": true
// }
