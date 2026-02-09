const db = require("../config/db");


exports.createMaterial = (req, res) => {
  const { course_id, title, description, file_path } = req.body;

  if (!course_id || !title || !file_path)
    return res.status(400).json({ message: "Nedostaju podaci" });

  db.run(
    `INSERT INTO materials (course_id, title, description, file_path)
     VALUES (?, ?, ?, ?)`,
    [course_id, title, description, file_path],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Materijal dodat",
        material_id: this.lastID,
      });
    }
  );
};


exports.getMaterialsByCourse = (req, res) => {
  const { courseId } = req.params;

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
};
