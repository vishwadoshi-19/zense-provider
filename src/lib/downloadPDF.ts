// Removed unused import

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
    image: { type: "jpeg", quality: 0.98 },
    enableLinks: true,
    html2canvas: { useCORS: true }, // Added scale for better rendering
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // Ensure proper scaling for images
  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.width = "8.27in"; // A4 width in inches
  clonedElement.style.height = "11.69in"; // A4 height in inches
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
  clonedElement.style.transform = "scale(1)";
  clonedElement.style.transformOrigin = "top left";
  html2pdf().set(opt).from(clonedElement).save();
};
