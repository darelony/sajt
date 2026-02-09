const bcrypt = require("bcrypt");
const db = require("../config/db");

const SALT_ROUNDS = 10;
const ADMIN_EMAIL = "admin@fakultet.rs";
const NEW_PASSWORD = "admin123";

(async () => {
  try {
    const hash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

    db.run(
      "UPDATE users SET password = ? WHERE email = ?",
      [hash, ADMIN_EMAIL],
      function (err) {
        if (err) console.error("❌ Greška pri update lozinke:", err.message);
        else console.log("✅ Admin password resetovan!");
        db.close();
      }
    );
  } catch (err) {
    console.error(err);
    db.close();
  }
})();
