const db = require('../db');

const FeeModel = {
    getStructure: () => db.query(
        'SELECT * FROM fee_structure ORDER BY grade_from'
    ).then(([rows]) => rows),

    getPayments: () => db.query(`
        SELECT u.name, s.student_code, s.id AS student_db_id, c.name AS class_name, c.grade,
               IFNULL(SUM(fp.amount_paid), 0) AS total_paid
        FROM students s
        JOIN users u    ON s.user_id = u.id
        JOIN classes c  ON s.class_id = c.id
        LEFT JOIN fee_payments fp ON s.id = fp.student_id
        GROUP BY s.id
    `).then(([rows]) => rows),

    // All payments for one student (for receipt history)
    getStudentPayments: (student_db_id) => db.query(`
        SELECT fp.id, fp.receipt_no, fp.amount_paid, fp.payment_date,
               fp.payment_mode, fp.academic_year,
               u.name AS student_name, s.student_code,
               c.name AS class_name, c.grade, s.parent_name,
               (SELECT IFNULL(SUM(fp2.amount_paid),0)
                FROM fee_payments fp2
                WHERE fp2.student_id = fp.student_id AND fp2.id <= fp.id
               ) AS cumulative_paid
        FROM fee_payments fp
        JOIN students s ON fp.student_id = s.id
        JOIN users u    ON s.user_id = u.id
        JOIN classes c  ON s.class_id = c.id
        WHERE fp.student_id = ?
        ORDER BY fp.payment_date ASC, fp.id ASC
    `, [student_db_id]).then(([rows]) => rows),

    // Fee summary for all children of a parent
    getPaymentsByParent: (parentUserId) => db.query(`
        SELECT u.name, s.student_code, s.id AS student_db_id, c.name AS class_name, c.grade,
               IFNULL(SUM(fp.amount_paid), 0) AS total_paid
        FROM students s
        JOIN users u    ON s.user_id = u.id
        JOIN classes c  ON s.class_id = c.id
        LEFT JOIN fee_payments fp ON s.id = fp.student_id
        WHERE s.parent_user_id = ?
        GROUP BY s.id
    `, [parentUserId]).then(([rows]) => rows),

    addPayment: ({ student_db_id, amount_paid, payment_date, payment_mode, receipt_no, academic_year }) =>
        db.query(
            `INSERT INTO fee_payments (student_id, amount_paid, payment_date, payment_mode, receipt_no, academic_year)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_db_id, amount_paid, payment_date, payment_mode, receipt_no, academic_year]
        ).then(([r]) => r),
};

module.exports = FeeModel;
