const bcrypt = require("bcrypt");
const db = require("../config/db");

const SALT_ROUNDS = 10;


const PASSWORD_MAP = {
  hashed_admin_pass: "admin123",
  hashed_pass: "password123",
};

db.serialize(() => {
  db.all("SELECT user_id, password FROM users", async (err, users) => {
    if (err) {
      console.error("❌ Greška pri čitanju korisnika:", err.message);
      process.exit(1);
    }

    for (const user of users) {
      const plainPassword = PASSWORD_MAP[user.password];

     
      if (!plainPassword) continue;

      const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);

      db.run(
        "UPDATE users SET password = ? WHERE user_id = ?",
        [hashed, user.user_id],
        (err) => {
          if (err) {
            console.error("❌ Greška pri update lozinke:", err.message);
          }
        }
      );
    }

    console.log("✅ Sve seed lozinke su hash-ovane");
  });
});
