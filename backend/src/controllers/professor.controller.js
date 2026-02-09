const db = require("../config/db");


exports.getProfile = (req, res) => {
  const id = req.user.id;

  db.get(
    `SELECT first_name, last_name, email FROM users WHERE user_id = ?`,
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
};


exports.getMyCourses = (req, res) => {
  db.all(
    `SELECT course_id, name, code, espb FROM courses WHERE professor_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};


exports.getCourseApplications = (req, res) => {
  const courseId = req.params.courseId;
  const professorId = req.user.id;

  db.all(
    `
    SELECT 
      ea.application_id,
      ea.student_id,
      ea.course_id,
      ea.period_id,
      ea.status,
      u.first_name,
      u.last_name,
      u.index_no,
      u.first_name || ' ' || u.last_name AS student_name,
      c.name AS course_name,
      c.code AS course_code,
      ep.name AS period_name,
      g.grade
    FROM exam_applications ea
    JOIN users u ON u.user_id = ea.student_id
    JOIN courses c ON c.course_id = ea.course_id
    JOIN exam_periods ep ON ep.period_id = ea.period_id
    LEFT JOIN grades g ON g.application_id = ea.application_id
    WHERE ea.course_id = ? AND c.professor_id = ?
    ORDER BY u.last_name, u.first_name
    `,
    [courseId, professorId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching applications:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Found ${rows.length} applications for course ${courseId}`);
      res.json(rows);
    }
  );
};


exports.getExamApplications = (req, res) => {
  const professorId = req.user.id;

  db.all(
    `SELECT 
       ea.application_id,
       u.user_id AS student_id,
       u.first_name,
       u.last_name,
       u.index_no,
       c.name AS course,
       ep.name AS period,
       ea.status,
       g.grade
     FROM exam_applications ea
     JOIN users u ON ea.student_id = u.user_id
     JOIN courses c ON ea.course_id = c.course_id
     JOIN exam_periods ep ON ea.period_id = ep.period_id
     LEFT JOIN grades g ON ea.application_id = g.application_id
     WHERE c.professor_id = ?
     ORDER BY ep.period_id DESC, u.last_name, u.first_name`,
    [professorId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};


exports.addOrUpdateGrade = (req, res) => {
  const { application_id, grade } = req.body;

  if (!application_id || grade == null)
    return res.status(400).json({ message: "application_id i grade su obavezni" });

 
  db.get(
    `SELECT ea.application_id, c.professor_id
     FROM exam_applications ea
     JOIN courses c ON ea.course_id = c.course_id
     WHERE ea.application_id = ?`,
    [application_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ message: "Application not found" });
      if (row.professor_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

     
      db.run(
        `
        INSERT INTO grades (application_id, grade, graded_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(application_id)
        DO UPDATE SET grade = excluded.grade, graded_at = datetime('now')
        `,
        [application_id, grade],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          
          
          const newStatus = grade >= 6 ? 'POLOZIO' : 'NIJE_POLOZIO';
          db.run(
            `UPDATE exam_applications SET status = ? WHERE application_id = ?`,
            [newStatus, application_id],
            (err) => {
              if (err) console.error("Failed to update status:", err);
              res.json({ message: "Grade saved", grade, status: newStatus });
            }
          );
        }
      );
    }
  );
};

exports.updateProfile = (req, res) => {
  const professorId = req.user.id;
  const { first_name, last_name, email, bio } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: "First name, last name, and email are required" });
  }

  db.run(
    `UPDATE users 
     SET first_name = ?, last_name = ?, email = ?, bio = ?
     WHERE user_id = ? AND role = 'PROFESSOR'`,
    [first_name, last_name, email, bio || null, professorId],
    function (err) {
      if (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: "Professor not found" });
      }

      
      db.get(
        `SELECT user_id, first_name, last_name, email, bio, role FROM users WHERE user_id = ?`,
        [professorId],
        (err, user) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(user);
        }
      );
    }
  );
};


exports.getMaterialsByCourse = (req, res) => {
  const courseId = req.params.courseId;
  const professorId = req.user.id;

 
  db.get(
    `SELECT professor_id FROM courses WHERE course_id = ?`,
    [courseId],
    (err, course) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (course.professor_id !== professorId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      db.all(
        `SELECT material_id, title, description, file_path, created_at
         FROM materials
         WHERE course_id = ?
         ORDER BY created_at DESC`,
        [courseId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows);
        }
      );
    }
  );
};


exports.addMaterial = (req, res) => {
  const { course_id, title, description, file_path } = req.body;
  const professorId = req.user.id;

  if (!course_id || !title)
    return res.status(400).json({ message: "course_id i title su obavezni" });

 
  db.get(
    `SELECT professor_id FROM courses WHERE course_id = ?`,
    [course_id],
    (err, course) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!course) return res.status(404).json({ message: "Course not found" });
      if (course.professor_id !== professorId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      db.run(
        `INSERT INTO materials (course_id, title, description, file_path)
         VALUES (?, ?, ?, ?)`,
        [course_id, title, description, file_path],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ 
            material_id: this.lastID,
            message: "Material added successfully"
          });
        }
      );
    }
  );
};