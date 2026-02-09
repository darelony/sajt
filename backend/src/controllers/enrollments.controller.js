const db = require("../config/db");


exports.enrollStudent = (req, res) => {
  const studentId = req.user.id;
  const { course_id } = req.body;

  if (!course_id)
    return res.status(400).json({ message: "course_id je obavezan" });

  
  db.get(
    "SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?",
    [studentId, course_id],
    (err, existing) => {
      if (existing)
        return res.status(400).json({ message: "Već ste prijavljeni" });

      db.run(
        "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
        [studentId, course_id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          res.status(201).json({
            message: "Uspešno ste se prijavili na predmet",
          });
        }
      );
    }
  );
};


exports.getMyEnrollments = (req, res) => {
  const studentId = req.user.id;

  db.all(
    `SELECT c.course_id, c.name, c.espb
     FROM enrollments e
     JOIN courses c ON e.course_id = c.course_id
     WHERE e.student_id = ?`,
    [studentId],
    (err, courses) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(courses);
    }
  );
};


exports.getAllEnrollments = (req, res) => {
  db.all(
    `SELECT e.enrollment_id,
            s.first_name || ' ' || s.last_name AS student,
            c.name AS course
     FROM enrollments e
     JOIN users s ON e.student_id = s.user_id
     JOIN courses c ON e.course_id = c.course_id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};


exports.deleteEnrollment = (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM enrollments WHERE enrollment_id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0)
        return res.status(404).json({ message: "Prijava ne postoji" });

      res.json({ message: "Prijava obrisana" });
    }
  );
};
