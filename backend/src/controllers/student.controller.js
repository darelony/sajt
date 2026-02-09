const db = require("../config/db");


exports.getStudentCourses = (req, res) => {
  const studentId = req.user.id;

  const query = `
    SELECT 
      c.course_id, 
      c.name, 
      c.code, 
      c.espb,
      p.first_name AS professor_first_name,
      p.last_name AS professor_last_name
    FROM enrollments e
    JOIN courses c ON c.course_id = e.course_id
    JOIN users p ON p.user_id = c.professor_id
    WHERE e.student_id = ?
    ORDER BY c.course_id
  `;

  db.all(query, [studentId], (err, courses) => {
    if (err) return res.status(500).json({ message: err.message });

    const formatted = courses.map(c => ({
      course_id: c.course_id,
      name: c.name,
      code: c.code,
      espb: c.espb,
      professor: `${c.professor_first_name} ${c.professor_last_name}`
    }));

    res.json(formatted);
  });
};


exports.getAvailableCourses = (req, res) => {
  const studentId = req.user.id;

  db.all(
    `
    SELECT course_id, name, code, espb
    FROM courses
    WHERE course_id NOT IN (
      SELECT course_id FROM enrollments WHERE student_id = ?
    )
    ORDER BY course_id
    `,
    [studentId],
    (err, courses) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(courses);
    }
  );
};


exports.getProfessorsForStudent = (req, res) => {
  db.all(
    `SELECT user_id, first_name, last_name FROM users WHERE role='PROFESSOR'`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    }
  );
};


exports.getAvailableExamsForApplication = (req, res) => {
  const studentId = req.user.id;

  const query = `
    SELECT 
      c.course_id,
      c.name AS course,
      c.code,
      ep.period_id,
      ep.name AS period,
      ep.date_from,
      ep.date_to,
      CASE 
        WHEN ea.application_id IS NOT NULL THEN 1 
        ELSE 0 
      END AS already_applied
    FROM enrollments e
    JOIN courses c ON c.course_id = e.course_id
    CROSS JOIN exam_periods ep
    LEFT JOIN exam_applications ea 
      ON ea.student_id = e.student_id 
      AND ea.course_id = c.course_id 
      AND ea.period_id = ep.period_id
    WHERE e.student_id = ?
    ORDER BY c.name, ep.date_from
  `;

  db.all(query, [studentId], (err, rows) => {
    if (err) {
      console.error("Error fetching available exams:", err);
      return res.status(500).json({ message: err.message });
    }
    res.json(rows);
  });
};


exports.applyForExam = (req, res) => {
  const studentId = req.user.id;
  const { course_id, period_id } = req.body;

  if (!course_id || !period_id) {
    return res.status(400).json({ message: "course_id i period_id su obavezni" });
  }

 
  const checkEnrollmentQuery = `
    SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?
  `;

  db.get(checkEnrollmentQuery, [studentId, course_id], (err, enrollment) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!enrollment) {
      return res.status(400).json({ message: "Niste upisali ovaj predmet" });
    }

    
    const checkApplicationQuery = `
      SELECT * FROM exam_applications
      WHERE student_id = ? AND course_id = ? AND period_id = ?
    `;

    db.get(checkApplicationQuery, [studentId, course_id, period_id], (err, row) => {
      if (err) return res.status(500).json({ message: err.message });
      if (row) return res.status(400).json({ message: "Ispit već prijavljen za ovaj rok" });

      
      const insertQuery = `
        INSERT INTO exam_applications (student_id, course_id, period_id, status)
        VALUES (?, ?, ?, 'PRIJAVLJEN')
      `;

      db.run(insertQuery, [studentId, course_id, period_id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ 
          message: "Ispit uspešno prijavljen",
          application_id: this.lastID
        });
      });
    });
  });
};


exports.getStudentGrades = (req, res) => {
  const studentId = req.user.id;

  const query = `
    SELECT 
        c.course_id,
        c.name AS course,
        c.code,
        COALESCE(ea.status, 'NIJE_PRIJAVLJEN') AS exam_status,
        g.grade
    FROM enrollments e
    JOIN courses c ON c.course_id = e.course_id
    LEFT JOIN exam_applications ea 
        ON ea.course_id = c.course_id AND ea.student_id = e.student_id
    LEFT JOIN grades g 
        ON g.application_id = ea.application_id
    WHERE e.student_id = ?
    ORDER BY c.course_id
  `;

  db.all(query, [studentId], (err, rows) => {
    if (err) {
      console.error("Error fetching student grades:", err.message);
      return res.status(500).json({ message: err.message });
    }

    const formatted = rows.map(r => ({
      course: r.course,
      code: r.code,
      exam_status: r.exam_status,
      grade: r.grade != null ? r.grade : null
    }));

    res.json(formatted);
  });
};


exports.getStudentExams = (req, res) => {
  const studentId = req.user.id;

  db.all(
    `
    SELECT 
      ea.application_id,
      ea.course_id,
      ea.period_id,
      c.name AS course,
      ep.name AS period,
      ea.status AS exam_status,
      g.grade
    FROM exam_applications ea
    JOIN courses c ON c.course_id = ea.course_id
    JOIN exam_periods ep ON ep.period_id = ea.period_id
    LEFT JOIN grades g ON g.application_id = ea.application_id
    WHERE ea.student_id = ?
    ORDER BY ep.period_id, c.course_id
    `,
    [studentId],
    (err, exams) => {
      if (err) return res.status(500).json({ message: err.message });

      const formatted = exams.map(e => ({
        application_id: e.application_id,
        course_id: e.course_id,
        period_id: e.period_id,
        course: e.course,
        period: e.period,
        exam_status: e.exam_status || "NIJE_PRIJAVLJEN",
        grade: e.grade != null ? e.grade : null
      }));

      res.json(formatted);
    }
  );
};