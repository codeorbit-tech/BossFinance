# Boss Finance & Consulting — Loan Management System

> **Domain:** thebossfinance.com
> **Type:** Internal admin tool (no public pages)
> **Entry point:** Login screen
> **Live Deployment:** https://boss-finance-80gk5f5or-codeorbit-techs-projects.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (username + password) |
| PDF Generation | Puppeteer |
| Payments | Razorpay (autopay / e-mandate) |
| Notifications | Twilio (SMS + WhatsApp) |
| Data Sync | Google Sheets API |
| Hosting | Hostinger VPS |

---

## Brand

| Property | Value |
|---|---|
| Name | Boss Finance & Consulting |
| Logo | "B" with house/roof icon |
| Primary | Dark green `#1a3d2b` |
| Accent | Bright green `#2d8a4e` |
| Background | White |

---

## Design System (Emerald Ledger — from Stitch)

| Token | Hex | Usage |
|---|---|---|
| Primary | `#00280f` | Sidebar, authority zones |
| Accent | `#57b171` | CTAs, success states |
| Secondary | `#426651` | Supportive elements |
| Tertiary (Ink) | `#1f1f33` | Headlines, data |
| Error | `#ba1a1a` | Overdue, destructive |
| Surface | `#f8f9fa` | Base background |
| Fonts | Manrope (headlines) + Inter (body/labels) | — |

**Design Principles:**
- No 1px borders — use tonal layering for separation
- Asymmetrical stat cards with atmospheric gradients
- Right-aligned financial data in tables
- Pill-shaped status badges with high-saturation text on low-saturation backgrounds

---

## Roles

| Role | Access |
|---|---|
| **EMPLOYEE** | Create customers, submit loan applications, view own submissions |
| **ADMIN** | Full dashboard, manage customers/loans, approve/reject, notifications, settings |

---

## Employee Panel

### 1. Login
- Username + password → JWT token

### 2. Create Customer
- Form with customer fields (to be provided by client, placeholders for now)
- Auto-generate unique Customer ID
- Save to PostgreSQL

### 3. Loan Application Form
- Loan types: Home / Vehicle / Personal / Business / Daily
- On submit: generate PDF → send to admin → sync to Google Sheets → confirmation

### 4. My Submissions
- List of submitted applications
- Status: Pending / Approved / Rejected

---

## Admin Panel

### 1. Dashboard
- Stat cards: Total Customers, Total Loans Sanctioned (₹), Total Collected (₹), Overdue count
- Recent activity feed
- Quick search by Customer ID

### 2. Customers Page
- **Filters:** Loan type, Frequency (Daily/Weekly/Monthly), Status (Active/Closed/Overdue/Pending), Search
- **Table:** Customer ID, Name, Loan Type, Amount, EMI, Status, Next Due Date
- Click row → Customer Detail page

### 3. Customer Detail Page
- Full profile: personal + loan details
- Repayment history timeline
- Edit button → OTP modal (6-digit) → save on verify
- OTP sent via Twilio SMS to admin phone
- All edits logged with audit trail (timestamp, field, old value, new value)

### 4. Loan Applications Page
- PDF submissions from employees
- Columns: Customer Name, Loan Type, Amount, Date, Employee, Status
- Approve (green) / Reject (red) buttons
- On approve: activate Razorpay autopay → SMS + WhatsApp to customer → update DB + Sheets
- View PDF inline in modal

### 5. Repayment Tracker
- Table: Customer ID, Name, Loan Amount, Total Paid, Outstanding, EMI, Last Payment, Next Due, Status
- Status badges: Paid / Overdue / Upcoming / Cleared
- Filters: Due today / This week / This month / Overdue / Loan type / Frequency

### 6. Notifications Page
- **Send tab:** Search customer / Bulk send, Channel (SMS/WhatsApp/Both), Templates (Loan Approved, EMI Reminder, Overdue Alert, Payment Received, Custom), editable preview
- **History tab:** Customer, channel, message, time, delivery status

### 7. Settings
- Admin phone number (for OTP)
- Change password
- Google Sheets sync status + manual sync button

### 8. Sidebar
- Logo + "Boss Finance & Consulting"
- Nav: Dashboard / Customers / Loan Applications / Repayment Tracker / Notifications / Settings
- Admin name + logout at bottom
- Collapsible on mobile

---

## System Rules

- All amounts in Indian Rupees (₹)
- Mobile responsive throughout
- Skeleton loaders on all tables
- Toast notifications for all actions
- Empty states with helpful messages
- **Status badge colors:** Active → green, Overdue → red, Pending → yellow, Closed → grey
- JWT auth with token expiry
- All sensitive keys in `.env`
- Customer data encrypted in DB
- Audit trail on every admin edit
- Google Sheets auto-sync on form submit and status change

---

## Folder Structure

```
/boss-finance
  /frontend (Next.js)
    /app
      /login
      /employee
        /dashboard
        /create-customer
        /loan-form
        /submissions
      /admin
        /dashboard
        /customers
        /loan-applications
        /repayments
        /notifications
        /settings
    /components
    /lib
  /backend (Node/Express)
    /routes
      auth.js
      customers.js
      loans.js
      repayments.js
      notifications.js
      sheets.js
    /middleware
      auth.js
      otp.js
    /models
    /utils
      pdf.js
      twilio.js
      razorpay.js
      sheets.js
  /prisma (DB schema)
```

---

## Build Order

1. Set up folder structure
2. Initialize Next.js frontend + Express backend
3. Set up PostgreSQL with Prisma ORM
4. Build auth system (JWT login for both roles)
5. Build employee panel
6. Build admin panel
7. Integrate Razorpay, Twilio, Google Sheets
8. PDF generation

> **Note:** Loan form fields will be provided by client later. Use placeholder fields for now. Use realistic Indian dummy data for testing.
