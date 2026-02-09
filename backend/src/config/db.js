const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../database/database.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if(err) {
        console.log("❌ Greška pri konekciji na bazu:", err.message);
    }else {
        console.log("✅ SQLite baza povezana");
    }
});

db.run("PRAGMA forign_keys = ON");

module.exports = db;