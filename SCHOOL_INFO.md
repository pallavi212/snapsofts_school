# School / Trust Information — Where to Add

## Trust & School Details

| Field            | Example Value              |
|------------------|----------------------------|
| School Name      | (your school name)         |
| Trust Name       | Snapsofts Tech             |
| Trust ID / Reg No| (trust registration number)|
| Address Line 1   | (building / street)        |
| Address Line 2   | (area / locality)          |
| City             | (city)                     |
| State            | (state)                    |
| Pincode          | (pincode)                  |
| Phone            | (school phone)             |
| Email            | (school email)             |
| Website          | (website URL)              |
| Principal Name   | (principal name)           |
| Academic Year    | 2025-26                    |
| Board            | CBSE / SSC                 |
| Affiliation No   | (affiliation number)       |

---

## 1. Database — Add a `school_info` table

Add this to `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS school_info (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  school_name      VARCHAR(150) NOT NULL,
  trust_name       VARCHAR(150),
  trust_id         VARCHAR(50),
  address_line1    VARCHAR(200),
  address_line2    VARCHAR(200),
  city             VARCHAR(100),
  state            VARCHAR(100),
  pincode          VARCHAR(10),
  phone            VARCHAR(20),
  email            VARCHAR(100),
  website          VARCHAR(150),
  principal_name   VARCHAR(100),
  academic_year    VARCHAR(9)  DEFAULT '2025-26',
  affiliation_no   VARCHAR(50),
  logo_url         VARCHAR(255),
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Add this to `database/seed.sql`:

```sql
INSERT INTO school_info
  (school_name, trust_name, trust_id, address_line1, city, state, pincode, phone, email, principal_name, academic_year)
VALUES
  ('Your School Name', 'Snapsofts Tech', 'TRUST-001',
   'Building No, Street Name', 'City', 'State', '000000',
   '+91 XXXXX XXXXX', 'school@example.com', 'Principal Name', '2025-26');
```

---

## 2. Backend — Add route `GET /api/school-info`

Create `backend/routes/schoolInfo.js`:

```js
const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [[info]] = await db.query('SELECT * FROM school_info LIMIT 1');
  res.json(info || {});
});

router.put('/', async (req, res) => {
  const fields = ['school_name','trust_name','trust_id','address_line1','address_line2',
                  'city','state','pincode','phone','email','website','principal_name',
                  'academic_year','affiliation_no','logo_url'];
  const updates = fields.filter(f => req.body[f] !== undefined);
  if (!updates.length) return res.json({ success: true });
  const sql = `UPDATE school_info SET ${updates.map(f => `${f} = ?`).join(', ')} LIMIT 1`;
  await db.query(sql, updates.map(f => req.body[f]));
  res.json({ success: true });
});

module.exports = router;
```

Register in `backend/index.js`:

```js
app.use('/api/school-info', require('./routes/schoolInfo'));
```

---

## 3. Frontend — Use in Header / Reports

In `src/api/` add `schoolApi.js`:

```js
import { request } from './config';
export const schoolApi = {
  get: () => request('GET', '/school-info'),
  update: (body) => request('PUT', '/school-info', body),
};
```

Use `schoolApi.get()` in:
- `src/components/Header.jsx` — show school name + trust name
- Fee receipts / reports — show full address + trust ID
- Login page — show school branding

---

## Files to Edit Summary

| File | What to add |
|------|-------------|
| `database/schema.sql` | `school_info` table |
| `database/seed.sql` | INSERT with your details |
| `backend/routes/schoolInfo.js` | New file — GET + PUT routes |
| `backend/index.js` | Register `/api/school-info` route |
| `src/api/schoolApi.js` | New file — frontend API calls |
| `src/components/Header.jsx` | Display school name / trust |
