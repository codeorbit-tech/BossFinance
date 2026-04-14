Add an Expense Tracker section to the existing 
Boss Finance & Consulting Admin Panel.

TECH: Next.js + Tailwind CSS (same as existing project)
THEME: Dark green (#1a3d2b), Bright green (#2d8a4e), White

===================
PAGE: EXPENSE TRACKER
===================

Add "Expense Tracker" to the sidebar navigation
between "Repayment Tracker" and "Notifications".

===================
SECTION 1: SUMMARY CARDS (top row)
===================

4 bold stat cards:

1. Capital Deployed
   - Total principal currently lent out (active loans)
   - Subtext: "Across X active loans"

2. Capital Recovered
   - Total principal collected back so far
   - Subtext: "X% of deployed capital"

3. Net Profit
   - Total income minus total expenses
   - Subtext: "This month"
   - Green if positive, red if negative

4. Collection Efficiency
   - (Total Collected ÷ Total Expected) × 100
   - Shown as percentage with progress bar
   - Color: green >80%, yellow 60-80%, red <60%

===================
SECTION 2: TWO BOXES SIDE BY SIDE
===================

BOX 1 — DAILY / WEEKLY VIEW
Header: "Daily / Weekly Overview"
Toggle at top: [ Today ] [ This Week ]

Fields shown:
- Expected Collection (₹)
- Actual Collection (₹)
- Collection Gap (Expected - Actual)
- Penal Interest Collected (₹)
- Expenses for this period (₹)
- Net for this period (₹)
- No. of payments received
- No. of payments missed

Color coding:
- Actual < Expected → red
- Actual = Expected → green
- Actual > Expected → blue (overpaid/advance)

BOX 2 — MONTHLY VIEW
Header: "Monthly Overview"
Dropdown: Select Month (Jan 2025 - current month)

Fields shown:
- Expected Collection (₹)
- Actual Collection (₹)
- Collection Gap (₹)
- Penal Interest Collected (₹)
- Processing Fees Collected (₹)
- Foreclosure Income (₹)
- Total Income (₹)
- Total Expenses (₹)
- Gross Profit (₹)
- Net Profit (₹)
- Month over Month change (% arrow up/down)

===================
SECTION 3: INCOME TABLE
===================

Header: "Income Breakdown"
Period filter: Today / This Week / This Month / 
               Custom Date Range

Table columns:
- Date
- Customer ID
- Customer Name
- Loan Type
- Payment Type (EMI / Penal / Processing Fee / 
  Foreclosure)
- Amount (₹)
- Channel (Razorpay Autopay / Cash / UPI)
- Status (Received / Pending / Failed)

Footer row: Total received for selected period

Export button: Download as .xlsx

===================
SECTION 4: EXPENSE TABLE
===================

Header: "Expense Breakdown"
Manual entry — admin adds expenses here

ADD EXPENSE button → opens modal with:
- Date (date picker)
- Category dropdown:
  * Staff Salary
  * Office Rent
  * Travel / Collection Expense
  * Stationary / Printing
  * Software / Tools
  * Legal / Documentation
  * Miscellaneous
- Description (text field)
- Amount (₹)
- Period: One-time / Daily / Weekly / Monthly
- Save button

Expense Table columns:
- Date
- Category
- Description
- Amount (₹)
- Period
- Added by
- Actions (Edit / Delete)

Footer row: Total expenses for selected period

Export button: Download as .xlsx

===================
SECTION 5: PROFITABILITY SECTION
===================

Header: "Profitability Overview"
Period filter: This Month / This Quarter / 
               This Year / All Time

Cards row:
1. Gross Profit
   - Total Income − Total Expenses
   
2. Net Profit
   - After estimated tax (admin can set tax % 
     in settings)
   
3. IRR (Internal Rate of Return)
   - Estimated annualized return on deployed capital
   - Show per loan type breakdown below
   
4. ROI
   - (Net Profit ÷ Capital Deployed) × 100
   - Shown as percentage

5. Default Rate
   - (NPA count ÷ Total customers) × 100
   - Red if > 5%

6. Repayment Rate
   - (On-time payments ÷ Total due payments) × 100

===================
SECTION 6: CHARTS
===================

Chart 1 — Monthly Income vs Expense (Bar Chart)
- X axis: Last 6 months
- Two bars per month: Income (green) / Expense (red)
- Line overlay: Net profit trend

Chart 2 — Loan Type wise Profit Breakdown 
(Donut/Pie Chart)
- Home Loan / Vehicle Loan / Personal Loan / 
  Business Loan / Daily Loan
- Shows which loan type generates most profit

Chart 3 — Collection Efficiency by Week (Line Chart)
- X axis: Last 8 weeks
- Y axis: Collection efficiency %
- Green line

Chart 4 — Employee wise Collections (Bar Chart)
- Which employee brings in the most collections
- Bars per employee per month

===================
SECTION 7: HOLIDAY AWARE PENALTY RULE
===================

System rule (backend logic):
- If a daily loan payment due date falls on a 
  Sunday OR a listed public holiday:
  * Automatically shift due date to next 
    working day
  * Do NOT apply penal interest for that gap
  * Show shifted due date in payment history
  * Add note: "Due date shifted - Public Holiday"

Holiday Manager (in Settings page):
- Table of holidays: Date, Name, Type 
  (National/State), State
- Add Holiday button
- Edit / Delete per row
- Pre-loaded with Tamil Nadu 2025-2026 holidays:
  * Jan 14 - Pongal
  * Jan 15 - Thiruvalluvar Day  
  * Jan 26 - Republic Day
  * Apr 14 - Tamil New Year
  * May 01 - May Day
  * Aug 15 - Independence Day
  * Oct 02 - Gandhi Jayanti
  * Oct 20 - Diwali
  * Dec 25 - Christmas
- Admin can add new holidays every year

Working Days config (in Settings):
- Toggle: Count Saturdays as working day? 
  (Yes / No)
- Sundays always off by default

===================
DUMMY DATA TO USE
===================

Income entries:
- 45 payment records across Jan-Jun 2025
- Mix of EMI, penal interest, processing fees
- From all 5 existing customers
- Total income: ~₹52,000

Expense entries:
- Staff Salary: ₹15,000/month (2 employees)
- Office Rent: ₹5,000/month
- Travel: ₹2,000/month
- Stationary: ₹500/month
- Software/Tools: ₹2,500/month
- Misc: ₹1,000/month
- Total expenses: ~₹26,000/month

Profitability:
- Monthly gross profit: ~₹26,000
- IRR: ~24% per annum
- Collection efficiency: 78%
- Default rate: 20% (1 NPA out of 5)
- Repayment rate: 82%

===================
IMPORTANT RULES
===================
- All amounts in Indian Rupees (₹)
- All charts use Recharts library
- Mobile responsive
- Skeleton loaders on all tables
- Export to .xlsx using exceljs library
- Toast notifications for add/edit/delete expense
- Empty states when no data
- Negative profit shown in red
- Positive profit shown in green
- No actual API calls — use dummy data
- Keep same dark green brand theme throughout