const db = require("./src/config/db");
const bcrypt = require("bcrypt");

(async () => {
  const plainPassword = "admin123";
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log("📂 FIX SCRIPT DB FILE:", db.filename);

  db.run(
    "UPDATE users SET password = ? WHERE email = ?",
    [hash, "admin@fakultet.rs"],
    function (err) {
      if (err) {
        console.error("❌ Update error:", err.message);
      } else {
        console.log("✅ Admin password reset SUCCESS");
        console.log("📧 admin@fakultet.rs");
        console.log("🔑 admin123");
      }
      process.exit(0);
    }
  );
})();
