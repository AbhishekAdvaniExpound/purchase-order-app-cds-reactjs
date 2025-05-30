# 🧾 Purchase Order Workflow Dashboard

A full-stack SAP Fiori-style Purchase Order system built using **SAP CAP (Cloud Application Programming Model)** for the backend and **React + Chakra UI** for the frontend.

This app enables multi-role users (Buyers, Approvers) to create, review, approve, and mark purchase orders as ordered. It includes a KPI dashboard, real-time status management, and a modern UI aligned with SAP Fiori principles.

---

## 🔧 Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Backend    | SAP CAPM (CDS + Node.js), SQLite   |
| Frontend   | React.js with Chakra UI            |
| API Format | REST (enabled via CAP config)      |
| UI Style   | SAP Fiori-inspired (custom Chakra) |
| Database   | SQLite (local development)         |

---

## 📦 Features

### ✅ Purchase Order Workflow

- Create purchase orders (POs) with metadata and items
- Three-stage status: **PENDING → APPROVED → ORDERED**
- Approve/Order with single click + real-time refresh
- Status icons: ⏳ Pending, ✅ Approved, 🚚 Ordered

### 📊 KPI Dashboard

- Total PO count
- Status-wise count
- Total order value
- Round icon-based KPI cards with live API

### 🔍 Table Filtering

- Filter orders by `PENDING`, `APPROVED`, `ORDERED`
- Real-time table updates on status changes

### 🌐 REST API Support

- `/rest/purchase-order/getKPIs`
- `/rest/purchase-order` for PO CRUD
- Can be consumed by external apps easily

---

---

## 🚀 Running the App Locally

### Backend (CAP Server)

```bash
cd cap-backend
npm install
npm start
```
