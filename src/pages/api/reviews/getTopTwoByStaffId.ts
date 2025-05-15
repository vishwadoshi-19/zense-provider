import { db } from "@/lib/firebase/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

const genericReviews = [
  {
    id: "generic-1",
    createdAt: {
      seconds: 1746638913,
      nanoseconds: 651000000,
    },
    customerName: "Ramesh Mistri",
    type: "testimonial",
    featuredReview: true,
    stars: 5,
    text: "He is truly a blessing for our family. Jab se unhone mere papa ki care lena shuru kiya, tab se ek alag hi sukoon mil gaya hai. He is very patient and understanding, aur unka nature itna caring hai ki papa bhi unse bohot attached ho gaye hain. Bas ek hi cheez-kabhi-kabhi late ho jaate hain, but phir bhi unki service 10/10 hai!",
    staff_id: "generic-1",
  },
  {
    id: "generic-2",
    createdAt: {
      seconds: 1746638913,
      nanoseconds: 651000000,
    },
    customerName: "Sanjay Kumar",
    type: "testimonial",
    featuredReview: true,
    stars: 5,
    text: "Inka kaam bohot hi accha hai. Unka experience clearly dikhai deta hai. Meri mummy ke saath bohot patiently deal karte hain, unhe stories sunate hain, aur unka khayal apne family member ki tarah rakhte hain. Overall, hum unse bohot khush hain, aur unki services definitely recommend karenge.",
    staff_id: "generic-2",
  },
];

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

      // First, get featured reviews
      const featuredQuery = query(
        reviewsCollection,
        where("staff_id", "==", staff_id),
        where("featuredReview", "==", true),
        limit(2) // Limit to 2 featured reviews
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredReviews = featuredSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let topReviews = featuredReviews;
      console.log(topReviews.length);

      // If we don't have 2 featured reviews, get top-rated reviews
      if (topReviews.length < 2) {
        const remainingLimit = 2 - topReviews.length;
        const topRatedQuery = query(
          reviewsCollection,
          where("staff_id", "==", staff_id),
          where("featuredReview", "!=", true),
          orderBy("stars", "desc"),
          limit(remainingLimit)
        );
        const topRatedSnapshot = await getDocs(topRatedQuery);
        const topRatedReviews = topRatedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Combine featured and top-rated, ensuring no duplicates
        const existingIds = new Set(topReviews.map((review) => review.id));
        topRatedReviews.forEach((review) => {
          if (!existingIds.has(review.id)) {
            topReviews.push(review);
            existingIds.add(review.id);
          }
        });

        // If we still don't have 2 reviews, fetch some generic high-rated reviews
        if (topReviews.length < 2) {
          const remainingLimit = 2 - topReviews.length;
          const genericQuery = query(
            reviewsCollection,
            orderBy("stars", "desc"),
            limit(remainingLimit * 3) // Fetch more than needed to filter out duplicates
          );

          // Add generic reviews until we have 2
          for (
            let i = 0;
            i < genericReviews.length && topReviews.length < 2;
            i++
          ) {
            topReviews.push(genericReviews[i]);
            existingIds.add(genericReviews[i].id);
          }
        }

        // Ensure we only return up to 2 reviews
        topReviews = topReviews.slice(0, 2);
      }

      res.status(200).json(topReviews);
    } catch (error) {
      console.error("Error fetching top reviews:", error);
      res.status(500).json({ message: "Error fetching top reviews" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
