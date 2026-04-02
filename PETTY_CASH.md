# Petty Cash Module — Design & Implementation Guide

> School: EduSync International School | Managed by: Admin / Accountant / Principal

---

## What is Petty Cash?

Petty cash is a small fund kept at school for day-to-day minor expenses —
stationery, cleaning supplies, courier charges, small repairs, refreshments for
meetings, etc. The Accountant manages the fund, records every expense, and
periodically replenishes it from the main account.

---

## Database Tables

### 1. `petty_cash_fund`
Tracks the current balance and top-up history of the petty cash fund.

```sql
CREATE TABLE IF NOT EXISTS petty_cash_fund (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  amount       DECIMAL(10,2) NOT NULL,          -- amount added to fund
  balance_after DECIMAL(10,2) NOT NULL,          -- running balance after this entry
  type         ENUM('Opening','Top-up','Adjustment') NOT NULL DEFAULT 'Top-up',
  note         VARCHAR(255),
  added_by     INT NOT NULL,                     -- users.id
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id)
);
```

### 2. `petty_cash_expenses`
Every expense paid from the petty cash fund.

```sql
CREATE TABLE IF NOT EXISTS petty_cash_expenses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  expense_no   VARCHAR(15) NOT NULL UNIQUE,      -- e.g. PCE2025001
  date         DATE        NOT NULL,
  category     ENUM(
                 'Stationery',
                 'Cleaning & Supplies',
                 'Repairs & Maintenance',
                 'Courier & Postage',
                 'Refreshments',
                 'Printing',
                 'Transport',
                 'Miscellaneous'
               ) NOT NULL,
  description  VARCHAR(255) NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  paid_to      VARCHAR(100),                     -- vendor / person paid
  receipt_no   VARCHAR(50),                      -- physical receipt number
  approved_by  INT,                              -- users.id (Principal/Admin)
  recorded_by  INT NOT NULL,                     -- users.id (Accountant)
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);
```

### How balance works
- Opening balance → insert into `petty_cash_fund` with `type='Opening'`
- Each expense → deducted from running balance (calculated in query, not stored)
- Top-up → insert into `petty_cash_fund` with `type='Top-up'`
- Current balance = SUM of all fund entries − SUM of all expenses

---

## Migration — Run in MySQL

```sql
USE school_db;

CREATE TABLE IF NOT EXISTS petty_cash_fund (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  amount        DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  type          ENUM('Opening','Top-up','Adjustment') NOT NULL DEFAULT 'Top-up',
  note          VARCHAR(255),
  added_by      INT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS petty_cash_expenses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  expense_no   VARCHAR(15)  NOT NULL UNIQUE,
  date         DATE         NOT NULL,
  category     ENUM('Stationery','Cleaning & Supplies','Repairs & Maintenance',
                    'Courier & Postage','Refreshments','Printing',
                    'Transport','Miscellaneous') NOT NULL,
  description  VARCHAR(255) NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  paid_to      VARCHAR(100),
  receipt_no   VARCHAR(50),
  approved_by  INT,
  recorded_by  INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Seed: Opening balance ₹5,000
INSERT INTO petty_cash_fund (amount, balance_after, type, note, added_by)
VALUES (5000.00, 5000.00, 'Opening', 'Initial petty cash fund', 1);
```

---

## Backend

### Files to create

```
backend/models/PettyCashModel.js
backend/controllers/pettyCashController.js
backend/routes/pettyCash.js
```

### API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/petty-cash/summary` | Current balance + total spent | Admin, Accountant, Principal |
| GET | `/api/petty-cash/expenses` | All expenses (paginated, filterable by date/category) | Admin, Accountant, Principal |
| POST | `/api/petty-cash/expenses` | Add new expense | Accountant, Admin |
| DELETE | `/api/petty-cash/expenses/:id` | Delete expense | Admin only |
| GET | `/api/petty-cash/fund` | Fund top-up history | Admin, Principal |
| POST | `/api/petty-cash/fund` | Add top-up / adjustment | Admin, Principal |

### `PettyCashModel.js` key queries

```js
// Current balance
getSummary: () => db.query(`
  SELECT
    (SELECT IFNULL(SUM(amount), 0) FROM petty_cash_fund)          AS total_funded,
    (SELECT IFNULL(SUM(amount), 0) FROM petty_cash_expenses)      AS total_spent,
    (SELECT IFNULL(SUM(amount), 0) FROM petty_cash_fund)
      - (SELECT IFNULL(SUM(amount), 0) FROM petty_cash_expenses)  AS current_balance
`)

// All expenses with recorder name
getExpenses: () => db.query(`
  SELECT e.*, u.name AS recorded_by_name, ua.name AS approved_by_name
  FROM petty_cash_expenses e
  JOIN users u  ON e.recorded_by = u.id
  LEFT JOIN users ua ON e.approved_by = ua.id
  ORDER BY e.date DESC, e.id DESC
