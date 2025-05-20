// /pages/api/proxy-image.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const imageUrl = req.query.url as string;
  if (!imageUrl) return res.status(400).send("Missing image URL");

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    res.setHeader(
      "Content-Type",
      response.headers.get("Content-Type") || "image/jpeg"
    );
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allows canvas to use it
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Failed to fetch image");
  }
}
