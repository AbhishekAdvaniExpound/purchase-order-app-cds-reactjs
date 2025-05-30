import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4004/rest/purchase-order",
});

export const fetchOrders = () => API.get("/PurchaseOrder");
export const approvePO = (ID) => API.post("/approvePO", { ID });
export const orderPO = (ID) => API.post("/markAsOrdered", { ID });
export const createPO = (data) => API.post("/PurchaseOrder", data);
