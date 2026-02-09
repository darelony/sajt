const db = require("../config/db");


exports.getMyGrades = (req, res) => {
  const studentId = req.user.id;

  db.all(
    `SELECT c.name AS course,
            ep.name AS period,
            g.grade,
            g.graded_at
     FROM grades g
     JOIN exam_applications ea ON g.application_id = ea.application_id
     JOIN courses c ON ea.course_id = c.course_id
     JOIN exam_periods ep ON ea.period_id = ep.period_id
     WHERE ea.student_id = ?
     ORDER BY g.graded_at DESC`,
    [studentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};
