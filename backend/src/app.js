const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const coursesRoutes = require("./routes/courses.routes");
const enrollmentsRoutes = require("./routes/enrollments.routes");
const examPeriodsRoutes = require("./routes/exam-periods.routes");
const examsRoutes = require("./routes/exams.routes");
const materialsRoutes = require("./routes/materials.routes");
const announcementsRoutes = require("./routes/announcements.routes");
const gradesRoutes = require("./routes/grades.routes");
const studentRoutes = require("./routes/student.routes");
const profesorRoutes = require("./routes/professor.routes");


const { swaggerUi, specs } = require("./swagger");

const app = express();


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

app.use("/api/student", studentRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/exam-periods", examPeriodsRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/professor", profesorRoutes);

app.use("/api/materials", materialsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/grades", gradesRoutes);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;
