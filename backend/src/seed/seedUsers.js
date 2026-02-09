const db = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function seed() {
  const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
  const defaultPassword = await bcrypt.hash("password123", SALT_ROUNDS);

  db.serialize(() => {
    console.log("🧹 Brisanje postojece baze...");
    db.run("DELETE FROM users");

    console.log("👑 Admin...");
    db.run(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      ["Admin", "Adminovic", "admin@fakultet.rs", adminPassword, "ADMIN"]
    );

    console.log("🎓 Profesori...");
    const professors = [
      ["Marko", "Petrovic", "marko.petrovic@fakultet.rs"],
      ["Jelena", "Ilic", "jelena.ilic@fakultet.rs"],
      ["Nikola", "Jovanovic", "nikola.jovanovic@fakultet.rs"],
      ["Ana", "Milosevic", "ana.milosevic@fakultet.rs"],
      ["Ivan", "Stankovic", "ivan.stankovic@fakultet.rs"],
      ["Marija", "Popovic", "marija.popovic@fakultet.rs"],
      ["Stefan", "Kovacevic", "stefan.kovacevic@fakultet.rs"],
      ["Milica", "Tomic", "milica.tomic@fakultet.rs"],
      ["Nenad", "Pavlovic", "nenad.pavlovic@fakultet.rs"],
      ["Ivana", "Djordjevic", "ivana.djordjevic@fakultet.rs"],
    ];

    professors.forEach((p) => {
      db.run(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES (?, ?, ?, ?, 'PROFESSOR')`,
        [...p, defaultPassword]
      );
    });

    console.log("📚 Studenti (50, razdvojeni smerovi)...");

    const majors = ["IT", "SI", "RN"];
    let index = 1;

    for (let i = 1; i <= 50; i++) {
      const major = majors[i % 3];
      const year = (i % 4) + 1;

      db.run(
        `INSERT INTO users
         (first_name, last_name, email, password, role, index_no, major, year)
         VALUES (?, ?, ?, ?, 'STUDENT', ?, ?, ?)`,
        [
          `Student${i}`,
          `Prezime${i}`,
          `student${i}@fakultet.rs`,
          defaultPassword,
          `20${20 + year}/${String(index).padStart(3, "0")}`,
          major,
          year,
        ]
      );

      index++;
    }

    console.log("✅ SEED ZAVRŠEN");
  });
}

seed().then(() => {
  console.log("🚀 Gotovo");
  process.exit(0);
});
