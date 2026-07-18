const PDFDocument = require("pdfkit");

const generateQuotationPDFBuffer = (quotation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header Section
      doc.fontSize(20).text("RENTAL QUOTATION", { align: "right" });
      doc.fontSize(10).text(`Quotation ID: ${quotation.id.slice(0, 8).toUpperCase()}`, { align: "right" });
      doc.text(`Status: ${quotation.status}`, { align: "right" });
      doc.moveDown();

      // Vendor Details
      doc.fontSize(12).font("Helvetica-Bold").text("Vendor Company:");
      doc.font("Helvetica").fontSize(10).text(quotation.vendor?.companyName || `Vendor: ${quotation.vendorId.slice(0, 8)}`);
      if (quotation.vendor?.email) doc.text(`Contact Email: ${quotation.vendor.email}`);
      if (quotation.vendor?.gstNo) doc.text(`GST No: ${quotation.vendor.gstNo}`);
      doc.moveDown();

      // Client Details
      doc.font("Helvetica-Bold").text("Prepared For:");
      doc.font("Helvetica").text(`Client Name: ${quotation.client ? `${quotation.client.firstName} ${quotation.client.lastName}` : "Valued Customer"}`);
      if (quotation.client?.email) {
        doc.text(`Email: ${quotation.client.email}`);
      }
      if (quotation.client?.phone) {
        doc.text(`Phone: ${quotation.client.phone}`);
      }
      doc.moveDown(1.5);

      // Divider Line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown();

      // Items Table Header
      doc.font("Helvetica-Bold").text("Items / Products", 50);
      doc.text("Qty", 250);
      doc.text("Dates", 300);
      doc.moveDown(0.5);

      let y = doc.y;
      doc.moveTo(50, y).lineTo(550, y).strokeColor("#eeeeee").stroke();
      doc.moveDown(0.5);

      // Items Table Body
      doc.font("Helvetica").fontSize(9);
      (quotation.items || []).forEach(item => {
        const prodName = item.product?.name || "Rental Product";
        const startStr = item.rentalStart ? new Date(item.rentalStart).toISOString().split("T")[0] : "";
        const endStr = item.rentalEnd ? new Date(item.rentalEnd).toISOString().split("T")[0] : "";

        doc.text(prodName, 50, doc.y, { width: 180 });
        doc.text(item.quantity.toString(), 250, doc.y - 10);
        doc.text(`${startStr} to ${endStr}`, 300, doc.y - 10, { width: 170 });
        doc.moveDown(0.5);
      });

      doc.moveDown(2);
      
      // Footer / Terms
      doc.fontSize(10).font("Helvetica-Bold").text("Terms & Conditions:");
      doc.font("Helvetica").text(`- Validity: ${quotation.quotationValidityDays || 7} days from creation.`);
      doc.text(`- Downpayment / Payment Required: ${quotation.paymentTermsPercent || 100}%.`);
      
      if (quotation.quotationTemplate?.footerHtml) {
        doc.moveDown(0.5);
        const cleanFooter = quotation.quotationTemplate.footerHtml.replace(/<[^>]*>?/gm, '');
        doc.text(`- Template Terms: ${cleanFooter}`);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const generateInvoicePDF = (invoice, resStream) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(resStream);

  // Header Section
  doc.fontSize(20).text("INVOICE", { align: "right" });
  doc.fontSize(10).text(`Invoice No: ${invoice.invoiceNumber}`, { align: "right" });
  doc.text(`State: ${invoice.state}`, { align: "right" });
  doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : ""}`, { align: "right" });
  doc.moveDown();

  // Invoice Details
  doc.fontSize(12).font("Helvetica-Bold").text("Invoice Details:");
  doc.font("Helvetica").fontSize(10).text(`Invoice ID: ${invoice.id}`);
  doc.text(`Order ID: ${invoice.orderId || "N/A"}`);
  doc.moveDown();

  // Divider Line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
  doc.moveDown();

  // Items Table Header
  doc.font("Helvetica-Bold").text("Item Description", 50);
  doc.text("Qty", 280);
  doc.text("Unit Price", 340);
  doc.text("Tax %", 420);
  doc.text("Amount", 480);
  doc.moveDown(0.5);

  let y = doc.y;
  doc.moveTo(50, y).lineTo(550, y).strokeColor("#eeeeee").stroke();
  doc.moveDown(0.5);

  // Items Table Body
  doc.font("Helvetica").fontSize(9);
  (invoice.lines || []).forEach(line => {
    const prodName = line.product?.name || "Rental Charge";
    doc.text(prodName, 50, doc.y, { width: 220 });
    doc.text(Number(line.quantity).toString(), 280, doc.y - 10);
    doc.text(`$${Number(line.unitPrice).toFixed(2)}`, 340, doc.y - 10);
    doc.text(`${invoice.taxPercent}%`, 420, doc.y - 10);
    doc.text(`$${Number(line.amount).toFixed(2)}`, 480, doc.y - 10);
    doc.moveDown(0.5);
  });

  doc.moveDown(2);

  // Totals Section
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text(`Subtotal: $${Number(invoice.untaxedAmount).toFixed(2)}`, { align: "right" });
  doc.text(`Tax Amount: $${Number(invoice.taxAmount).toFixed(2)}`, { align: "right" });
  doc.fontSize(12).text(`Total Amount: $${Number(invoice.totalAmount).toFixed(2)}`, { align: "right" });

  doc.end();
};

module.exports = {
  generateQuotationPDFBuffer,
  generateInvoicePDF,
};
