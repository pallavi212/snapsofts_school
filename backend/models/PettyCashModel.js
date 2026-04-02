const db = require('../db');

const PettyCashModel = {
    getSummary: () => db.query(`
        SELECT
            IFNULL((SELECT SUM(amount) FROM petty_cash_fund), 0)        AS total_funded,
            IFNULL((SELECT SUM(amount) FROM petty_cash_expenses), 0)    AS total_spent,
            IFNULL((SELECT SUM(amount) FROM petty_cash_fund), 0)
              - IFNULL((SELECT SUM(amount) FROM petty_cash_expenses), 0) AS current_balance
    `).then(([rows]) => rows[0]),

    getExpenses: () => db.query(`
        SELECT e.*, u.name AS recorded_by_name, ua.name AS approved_by_name
        FROM petty_cash_expenses e
        JOIN users u ON e.recorded_by = u.id
        LEFT JOIN users ua ON e.approved_by = ua.id
        ORDER BY e.date DESC, e.id DESC
    `).then(([rows]) => rows),

    addExpense: async ({ date, category, description, amount, paid_to, receipt_no, approved_by, recorded_by }) => {
        const [[{ max_id }]] = await db.query('SELECT MAX(id) AS max_id FROM petty_cash_expenses');
        const expense_no = `PCE${new Date().getFullYear()}${String((max_id || 0) + 1).padStart(3, '0')}`;
        return db.query(
            `INSERT INTO petty_cash_expenses (expense_no, date, category, description, amount, paid_to, receipt_no, approved_by, recorded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [expense_no, date, category, description, amount, paid_to || null, receipt_no || null, approved_by || null, recorded_by]
        ).then(([r]) => ({ insertId: r.insertId, expense_no }));
    },

    deleteExpense: (id) => db.query('DELETE FROM petty_cash_expenses WHERE id = ?', [id]),

    getFund: () => db.query(`
        SELECT f.*, u.name AS added_by_name
        FROM petty_cash_fund f
        JOIN users u ON f.added_by = u.id
        ORDER BY f.created_at DESC
    `).then(([rows]) => rows),

    addTopUp: async ({ amount, type, note, added_by }) => {
        // Calculate new balance_after
        const [[{ current_balance }]] = await db.query(`
            SELECT IFNULL((SELECT SUM(amount) FROM petty_cash_fund), 0)
                 - IFNULL((SELECT SUM(amount) FROM petty_cash_expenses), 0) AS current_balance
        `);
        const balance_after = Number(current_balance) + Number(amount);
        return db.query(
            `INSERT INTO petty_cash_fund (amount, balance_after, type, note, added_by) VALUES (?, ?, ?, ?, ?)`,
            [amount, balance_after, type || 'Top-up', note || null, added_by]
        ).then(([r]) => ({ insertId: r.insertId, balance_after }));
    },

    getCategoryBreakdown: () => db.query(`
        SELECT category, SUM(amount) AS total, COUNT(*) AS count
        FROM petty_cash_expenses
        GROUP BY category
        ORDER BY total DESC
    `).then(([rows]) => rows),
};

module.exports = PettyCashModel;
