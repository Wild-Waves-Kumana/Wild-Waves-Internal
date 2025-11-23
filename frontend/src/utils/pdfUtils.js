import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPDF = async (elementId, filename = "document.pdf") => {
  try {
    console.log("Starting PDF generation for element:", elementId);

    const element = document.getElementById(elementId);

    if (!element) {
      console.error("Element not found:", elementId);
      throw new Error(`Element with id "${elementId}" not found`);
    }

    console.log("Element found, generating canvas...");

    // Generate canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: "#ffffff",
      windowWidth: 794, // A4 width in pixels at 96 DPI
      windowHeight: 1123, // A4 height in pixels at 96 DPI
    });

    console.log("Canvas generated successfully");

    const imgData = canvas.toDataURL("image/png");

    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    console.log("Adding image to PDF...");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    console.log("Saving PDF:", filename);
    pdf.save(filename);

    console.log("PDF downloaded successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
    throw error;
  }
};
