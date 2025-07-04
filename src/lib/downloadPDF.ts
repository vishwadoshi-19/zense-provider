// Removed unused import

import { Scale } from "lucide-react";
import { cloneElement } from "react";

// lib/downloadPDF.ts
export const downloadResumeAsPDF = async (
  elementId: string,
  fileName: string
) => {
  if (typeof window === "undefined") return;

  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.getElementById(elementId);
  if (!element) return;

  const opt = {
    margin: 0,
    filename: `${fileName}_Resume.pdf`,
    pagebreak: { mode: ["avoid-all", "css"] },
    image: { type: "jpeg", quality: 1 },
    enableLinks: true,
    html2canvas: { useCORS: true, Scale: 2 }, // Added scale for better rendering
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // Ensure proper scaling for images
  // const clonedElement = element.cloneNode(true) as HTMLElement;
  // clonedElement.style.width = "8.27in"; // A4 width in inches
  // clonedElement.style.height = "11.69in"; // A4 height in inches
  // clonedElement.style.overflow = "hidden"; // Hide
  // clonedElement.style.position = "absolute"; // Position it absolutely
  // clonedElement.style.top = "0"; // Align to top
  // clonedElement.style.left = "0"; // Align to left
  // clonedElement.style.zIndex = "-1"; // Send it to the back
  // clonedElement.style.opacity = "0"; // Make it invisible
  // clonedElement.style.transition = "none"; // Disable transitions
  // clonedElement.style.width = "100%"; // Set width to 100%
  // clonedElement.style.height = "100%"; // Set height to 100%
  // clonedElement.style.position = "fixed"; // Fixed position
  // clonedElement.style.top = "0"; // Align to top
  // clonedElement.style.transform = "scale(1)";
  // clonedElement.style.transformOrigin = "top left";
  html2pdf().set(opt).from(element).save();
};

export async function generateStaffPDFReport(
  staff: any,
  groupedDuties: any,
  reviews: any[]
) {
  try {
    const response = await fetch(
      "https://api-4zhceyc45a-uc.a.run.app/generateStaffPDF",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staff,
          groupedDuties,
          reviews,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers.get("content-disposition");
    let filename = `${staff.name || staff.fullName || "Staff"} Resume.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("❌ Error generating staff PDF:", error);
    throw error;
  }
}
