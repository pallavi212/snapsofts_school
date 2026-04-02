const StudentModel = require('./models/StudentModel');
async function run() {
  try {
    const students = await StudentModel.getAll();
    console.log("Before:", students[0]);
    if (students.length > 0) {
      await StudentModel.update(students[0].student_code, {
        name: students[0].name + " Updated",
        contact: "999999999",
        class: "10",
        section: "B",
        dob: "2010-05-05",
        gender: "Female",
        parent: "Test Parent"
      });
      const studentsAfter = await StudentModel.getAll();
      console.log("After:", studentsAfter[0]);
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
