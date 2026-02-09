const db = require("../config/db");

// GET - Svi kursevi
exports.getAllCourses = (req, res) => {
  db.all(
    `SELECT c.course_id, c.name, c.code, c.espb, 
            u.first_name || ' ' || u.last_name AS professor,
            c.professor_id
     FROM courses c
     LEFT JOIN users u ON c.professor_id = u.user_id`,
    [],
    (err, courses) => {
      if (err) {
        console.error("Greška pri dobijanju kurseva:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(courses);
    }
  );
};

// GET - Kurs po ID-u
exports.getCourseById = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT c.course_id, c.name, c.code, c.espb, 
            u.first_name || ' ' || u.last_name AS professor,
            c.professor_id
     FROM courses c
     LEFT JOIN users u ON c.professor_id = u.user_id
     WHERE c.course_id = ?`,
    [id],
    (err, course) => {
      if (err) {
        console.error("Greška pri dobijanju kursa:", err);
        return res.status(500).json({ error: err.message });
      }
      if (!course) {
        return res.status(404).json({ message: "Predmet ne postoji" });
      }
      res.json(course);
    }
  );
};

// POST - Kreiraj novi kurs
exports.createCourse = (req, res) => {
  const { name, code, espb, professor_id } = req.body;

  // Validacija
  if (!name || !code || !espb) {
    return res.status(400).json({ message: "Nedostaju obavezna polja (name, code, espb)" });
  }

  // Proveri da li code već postoji
  db.get(
    "SELECT code FROM courses WHERE code = ?",
    [code],
    (err, existingCourse) => {
      if (err) {
        console.error("Greška pri proveri koda:", err);
        return res.status(500).json({ error: err.message });
      }

      if (existingCourse) {
        return res.status(400).json({ error: "Kod kursa već postoji" });
      }

      // Insertuj novi kurs
      db.run(
        "INSERT INTO courses (name, code, espb, professor_id) VALUES (?, ?, ?, ?)",
        [name, code, espb, professor_id || null],
        function (err) {
          if (err) {
            console.error("Greška pri kreiranju kursa:", err);
            return res.status(500).json({ error: err.message });
          }

          // Vrati kreirani kurs
          db.get(
            `SELECT c.course_id, c.name, c.code, c.espb, 
                    u.first_name || ' ' || u.last_name AS professor,
                    c.professor_id
             FROM courses c
             LEFT JOIN users u ON c.professor_id = u.user_id
             WHERE c.course_id = ?`,
            [this.lastID],
            (err, newCourse) => {
              if (err) {
                console.error("Greška pri dobijanju novog kursa:", err);
                return res.status(500).json({ error: err.message });
              }
              res.status(201).json(newCourse);
            }
          );
        }
      );
    }
  );
};

// PUT - Ažuriraj kurs
exports.updateCourse = (req, res) => {
  const { id } = req.params;
  const { name, code, espb, professor_id } = req.body;

  db.run(
    `UPDATE courses SET name = ?, code = ?, espb = ?, professor_id = ?
     WHERE course_id = ?`,
    [name, code, espb, professor_id || null, id],
    function (err) {
      if (err) {
        console.error("Greška pri ažuriranju kursa:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Predmet ne postoji" });
      }

      // Vrati ažurirani kurs
      db.get(
        `SELECT c.course_id, c.name, c.code, c.espb, 
                u.first_name || ' ' || u.last_name AS professor,
                c.professor_id
         FROM courses c
         LEFT JOIN users u ON c.professor_id = u.user_id
         WHERE c.course_id = ?`,
        [id],
        (err, updatedCourse) => {
          if (err) {
            console.error("Greška pri dobijanju ažuriranog kursa:", err);
            return res.status(500).json({ error: err.message });
          }
          res.json(updatedCourse);
        }
      );
    }
  );
};

// DELETE - Obriši kurs
exports.deleteCourse = (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM courses WHERE course_id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Greška pri brisanju kursa:", err);
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Predmet ne postoji" });
      }

      res.json({ message: "Predmet obrisan" });
    }
  );
};

// GET - Moji kursevi (za profesora)
exports.getMyCourses = (req, res) => {
  const professorId = req.user.id;

  db.all(
    `SELECT c.course_id, c.name, c.code, c.espb
     FROM courses c
     WHERE c.professor_id = ?`,
    [professorId],
    (err, courses) => {
      if (err) {
        console.error("Greška pri dobijanju mojih kurseva:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(courses);
    }
  );
};