const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./src/database/database.db");

const SALT_ROUNDS = 10;
const PASSWORD = "password123"; 

db.serialize(() => {
  db.all("SELECT user_id, role FROM users WHERE role != 'ADMIN'", async (err, users) => {
    if (err) throw err;

    for (const user of users) {
      const hashed = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

      db.run("UPDATE users SET password = ? WHERE user_id = ?", [hashed, user.user_id]);
    }

    console.log("✅ Svi profesori i studenti sada imaju ispravan hash.");
  });
});
