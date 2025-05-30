/* eslint-disable no-console */
const cds = require("@sap/cds");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const { Readable } = require("stream");

module.exports = cds.service.impl(async function () {
  const { PurchaseOrder } = this.entities;

  this.on("approvePO", async (req) => {
    const ID = req.data.ID;
    console.log("Approving PO with ID:", ID);
    const tx = cds.transaction(req);
    const orders = await tx.read(PurchaseOrder).where({ ID });
    console.log("orders:", orders);

    const order = orders[0]; // ✅ Extract the first result
    if (!order || order.status != "PENDING") {
      return req.error(400, "Only PENDING orders can be approved.");
    }
    await tx.update(PurchaseOrder).set({ status: "APPROVED" }).where({ ID });
  });

  this.on("markAsOrdered", async (req) => {
    const ID = req.data.ID;
    const tx = cds.transaction(req);
    const orders = await tx.read(PurchaseOrder).where({ ID });
    const order = orders[0]; // ✅ Extract the first result
    if (!order || order.status !== "APPROVED") {
      return req.error(400, "Only APPROVED orders can be marked as ORDERED.");
    }
    await tx.update(PurchaseOrder).set({ status: "ORDERED" }).where({ ID });
  });

  this.on("getKPIs", async (req) => {
    const tx = cds.transaction(req);

    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      orderedOrders,
      totalAmountRows,
    ] = await Promise.all([
      tx.run(SELECT.from(PurchaseOrder).columns("count(1) as count")),
      tx.run(
        SELECT.from(PurchaseOrder)
          .where({ status: "PENDING" })
          .columns("count(1) as count")
      ),
      tx.run(
        SELECT.from(PurchaseOrder)
          .where({ status: "APPROVED" })
          .columns("count(1) as count")
      ),
      tx.run(
        SELECT.from(PurchaseOrder)
          .where({ status: "ORDERED" })
          .columns("count(1) as count")
      ),
      tx.run(SELECT.from(PurchaseOrder).columns("totalAmount")),
    ]);

    const totalAmount = totalAmountRows.reduce(
      (sum, row) => sum + Number(row.totalAmount || 0),
      0
    );

    return {
      totalOrders: totalOrders[0].count,
      pendingOrders: pendingOrders[0].count,
      approvedOrders: approvedOrders[0].count,
      orderedOrders: orderedOrders[0].count,
      totalAmount,
    };
  });

  this.on("generatePDF", async (req) => {
    const { ID } = req.data;

    const tx = cds.transaction(req);
    const [po] = await tx.run(SELECT.from(PurchaseOrder).where({ ID }));

    if (!po) return req.error(404, "Purchase Order not found");

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    // Set headers
    req._.res.setHeader("Content-Type", "application/pdf");
    req._.res.setHeader("Content-Disposition", `inline; filename=PO-${ID}.pdf`);

    doc.pipe(req._.res); // pipe PDF directly to response

    // Sample PDF content
    doc.fontSize(18).text("Purchase Order", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`PO ID: ${po.ID}`);
    doc.text(`Title: ${po.title}`);
    doc.text(`Status: ${po.status}`);
    doc.text(`Total Amount: ₹${po.totalAmount}`);

    doc.end();

    return; // ❌ No return needed since we're streaming
  });

  this.on("emailPDF", async (req) => {
    const { ID, email } = req.data;
    const tx = cds.transaction(req);
    const [po] = await tx.run(SELECT.from(PurchaseOrder).where({ ID }));

    if (!po) return req.error(404, "Purchase Order not found");

    // Generate PDF in memory
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "your-email@gmail.com",
          pass: "your-app-password", // Use App Password or OAuth2
        },
      });

      await transporter.sendMail({
        from: '"PO System" <your-email@gmail.com>',
        to: email,
        subject: `PO #${po.ID}`,
        text: "Attached is your PO PDF",
        attachments: [
          {
            filename: `PO-${po.ID}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    });

    doc.text("Purchase Order").moveDown();
    doc.text(`PO ID: ${po.ID}`);
    doc.text(`Title: ${po.title}`);
    doc.text(`Status: ${po.status}`);
    doc.text(`Amount: ₹${po.totalAmount}`);
    doc.end();

    return "Email sent.";
  });
});