`)

// Add expense — auto-generate expense_no
addExpense: async (data) => {
  const [[{ max_id }]] = await db.query('SELECT MAX(id) AS max_id FROM petty_cash_expenses');
  const expense_no = `PCE${new Date().getFullYear()}${String((max_id || 0) + 1).padStart(3,'0')}`;
  // INSERT ...
}
```

### Register in `backend/index.js`
```js
app.use('/api/petty-cash', require('./routes/pettyCash'));
```

---

## Frontend

### Files to create

```
src/api/pettyCashApi.js
src/pages/PettyCash.jsx
```

### `pettyCashApi.js`
```js
export const pettyCashApi = {
  getSummary:   () => request('GET', '/petty-cash/summary'),
  getExpenses:  () => request('GET', '/petty-cash/expenses'),
  addExpense:   (body) => request('POST', '/petty-cash/expenses', body),
  deleteExpense:(id) => request('DELETE', `/petty-cash/expenses/${id}`),
  getFund:      () => request('GET', '/petty-cash/fund'),
  addTopUp:     (body) => request('POST', '/petty-cash/fund', body),
};
```

### `PettyCash.jsx` — Page Layout

```
┌─────────────────────────────────────────────────────┐
│  💰 Current Balance: ₹3,250     [+ Add Top-up]      │
│  Total Funded: ₹8,000  |  Total Spent: ₹4,750       │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Category breakdown (mini bar chart or pill counts)  │
│  Stationery ₹800 | Cleaning ₹500 | Repairs ₹1,200.. │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Expense Records                    [+ Add Expense]  │
│  Filter: [Date range] [Category ▾]                   │
│  ┌────┬──────────┬────────────┬──────────┬────────┐  │
│  │ #  │ Date     │ Category   │ Amount   │ Action │  │
│  │ 1  │ 15 Mar   │ Stationery │ ₹250     │ 🗑     │  │
│  └────┴──────────┴────────────┴──────────┴────────┘  │
└──────────────────────────────────────────────────────┘
```

### Add Expense Modal fields
- Date (default: today)
- Category (dropdown — 8 options)
- Description (text)
- Amount (₹)
- Paid To (optional)
- Receipt No (optional)

### Sidebar — where to add
Add under Fees Management, visible to `Principal`, `Admin`, `Accountant`:

```jsx
{ name: 'Petty Cash', path: '/petty-cash', icon: <Wallet size={20} /> }
```

### Route in `App.jsx`
```jsx
import PettyCash from './pages/PettyCash';
// ...
<Route path="petty-cash" element={<PettyCash />} />
```

---

## Access Control

| Role | View | Add Expense | Delete | Top-up Fund |
|------|------|-------------|--------|-------------|
| Principal | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Accountant | ✅ | ✅ | ❌ | ❌ |
| Teacher | ❌ | ❌ | ❌ | ❌ |
| Student/Parent | ❌ | ❌ | ❌ | ❌ |

---

## Build Order

1. Run migration SQL (create 2 tables + seed opening balance)
2. Create `PettyCashModel.js`
3. Create `pettyCashController.js`
4. Create `backend/routes/pettyCash.js` + register in `index.js`
5. Create `src/api/pettyCashApi.js` + export from `src/api/index.js`
6. Create `src/pages/PettyCash.jsx`
7. Add route in `App.jsx`
8. Add sidebar link in `Sidebar.jsx`
9. Restart backend

---

## Sample Data (for testing)

```sql
-- Expenses
INSERT INTO petty_cash_expenses (expense_no, date, category, description, amount, paid_to, recorded_by) VALUES
('PCE2025001', '2025-06-10', 'Stationery',          'A4 paper reams x5',          450.00, 'Sharma Stationery', 8),
('PCE2025002', '2025-06-12', 'Cleaning & Supplies',  'Phenyl, mop, dustbin bags',  380.00, 'Local Store',       8),
('PCE2025003', '2025-06-15', 'Refreshments',         'Staff meeting tea & snacks', 320.00, 'Canteen',           8),
('PCE2025004', '2025-06-18', 'Courier & Postage',    'Documents to board office',  150.00, 'DTDC Courier',      8),
('PCE2025005', '2025-06-20', 'Repairs & Maintenance','Classroom fan repair',       800.00, 'Electrician Raju',  8),
('PCE2025006', '2025-06-22', 'Printing',             'Exam hall tickets printing', 250.00, 'Print Shop',        8);

-- Top-up
INSERT INTO petty_cash_fund (amount, balance_after, type, note, added_by)
VALUES (3000.00, 8000.00, 'Top-up', 'Monthly replenishment June 2025', 1);
```
