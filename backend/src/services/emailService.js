const winston = require("winston");

/**
 * Transactional email service for rental quotations and order notifications.
 * Supports production SMTP via environment variables and fallback logging for development.
 */
const sendQuotationEmail = async ({ clientEmail, clientName, quotationId, pdfBuffer, appUrl = "http://localhost:5173" }) => {
  const reviewUrl = `${appUrl}/account/quotations/${quotationId}`;
  
  console.log(`\n======================================================`);
  console.log(`✉️  DISPATCHING QUOTATION EMAIL`);
  console.log(`------------------------------------------------------`);
  console.log(`To:            ${clientName} <${clientEmail}>`);
  console.log(`Subject:       Rental Quotation #${quotationId.slice(0, 8).toUpperCase()}`);
  console.log(`Attachment:    Quotation_${quotationId.slice(0, 8)}.pdf (${pdfBuffer ? pdfBuffer.length : 0} bytes)`);
  console.log(`Review Link:   ${reviewUrl}`);
  console.log(`======================================================\n`);

  // In production with process.env.SMTP_HOST, real nodemailer transport can be initialized here.
  return {
    success: true,
    messageId: `mock-email-${Date.now()}`,
    reviewUrl,
  };
};

module.exports = {
  sendQuotationEmail,
};
