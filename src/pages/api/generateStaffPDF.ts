import { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { staff, reviews, groupedDuties } = req.body;
    if (!staff || !groupedDuties) {
      return res.status(400).json({ error: "Missing staff or duties data" });
    }

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    let buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${(staff.name || staff.fullName || "Staff")}_Resume.pdf"`
      );
      res.status(200).end(pdfData);
    });

    // --- PDF Layout ---
    // Colors
    const teal = "#14b8a6";
    const gray = "#444";
    const lightGray = "#f1f5f9";
    const sectionTitleSize = 13;
    const labelSize = 10;
    const valueSize = 11;
    const chipSize = 9;
    const dividerColor = "#e0f2f1";

    // Layout constants
    const pageWidth = 595.28 - 72; // A4 width - margins (36px each side)
    const colGap = 28;
    const colWidth = (pageWidth - colGap) / 2;
    const leftX = 36;
    const rightX = leftX + colWidth + colGap;
    let y = 48;

    // Profile Photo (circle)
    doc.save();
    doc.circle(leftX + colWidth / 2, y + 54, 54).fill(teal);
    doc.restore();
    doc.image(
      staff.jobRole === "nurse"
        ? staff.gender === "male"
          ? "public/uploads/nurse_male.png"
          : "public/uploads/nurse_female.png"
        : staff.gender === "male"
        ? "public/uploads/attendant_male.png"
        : "public/uploads/attendant_female.png",
      leftX + colWidth / 2 - 48,
      y + 10,
      { width: 96, height: 96, fit: [96, 96], align: "center" }
    );
    y += 120;

    // Name & Role
    doc
      .fontSize(20)
      .fillColor(teal)
      .font("Helvetica-Bold")
      .text(staff.name || staff.fullName || "Staff", leftX, y, { width: colWidth, align: "center" });
    y += 26;
    doc
      .fontSize(12)
      .fillColor(gray)
      .font("Helvetica")
      .text(staff.jobRole ? staff.jobRole.charAt(0).toUpperCase() + staff.jobRole.slice(1) : "Staff", leftX, y, { width: colWidth, align: "center" });
    y += 18;

    // Divider
    doc.save();
    doc.moveTo(leftX + 10, y).lineTo(leftX + colWidth - 10, y).lineWidth(1).strokeColor(dividerColor).stroke();
    doc.restore();
    y += 12;

    // Details
    doc
      .fontSize(sectionTitleSize)
      .fillColor(teal)
      .font("Helvetica-Bold")
      .text("Details", leftX, y, { width: colWidth, align: "left" });
    y += 16;
    doc
      .fontSize(labelSize)
      .fillColor(gray)
      .font("Helvetica")
      .text(`Experience: `, leftX, y, { continued: true })
      .fontSize(valueSize)
      .fillColor(gray)
      .text(`${staff.experienceYears || "<1"} yrs`);
    y += 13;
    doc
      .fontSize(labelSize)
      .fillColor(gray)
      .text(`Education: `, leftX, y, { continued: true })
      .fontSize(valueSize)
      .fillColor(gray)
      .text(staff.educationQualification || "N/A");
    y += 13;
    doc
      .fontSize(labelSize)
      .fillColor(gray)
      .text(`Native State: `, leftX, y, { continued: true })
      .fontSize(valueSize)
      .fillColor(gray)
      .text(staff.district || "N/A");
    y += 18;

    // Preferences
    doc.fontSize(sectionTitleSize).fillColor(teal).font("Helvetica-Bold").text("Preferences", leftX, y, { width: colWidth });
    y += 16;
    doc.fontSize(labelSize).fillColor(gray).font("Helvetica").text(`Eats: `, leftX, y, { continued: true }).fontSize(valueSize).text(staff.foodPreference || "N/A");
    y += 13;
    doc.fontSize(labelSize).fillColor(gray).text(`Smoking: `, leftX, y, { continued: true }).fontSize(valueSize).text(staff.smokes || "N/A");
    y += 13;
    doc.fontSize(labelSize).fillColor(gray).text(`Shift Type: `, leftX, y, { continued: true }).fontSize(valueSize).text(staff.shiftType ? staff.shiftType.toUpperCase() : "N/A");
    y += 13;
    doc.fontSize(labelSize).fillColor(gray).text(`Shift Time: `, leftX, y, { continued: true }).fontSize(valueSize).text(staff.shiftTime ? staff.shiftTime.toUpperCase() : "N/A");
    y += 18;

    // Verification
    doc.fontSize(sectionTitleSize).fillColor(teal).font("Helvetica-Bold").text("Verification", leftX, y, { width: colWidth });
    y += 16;
    doc.fontSize(labelSize).fillColor(gray).font("Helvetica").text(`Aadhar: `, leftX, y, { continued: true }).fontSize(valueSize).text(staff.identityDocuments?.aadharNumber || "N/A");
    y += 18;

    // Right column: Services
    let y2 = 48;
    doc.fontSize(15).fillColor(teal).font("Helvetica-Bold").text("Services I Offer", rightX, y2, { width: colWidth, align: "left" });
    y2 += 22;
    Object.entries(groupedDuties).forEach(([category, group]: any) => {
      const selectedMandatory = group.mandatory.filter((duty: any) => staff.services?.[category]?.includes(duty.label));
      const selectedOptional = group.optional.filter((duty: any) => staff.services?.[category]?.includes(duty.label));
      if (selectedMandatory.length === 0 && selectedOptional.length === 0) return;
      doc.fontSize(sectionTitleSize).fillColor(teal).font("Helvetica-Bold").text(category, rightX, y2, { width: colWidth });
      y2 += 13;
      // Chips for services
      let chipX = rightX;
      let chipY = y2;
      const chipGap = 5;
      const chipHeight = 16;
      const chipPad = 7;
      doc.fontSize(chipSize); // Set font size before measuring
      [...selectedMandatory, ...selectedOptional].forEach((duty: any, idx: number) => {
        const chipWidth = doc.widthOfString(duty.label) + chipPad * 2;
        if (chipX + chipWidth > rightX + colWidth) {
          chipX = rightX;
          chipY += chipHeight + chipGap;
        }
        doc
          .roundedRect(chipX, chipY, chipWidth, chipHeight, 7)
          .fillAndStroke(duty.mandatoryFor.includes(staff.jobRole) ? teal : "#3b82f6", dividerColor)
          .fillColor("#222")
          .fontSize(chipSize)
          .text(duty.label, chipX + chipPad, chipY + 3, { width: chipWidth - chipPad * 2, align: "center" });
        chipX += chipWidth + chipGap;
      });
      y2 = chipY + chipHeight + 10;
      // Section divider
      doc.save();
      doc.moveTo(rightX + 5, y2 - 3).lineTo(rightX + colWidth - 5, y2 - 3).lineWidth(0.7).strokeColor(dividerColor).stroke();
      doc.restore();
      y2 += 2;
    });

    // Reviews at the bottom (if space allows)
    let reviewsY = Math.max(y, y2) + 24;
    if (reviews && reviews.length > 0 && reviewsY < 750) {
      doc
        .fontSize(sectionTitleSize)
        .fillColor(teal)
        .font("Helvetica-Bold")
        .text("What others say", leftX, reviewsY, { width: pageWidth });
      reviewsY += 16;
      reviews.slice(0, 2).forEach((review: any) => {
        doc
          .fontSize(10)
          .fillColor(gray)
          .font("Helvetica-Oblique")
          .text(`"${review.text}"`, leftX, reviewsY, { width: pageWidth });
        reviewsY += 14;
        doc.fontSize(9).fillColor(teal).font("Helvetica-Bold").text(`- ${review.customerName || review.name}`, leftX, reviewsY, { width: pageWidth });
        reviewsY += 13;
      });
    }

    // Ensure 1 page only
    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
} 