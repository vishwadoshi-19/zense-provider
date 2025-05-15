import { db } from "@/lib/firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { staff_id } = req.query;

    if (!staff_id || typeof staff_id !== "string") {
      return res.status(400).json({ message: "Missing or invalid staff_id" });
    }

    try {
      const reviewsCollection = collection(db, "reviews");
      const q = query(reviewsCollection, where("staff_id", "==", staff_id));
      const querySnapshot = await getDocs(q);

      const reviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Error fetching reviews" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
