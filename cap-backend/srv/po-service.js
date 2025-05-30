/* eslint-disable no-console */
const cds = require("@sap/cds");

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
});
