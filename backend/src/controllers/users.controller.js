const db = require("../config/db");
const bcrypt = require("bcrypt");

// GET - Svi korisnici
exports.getAllUsers = (req, res) => {
  db.all(
    `SELECT user_id, first_name, last_name, email, role, index_no, major, year 
     FROM users`,
    [],
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(users);
    }
  );
};

// GET - Profesori sa kursevima
exports.getProfessorsWithCourses = (req, res) => {
  db.all(
    `
    SELECT 
      u.user_id,
      u.first_name,
      u.last_name,
      c.course_id,
      c.name AS course_name,
      c.code AS course_code
    FROM users u
    LEFT JOIN courses c ON c.professor_id = u.user_id
    WHERE u.role = 'PROFESSOR'
    ORDER BY u.user_id, c.course_id
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });

      const professorsMap = {};
      rows.forEach(r => {
        if (!professorsMap[r.user_id]) {
          professorsMap[r.user_id] = {
            user_id: r.user_id,
            first_name: r.first_name,
            last_name: r.last_name,
            courses: []
          };
        }
        if (r.course_id) {
          professorsMap[r.user_id].courses.push({
            course_id: r.course_id,
            name: r.course_name,
            code: r.course_code
          });
        }
      });

      const professors = Object.values(professorsMap);
      res.json(professors);
    }
  );
};

// POST - Kreiraj novog korisnika
exports.createUser = async (req, res) => {
  const { first_name, last_name, email, role, password, index_no, major, year } = req.body;

  // Validacija obaveznih polja
  if (!first_name || !last_name || !email || !role || !password) {
    return res.status(400).json({ error: "Sva obavezna polja moraju biti popunjena" });
  }

  try {
    // Proveri da li email već postoji
    db.get(
      "SELECT email FROM users WHERE email = ?",
      [email],
      async (err, existingUser) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (existingUser) {
          return res.status(400).json({ error: "Email već postoji" });
        }

        // Hash-uj lozinku
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertuj novog korisnika
        const sql = `
          INSERT INTO users (first_name, last_name, email, role, password, index_no, major, year)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
          sql,
          [first_name, last_name, email, role, hashedPassword, index_no || null, major || null, year || null],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Vrati kreiranog korisnika (bez passworda)
            db.get(
              `SELECT user_id, first_name, last_name, email, role, index_no, major, year 
               FROM users WHERE user_id = ?`,
              [this.lastID],
              (err, newUser) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.status(201).json(newUser);
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET - Korisnik po ID-u
exports.getUserById = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT user_id, first_name, last_name, email, role, index_no, major, year 
     FROM users WHERE user_id = ?`,
    [id],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ message: "Korisnik ne postoji" });
      res.json(user);
    }
  );
};

// PUT - Ažuriraj korisnika
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role, index_no, major, year } = req.body;

  const sql = `
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, role = ?, index_no = ?, major = ?, year = ?
    WHERE user_id = ?
  `;

  db.run(
    sql,
    [first_name, last_name, email, role, index_no, major, year, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0)
        return res.status(404).json({ message: "Korisnik ne postoji" });

      // Vrati ažuriranog korisnika
      db.get(
        `SELECT user_id, first_name, last_name, email, role, index_no, major, year 
         FROM users WHERE user_id = ?`,
        [id],
        (err, updatedUser) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(updatedUser);
        }
      );
    }
  );
};

// GET - Trenutno ulogovan korisnik
exports.getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Ne vazi token" });
  }

  const { id } = req.user;

  db.get(
    `SELECT user_id, first_name, last_name, email, role, index_no, major, year 
     FROM users WHERE user_id = ?`,
    [id],
    (err, user) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(404).json({ message: "Korisnik ne postoji" });

      res.json(user);
    }
  );
};

// DELETE - Obriši korisnika
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM users WHERE user_id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0)
        return res.status(404).json({ message: "Korisnik ne postoji" });

      res.json({ message: "Korisnik obrisan" });
    }
  );
};

// PUT - Ažuriraj kurseve profesora
exports.updateProfessorCourses = (req, res) => {
  const { id } = req.params;
  const { course_ids } = req.body;

  console.log("=== DEBUG ===");
  console.log("Professor ID:", id);
  console.log("Course IDs:", course_ids);
  console.log("============");

  // Ako nema novih kurseva
  if (!course_ids || course_ids.length === 0) {
    return res.status(400).json({ 
      message: "Profesor mora imati bar jedan kurs dodeljen" 
    });
  }

  // Direktno postavi ovog profesora za izabrane kurseve
  const placeholders = course_ids.map(() => "?").join(", ");
  const query = `UPDATE courses SET professor_id = ? WHERE course_id IN (${placeholders})`;
  const params = [id, ...course_ids];
  
  console.log("SQL Query:", query);
  console.log("Params:", params);

  db.run(query, params, function(err) {
    if (err) {
      console.error("GREŠKA - Dodavanje kurseva:", err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log("✓ Broj ažuriranih redova:", this.changes);
    res.json({ 
      message: "Kursevi uspešno ažurirani",
      updated: this.changes 
    });
  });
};