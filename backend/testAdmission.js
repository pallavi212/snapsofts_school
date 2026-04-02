const StudentModel = require('./models/StudentModel');
const db = require('./db');
async function run() {
  try {
    const res = await StudentModel.create({
      name: "Aalok More",
      class: "1",
      section: "A",
      parent: "Sarita More",
      contact: "9876543210",
      dob: "2015-06-15",
      gender: "Male"
    });
    console.log("Admission successful:", res);

    const [student] = await db.query(
      `SELECT * FROM students WHERE student_code = ?`, 
      [res.student_code]
    );
    console.log("Student:", student[0]);

    if (student[0].parent_id) {
       const [parent] = await db.query(
         `SELECT * FROM parents p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
         [student[0].parent_id]
       );
       console.log("Parent linked:", parent[0]);
    }

  } catch (err) {
    console.error("Admission failed:", err);
  } finally {
    process.exit();
  }
}
run();
