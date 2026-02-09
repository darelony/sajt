const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "database.db");
const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");

if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("🗑️ Stara baza obrisana");
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
     db.run("PRAGMA foreign_keys = ON");

    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema, (err) =>{
        if (err){
           console.error("❌ Greška u schema.sql:", err.message);
      process.exit(1);
    }
    console.log("✅ Schema kreirana");

   const seed = fs.readFileSync(seedPath, "utf8");
    db.exec(seed, (err) => {
      if (err) {
        console.error("❌ Greška u seed.sql:", err.message);
        process.exit(1);
      }
      console.log("🌱 Seed podaci ubačeni");
     });
    });
});

db.close(() =>{
    console.log("🔒 Konekcija zatvorena");
});