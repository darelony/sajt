const db = require("../config/db");


exports.applyForExam = (req, res) => {
  const studentId = req.user.id;
  const { course_id, period_id } = req.body;

  if (!course_id || !period_id)
    return res.status(400).json({ message: "Nedostaju podaci" });

  db.run(
    `INSERT INTO exam_applications 
     (student_id, course_id, period_id, status)
     VALUES (?, ?, ?, 'PRIJAVLJEN')`,
    [studentId, course_id, period_id],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE"))
          return res.status(400).json({ message: "Ispit je već prijavljen" });

        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Ispit uspešno prijavljen",
        application_id: this.lastID,
      });
    }
  );
};


exports.getMyExamApplications = (req, res) => {
  const studentId = req.user.id;

  db.all(
    `SELECT ea.application_id,
            c.name AS course,
            ep.name AS period,
            ea.status,
            g.grade
     FROM exam_applications ea
     JOIN courses c ON ea.course_id = c.course_id
     JOIN exam_periods ep ON ea.period_id = ep.period_id
     LEFT JOIN grades g ON ea.application_id = g.application_id
     WHERE ea.student_id = ?`,
    [studentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};


exports.gradeExam = (req, res) => {
  const { applicationId } = req.params;
  const { grade } = req.body;

  if (!grade || grade < 5 || grade > 10)
    return res.status(400).json({ message: "Ocena mora biti 5–10" });

  db.serialize(() => {
    
    db.run(
      `INSERT INTO grades (application_id, grade)
       VALUES (?, ?)`,
      [applicationId, grade],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE"))
            return res
              .status(400)
              .json({ message: "Ocena je već upisana" });

          return res.status(500).json({ error: err.message });
        }
      }
    );

    
    db.run(
      `UPDATE exam_applications
       SET status = ?
       WHERE application_id = ?`,
      [grade >= 6 ? "POLOZIO" : "NIJE_POLOZIO", applicationId],
      function (err) {
        if (err)
          return res.status(500).json({ error: err.message });

        if (this.changes === 0)
          return res
            .status(404)
            .json({ message: "Prijava ne postoji" });

        res.json({ message: "Ocena uspešno upisana" });
      }
    );
  });
};


exports.getAllExamApplications = (req, res) => {
  db.all(
    `SELECT ea.application_id,
            s.first_name || ' ' || s.last_name AS student,
            c.name AS course,
            ep.name AS period,
            ea.status,
            g.grade
     FROM exam_applications ea
     JOIN users s ON ea.student_id = s.user_id
     JOIN courses c ON ea.course_id = c.course_id
     JOIN exam_periods ep ON ea.period_id = ep.period_id
     LEFT JOIN grades g ON ea.application_id = g.application_id
     ORDER BY ep.date_from DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};
