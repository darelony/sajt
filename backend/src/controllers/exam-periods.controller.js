const db = require("../config/db");


exports.getAllExamPeriods = (req, res) => {
  db.all(
    "SELECT * FROM exam_periods ORDER BY start_date",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};


exports.createExamPeriod = (req, res) => {
  const { name, start_date, end_date } = req.body;

  if (!name || !start_date || !end_date)
    return res.status(400).json({ message: "Nedostaju podaci" });

  db.run(
    "INSERT INTO exam_periods (name, start_date, end_date) VALUES (?, ?, ?)",
    [name, start_date, end_date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Ispitni rok kreiran",
        exam_period_id: this.lastID,
      });
    }
  );
};


exports.updateExamPeriod = (req, res) => {
  const { id } = req.params;
  const { name, start_date, end_date } = req.body;

  db.run(
    `UPDATE exam_periods
     SET name = ?, start_date = ?, end_date = ?
     WHERE exam_period_id = ?`,
    [name, start_date, end_date, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0)
        return res.status(404).json({ message: "Rok ne postoji" });

      res.json({ message: "Ispitni rok izmenjen" });
    }
  );
};


exports.deleteExamPeriod = (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM exam_periods WHERE exam_period_id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0)
        return res.status(404).json({ message: "Rok ne postoji" });

      res.json({ message: "Ispitni rok obrisan" });
    }
  );
};
