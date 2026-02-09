const db = require("../config/db");


exports.createAnnouncement = (req, res) => {
  const { title, content } = req.body;
  const authorId = req.user.id;

  if (!title || !content)
    return res.status(400).json({ message: "Nedostaju podaci" });

  db.run(
    `INSERT INTO announcements (title, content, author_id)
     VALUES (?, ?, ?)`,
    [title, content, authorId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Obaveštenje kreirano",
        announcement_id: this.lastID,
      });
    }
  );
};


exports.getAllAnnouncements = (req, res) => {
  db.all(
    `SELECT a.announcement_id,
            a.title,
            a.content,
            a.created_at,
            u.first_name || ' ' || u.last_name AS author
     FROM announcements a
     JOIN users u ON a.author_id = u.user_id
     ORDER BY a.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};
exports.updateAnnouncement = (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content)
    return res.status(400).json({ message: "Nedostaju podaci" });

  db.run(
    `UPDATE announcements 
     SET title = ?, content = ? 
     WHERE announcement_id = ?`,
    [title, content, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ message: "Obaveštenje nije pronađeno" });
      }

      // Vrati ažurirano obaveštenje
      db.get(
        `SELECT a.announcement_id,
                a.title,
                a.content,
                a.created_at,
                u.first_name || ' ' || u.last_name AS author
         FROM announcements a
         JOIN users u ON a.author_id = u.user_id
         WHERE a.announcement_id = ?`,
        [id],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        }
      );
    }
  );
};

exports.deleteAnnouncement = (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM announcements WHERE announcement_id = ?`,
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ message: "Obaveštenje nije pronađeno" });
      }

      res.json({ 
        message: "Obaveštenje uspešno obrisano",
        announcement_id: id 
      });
    }
  );
};
