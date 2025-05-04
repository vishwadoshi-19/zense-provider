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
    margin: 0.5,
    filename: `${fileName}_Resume.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf().set(opt).from(element).save();
};
